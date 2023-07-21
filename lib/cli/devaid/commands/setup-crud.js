
const chalk                    = require('chalk');
const path                     = require('path');
const jsbeautify              =require('js-beautify');

const helper                   = require('../../../helpers');
const serversetup              = require('./setup-server');


const setupcrud = {
    //
    // constants for setup crud
    //
    cst: {
        mongodb: {
            dataType: {
                enums: [
                    'String',              'Number',                'Boolean',
                    'Date',                'Array',                 'Object',
                    { name: 'ObjectId', hint: '\tThis will setup reference to another model, and will store id of referenced model in database.'},
                    { name: 'Image', hint: '\tThis will setup image upload functionality, and will store image path as string in database.'},
                    { name: 'MultiImage', hint: 'This will setup multiple image upload functionality, and will store image paths as array in database.'},
                    'Point',               'Polygon',               'Decimal128',          'BigInt',
                    /* 'UUID',                'Buffer',                'Map',                 'Mixed', */
                ],
                disabledIdxStart: -1,
            },
        }
    },


    //
    // function to get schema details
    //
    getSchema: async ({ database, models }, root = {}, inType = 'Object', depth = 0, prefix = '') => {
        if (inType === 'Array' && root.toString()) return root;

        let variableName;
        if (inType !== 'Array') {
            variableName = await helper.cli.getVariableName({ name: 'variableName', hint: `${prefix ? ` | ${prefix}` : `'root'`}->(::enter variable name) | e.g. fooBar | enter -1 to exit` });
            
            if (Object.keys(root).includes(variableName)) {
                console.log(' ', helper.csts.PREFIX_MSG_ERR, chalk.red.bold('Schema must have unique keys.'));
                return await setupcrud.getSchema({ database, models }, root, inType, depth, prefix);
            }
            
            if (+variableName === -1) {
                if (Object.keys(root).length === 0 && depth === 0) {
                    console.log(' ', helper.csts.PREFIX_MSG_ERR, chalk.red.bold('Schema must have atleast one key.'));
                    return await setupcrud.getSchema({ database, models }, root, inType, depth, prefix);
                } else {
                    return root;
                }
            }
        }

        let dataType = await helper.cli.getInputBySelectChoice({
            name: 'dataType',
            choices: setupcrud.cst[database].dataType,
            hint: (prefix ? `${prefix}${variableName ? `->'${variableName}'` : ''}` : `'${variableName}'`) + `->(::select datatype) | press up/down arrow to select datatype`,
            //? Todo: implement autocomplete
            // isAutoComplete: true, 
        });
        let refModel = null;
        if (dataType === 'ObjectId') {
            refModel = await helper.cli.getInputBySelectChoice({
                name: 'refModel',
                choices: { enums: models, disabledIdxStart: -1 },
                hint: (prefix ? `${prefix}${variableName ? `->'${variableName}'` : ''}` : `'${variableName}'`) + `->(::select reference model) | press up/down arrow to select reference model`,
            });
        } if (dataType === 'Array') {
            if (inType === 'Array') 
                root.push(await setupcrud.getSchema({ database, models }, [], 'Array', (depth + 1), `${prefix}->[]`));
            else 
                root[variableName] = await setupcrud.getSchema({ database, models }, [], 'Array', (depth + 1), `${prefix ? `->${prefix}` : '' }'${variableName}'->[]`);
                
            return await setupcrud.getSchema({ database, models }, root, inType, (depth + 1), prefix);

        } else if (dataType === 'Object') {
            if (Array.isArray(root)) 
                root.push(await setupcrud.getSchema({ database, models }, {}, 'Object', (depth + 1), `${prefix}->{}`));
            else 
                root[variableName] = await setupcrud.getSchema({ database, models }, {}, 'Object', (depth + 1), `${prefix ? `->${prefix}` : '' }'${variableName}'->{}`);
            
            return await setupcrud.getSchema({ database, models }, root, inType, (depth + 1), prefix);
        }

        dataType = dataType === 'ObjectId' ? `${dataType}__${refModel}` : dataType
        
        if (inType === 'Array') return [dataType];
        
        root[variableName] = dataType;

        return await setupcrud.getSchema({ database, models }, root, inType, (depth + 1), prefix);
    },


    //
    // function to generate model from schema
    //
    generateModel: (schema) => {
        if (typeof schema !== 'object') {
            if (schema.startsWith('ObjectId')) 
                return { type: 'Schema.Types.ObjectId', ref: `'${schema.split('__')[1]}'`, required: true }

            if (['String', 'Number', 'Boolean', 'Date', 'Decimal128', 'BigInt', 'UUID'].includes(schema))
                return { type: `Schema.Types.${schema}`, required: true }

            else if (['Polygon', 'Point'].includes(schema))
                return {
                    type: { type: 'String', enum: [`'Point'`], default: `'Point'` },
                    coordinates: { ...(schema === 'Point' ? { type: ['Number'] } : { type: [[['Number']]] }), required: true },
                }

            else if (schema === 'Image')
                return { type: 'String', required: true }

            else if (schema === 'MultiImage')
                return { type: [{ 
                    src: { type: 'String', required: true },
                    alt: { type: 'String' },
                }], required: true }

            return { type: `Schema.Types.${schema}`, required: true }
        }
        
        if (Array.isArray(schema)) 
            return schema.map(item => setupcrud.generateModel(item));
    
        const model = {};
        for (const key in schema) {
            model[key] = setupcrud.generateModel(schema[key]);
        }
        return model;
    },


    //
    // function to generate Joi schema
    //
    joiCsts: {
        String: `Joi.string().required()`,
        Number: `Joi.number().required()`,
        Boolean: `Joi.boolean().required()`,
        Date: `Joi.date().required()`,
        // Array: `Joi.array().required()`,
        // Object: `Joi.object().required()`,
        ObjectId: `Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid ID').required()`,
        Image: `Joi.string().required()`,
        MultiImage: `Joi.array().items(Joi.object({src: Joi.string().required(),alt: Joi.string().required()})).required()`,
        Point: `Joi.object({type: Joi.string().required(),coordinates: Joi.array().items(Joi.number().required()).length(2).required()}).required()`,
        Polygon: `Joi.object({type: Joi.string().required(),coordinates: Joi.array().items(Joi.array().items(Joi.number().required())).required()}).required()`,
        Decimal128: `Joi.number().required()`,
        BigInt: `Joi.number().required()`
    },
    generateJoiSchema: (schema) => {
        if (typeof schema !== 'object') 
            return setupcrud.joiCsts[schema.split('__')[0]];
        
        if (Array.isArray(schema))
            return `Joi.array().items(${setupcrud.generateJoiSchema(schema[0])}).required()`;
    
        const model = {};
        for (const key in schema) {
            model[key] = setupcrud.generateJoiSchema(schema[key]);
        }
        return `Joi.object(${JSON.stringify(model)}).required()`;
    },


    //
    // action for setup crud
    //
    action: async (options) => {
        try {
            
            //! check if project is ready for crud setup
            const pathToRootDir = path.join(process.cwd());
            const rootLevelDirs = helper.fs.readDir({ path: pathToRootDir });
            if (!['controllers', 'routes', 'models', 'helpers'].every(dir => rootLevelDirs.includes(dir))) {
                console.log(' ', helper.csts.PREFIX_MSG_ERR, chalk.red.bold(`This command must be run from root directory of project.\n`));
                console.log('  ', chalk.blue.bold(`# Lookup failed for directories: 'controllers', 'routes', 'models', 'helpers'.\n`));
                console.log(' ', helper.csts.PREFIX_MSG_INFO, chalk.green.bold(`Reasons why this error might have occured:\n`));
                console.log('  ', chalk.blue.bold(`1. You might have run this command from a directory other than root directory of project.`));
                console.log('  ', chalk.blue.bold(`2. You might have deleted/renamed/moved directories from root directory of project.`));
                console.log('  ', chalk.blue.bold(`3. You might have not created project using 'devaid setup-server' or 'devaid ss' command.\n`));
                return process.exit(helper.csts.ERROR_EXIT);
            }

            //! reminder to update postman.collection.json with latest changes
            console.log(`  ${chalk.cyan.bold(`After executing this command, the 'postman.collection.json' file will be updated with code that includes the CRUD folder.\n  Therefore, please ensure that you have the most recent version of your Postman collection exported as a JSON file, and the collection version should be 'Collection v2.1'.`)}\n`);
            const isConfirmed = await helper.cli.getConfirmation({ message: `Have you updated 'postman.collection.json' with latest changes? (Y/N): ` });
            if (!isConfirmed) {
                console.log(`\n ${chalk.yellow(helper.csts.PREFIX_MSG)}'Please update 'postman.collection.json' with latest changes and try again!' \n`);
                return process.exit(helper.csts.SUCCESS_EXIT);
            }
            console.log('');

            //! get project details
            const pathToDevaidJSON = path.join(pathToRootDir, '.devaid.json')
            let devaidJSON = helper.fs.readFile({ path: pathToDevaidJSON });
            const intake = await serversetup.getProjectDetails({ info: devaidJSON ? JSON.parse(devaidJSON) : {} });
            if (!Array.isArray(intake.dbmodels)) intake.dbmodels = [];
            
            // //! get crud name in kebab-case by prompting user
            intake.crudName = await helper.cli.getInputInKebabCase({ name: 'crudName', message: 'CRUD Name' });
            intake.crudNameCase = helper.cli.toAllCaseFormats(intake.crudName);

            //! get schema details by prompting user
            //! get key name for schema
            intake.schema = await setupcrud.getSchema({ database: intake.database, models: intake.dbmodels });
            intake.joiSchema = setupcrud.generateJoiSchema(intake.schema).replace(/\\*"/g, '');
            intake.joiSchemaWithRequired =
                jsbeautify(intake.joiSchema, { indent_size: 2 })
                    .replace(/^Joi\.object\(\{/, '')
                    .replace(/\n\}\)\.required\(\)$/, ',')
                    .replace(/  \S/g, '    $&');
            intake.joiSchemaWithoutRequired = 
                jsbeautify(intake.joiSchema, { indent_size: 2 })
                    .replace(/\.required\(\),/g, ',')
                    .replace(/^Joi\.object\(\{/, '')
                    .replace(/\.required\(\)\n\}\)\.required\(\)$/, ',')
                    .replace(/  \S/g, '    $&');
            intake.model = { ...setupcrud.generateModel(intake.schema), isActive: { type: 'Schema.Types.Boolean', default: true, required: true } };
            intake.model = JSON.stringify(intake.model, null, 2).replace(/"/g, '').replace(/\n  /g, '\n    ').replace(/\n\}/g, '\n  }');
            
            //! get directory structure for project
            const pathToSkeleton = path.join(__dirname, `../../../resources/skeleton/nodejs/${intake.framework}/${intake.database}/${intake.language}/${intake.boilerplate}/crud`);
            const dirs = await helper.fs.getDirsToCreate({ pathToSkeleton, ignoreExists: ['controllers', 'models', 'routes'], replace: { crudName: intake.crudNameCase.dottedSnackCase } });
            if (!dirs) return process.exit(helper.csts.SUCCESS_EXIT);
            
            //! create project directory and files
            helper.fs.createDirAndFiles({ dirs: dirs, locals: { ...intake } });


            //! log success message and instructions
            console.log(`\n${helper.csts.PREFIX_MSG_SUCCESS}${chalk.green('CRUD files created successfully!')}`);

            console.log(`\n${helper.csts.PREFIX_MSG_INFO}${chalk.green('Steps to test CRUD:')}`);
            console.log(`  ${chalk.blue.bold(`1. copy all content from 'postman.collection.json' file located at root of the project`)}`);
            console.log(`  ${chalk.blue.bold(`2. open postman and click on 'Import' button and paste the copied content`)}`);
            console.log(`  ${chalk.blue.bold(`3. open ${intake.crudNameCase.kebabCase} folder`)}`);
            console.log(`  ${chalk.blue.bold(`4. you can start testing CRUD by executing requests in the order they are listed`)}`);
 
            console.log(`\n${helper.csts.PREFIX_MSG}${chalk.green('Happy coding :)')}\n`);
             
            //! update .devaid.json file
            intake.dbmodels.push(intake.crudNameCase.pascalCase); 
            helper.fs.writeFile({ path: pathToDevaidJSON, content: JSON.stringify({ framework: intake.framework, database: intake.database, language: intake.language, boilerplate: intake.boilerplate, dbmodels: intake.dbmodels }, null, 2) });
             
            //! exit process
            process.exit(helper.csts.SUCCESS_EXIT);
        } catch (error) {
            helper.cli.catchExit(error);  
        }
    }
}


module.exports = setupcrud;
