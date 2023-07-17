
const chalk                    = require('chalk');

const helper                   = require('../../../helpers');
const serversetup              = require('./setup-server');


const setupcrud = {
    //
    // constants for setup crud
    //
    cst: {
        dataType: {
            enums: [
                'String',              'Number',                'Boolean',
                'Date',                'Array',                 'Object |Schema|',
                { name: 'Image |String|', hint: 'This will setup image upload functionality, and will store image path in database.'},
                'Point |GeoJSON|',     'Polygon |GeoJSON|',     'Buffer',
                'ObjectId',            'Decimal128',            'BigInt',
                'UUID',                /* 'Map',                   'Mixed', */
            ],
            disabledIdxStart: -1,
        },
    },


    //
    // function to get schema details
    //
    getSchema: async (root = {}, inType = 'Object |Schema|', depth = 0, prefix = '') => {
        if (inType === "Array" && root.toString()) return root;

        let variableName;
        if (inType !== 'Array') {
            variableName = await helper.cli.getVariableName({ name: 'variableName', hint: `${prefix ? ` | ${prefix}` : `'root'`}->(::enter variable name) | e.g. fooBar | enter -1 to exit` });
            
            if (Object.keys(root).includes(variableName)) {
                console.log(' ', helper.csts.PREFIX_MSG_ERR, chalk.red.bold('Schema must have unique keys.'));
                return await setupcrud.getSchema(root, inType, depth, prefix);
            }
            
            if (+variableName === -1) {
                if (Object.keys(root).length === 0 && depth === 0) {
                    console.log(' ', helper.csts.PREFIX_MSG_ERR, chalk.red.bold('Schema must have atleast one key.'));
                    return await setupcrud.getSchema(root, inType, depth, prefix);
                } else {
                    return root;
                }
            }
        }

        const dataType = await helper.cli.getInputBySelectChoice({
            name: 'dataType',
            choices: setupcrud.cst.dataType,
            startUnavailableIndex: -1,
            hint: (prefix ? `${prefix}${variableName ? `->'${variableName}'` : ''}` : `'${variableName}'`) + `->(::select datatype) | press up/down arrow to select datatype`,
            //? Todo: implement autocomplete
            // isAutoComplete: true, 
        });
        
        
        if (dataType === 'Array') {
            if (inType === 'Array') 
                root.push(await setupcrud.getSchema([], 'Array', (depth + 1), `${prefix}->[]`));
            else 
                root[variableName] = await setupcrud.getSchema([], 'Array', (depth + 1), `${prefix ? `->${prefix}` : '' }'${variableName}'->[]`);
                
            return await setupcrud.getSchema(root, inType, (depth + 1), prefix);

        } else if (dataType === 'Object |Schema|') {
            if (Array.isArray(root)) 
                root.push(await setupcrud.getSchema({}, 'Object |Schema|', (depth + 1), `${prefix}->{}`));
            else 
                root[variableName] = await setupcrud.getSchema({}, 'Object |Schema|', (depth + 1), `${prefix ? `->${prefix}` : '' }'${variableName}'->{}`);
            
            return await setupcrud.getSchema(root, inType, (depth + 1), prefix);
        }

        if (inType === 'Array') return [dataType];
        
        root[variableName] = dataType;

        return await setupcrud.getSchema(root, inType, (depth + 1), prefix);
    },


    //
    // action for setup crud
    //
    action: async (options) => {
        try {

            const projectInfo = await serversetup.getProjectDetails(options);

            //! get crud name in kebab-case by prompting user
            const crudName = await helper.cli.getInputInKebabCase({ name: 'crudName', message: 'CRUD Name' });
            const crudNameCase = helper.cli.toAllCaseFormats(crudName);

            //! get schema details by prompting user
            //! get key name for schema
            const schema = await setupcrud.getSchema();

            console.log(
                '',
                JSON.stringify(schema, null, 4)
            )
        } catch (error) {
            helper.cli.catchExit(error);  
        }
    }
}


module.exports = setupcrud;