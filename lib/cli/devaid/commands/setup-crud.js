
const chalk                    = require('chalk');
const path                    = require('path');


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
                    { name: 'Image', hint: '\tThis will setup image upload functionality, and will store image path as string in database.'},
                    { name: 'MultiImage', hint: 'This will setup multiple image upload functionality, and will store image paths as array in database.'},
                    'Point',               'Polygon',               /* 'Buffer', */
                    'ObjectId',            'Decimal128',            'BigInt',
                    'UUID',                /* 'Map',                   'Mixed', */
                ],
                disabledIdxStart: -1,
            },
        }
    },


    //
    // function to get schema details
    //
    getSchema: async ({ database }, root = {}, inType = 'Object', depth = 0, prefix = '') => {
        if (inType === 'Array' && root.toString()) return root;

        let variableName;
        if (inType !== 'Array') {
            variableName = await helper.cli.getVariableName({ name: 'variableName', hint: `${prefix ? ` | ${prefix}` : `'root'`}->(::enter variable name) | e.g. fooBar | enter -1 to exit` });
            
            if (Object.keys(root).includes(variableName)) {
                console.log(' ', helper.csts.PREFIX_MSG_ERR, chalk.red.bold('Schema must have unique keys.'));
                return await setupcrud.getSchema({ database }, root, inType, depth, prefix);
            }
            
            if (+variableName === -1) {
                if (Object.keys(root).length === 0 && depth === 0) {
                    console.log(' ', helper.csts.PREFIX_MSG_ERR, chalk.red.bold('Schema must have atleast one key.'));
                    return await setupcrud.getSchema({ database }, root, inType, depth, prefix);
                } else {
                    return root;
                }
            }
        }

        const dataType = await helper.cli.getInputBySelectChoice({
            name: 'dataType',
            choices: setupcrud.cst[database].dataType,
            startUnavailableIndex: -1,
            hint: (prefix ? `${prefix}${variableName ? `->'${variableName}'` : ''}` : `'${variableName}'`) + `->(::select datatype) | press up/down arrow to select datatype`,
            //? Todo: implement autocomplete
            // isAutoComplete: true, 
        });
        
        
        if (dataType === 'Array') {
            if (inType === 'Array') 
                root.push(await setupcrud.getSchema({ database }, [], 'Array', (depth + 1), `${prefix}->[]`));
            else 
                root[variableName] = await setupcrud.getSchema({ database }, [], 'Array', (depth + 1), `${prefix ? `->${prefix}` : '' }'${variableName}'->[]`);
                
            return await setupcrud.getSchema({ database }, root, inType, (depth + 1), prefix);

        } else if (dataType === 'Object') {
            if (Array.isArray(root)) 
                root.push(await setupcrud.getSchema({ database }, {}, 'Object', (depth + 1), `${prefix}->{}`));
            else 
                root[variableName] = await setupcrud.getSchema({ database }, {}, 'Object', (depth + 1), `${prefix ? `->${prefix}` : '' }'${variableName}'->{}`);
            
            return await setupcrud.getSchema({ database }, root, inType, (depth + 1), prefix);
        }

        if (inType === 'Array') return [dataType];
        
        root[variableName] = dataType;

        return await setupcrud.getSchema({ database }, root, inType, (depth + 1), prefix);
    },


    //
    // function to generate model from schema
    //
    generateModel: (schema) => {
        if (typeof schema !== 'object') {
            if (['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Decimal128', 'BigInt', 'UUID'].includes(schema))
                return { type: schema, required: true }

            else if (['Polygon', 'Point'].includes(schema))
                return {
                    type: { type: 'String', enum: ['Point'], default: 'Point' },
                    coordinates: { ...(schema === 'Point' ? { type: ['Number'] } : { type: [[['Number']]] }), required: true },
                }

            else if (schema === 'Image')
                return { type: 'String', required: true }

            else if (schema === 'MultiImage')
                return { type: [{ 
                    src: { type: 'String', required: true },
                    alt: { type: 'String' },
                }], required: true }

            return { type: schema, required: true }
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
    // action for setup crud
    //
    action: async (options) => {
        try {
            
            //! check if project is ready for crud setup
            const pathToRootDir = path.join(process.cwd());
            const rootLevelDirs = helper.fs.readDir({ path: pathToRootDir });
            if (!['controllers', 'routes', 'models', 'helpers'].every(dir => rootLevelDirs.includes(dir))) {
                console.log(' ', helper.csts.PREFIX_MSG_ERR, chalk.red.bold(`This command must be run from root directory of project.\n\n`));
                console.log(' ', helper.csts.PREFIX_MSG_INFO, chalk.green.bold(`Reasons why this error might have occured:\n`));
                console.log(' ', helper.csts.PREFIX_MSG_INFO, chalk.blue.bold(`1. You might have run this command from a directory other than root directory of project.\n`));
                console.log(' ', helper.csts.PREFIX_MSG_INFO, chalk.blue.bold(`2. You might have deleted/renamed/moved directories from root directory of project.\n`));
                console.log(' ', helper.csts.PREFIX_MSG_INFO, chalk.blue.bold(`3. You might have not created project using 'devaid setup-server' or 'devaid ss' command.\n`));
                return process.exit(helper.csts.ERROR_EXIT);
            }

            //! get project details
            const devaidJSON = helper.fs.readFile({ path: path.join(pathToRootDir, '.devaid.json')});
            const projectInfo = await serversetup.getProjectDetails({ info: (devaidJSON ? JSON.parse(devaidJSON) : {}) });
            
            // //! get crud name in kebab-case by prompting user
            const crudName = await helper.cli.getInputInKebabCase({ name: 'crudName', message: 'CRUD Name' });
            const crudNameCase = helper.cli.toAllCaseFormats(crudName);

            //! get schema details by prompting user
            //! get key name for schema
            const schema = await setupcrud.getSchema({ database: projectInfo.database });
            const model = setupcrud.generateModel(schema);

            //! get directory structure for project
            const pathToSkeleton = path.join(__dirname, `../../../resources/skeleton/nodejs/${projectInfo.framework}/${projectInfo.database}/${projectInfo.language}/${projectInfo.boilerplate}/crud`);
            const dirs = await helper.fs.getDirsToCreate({ pathToSkeleton, ignoreExists: ['/controllers', '/models', '/routes'] });
            if (!dirs) return process.exit(helper.csts.SUCCESS_EXIT);

            
            console.log(
                '',
                projectInfo,
                JSON.stringify(schema, null, 4),
                JSON.stringify(setupcrud.generateModel(schema), null, 4),
            )

            //! update .devaid.json file
        } catch (error) {
            helper.cli.catchExit(error);  
        }
    }
}


module.exports = setupcrud;