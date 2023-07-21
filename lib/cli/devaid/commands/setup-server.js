
const path                     = require('path');
const chalk                    = require('chalk');


const helper                   = require('../../../helpers');



const setupserver = {
    //
    // constants for setup server
    //
    cst: {
        language: {
            enums: ['javascript', 'typescript'],
            disabledIdxStart: 1,
        },
        framework: {
            enums: ['express', 'nestjs', 'fastify'],
            disabledIdxStart: 1,
        },
        database: {
            enums: ['mongodb', 'postgres'],
            disabledIdxStart: 1,
        },
        boilerplate: {
            mongodb: {
                enums: ['1.0', '2.0', '3.0', '4.0'],
                disabledIdxStart: 1,
            },
            postgres: {
                enums: ['1.0', '2.0', '3.0', '4.0'],
                disabledIdxStart: 1,
            },
        },
    },


    //
    // function to get project details, e.g. language, framework, database, boilerplate, projectName
    //
    getProjectDetails: async ({ info = {} } = {}) => {
        const intake = { ...info };
        for (const input of ['language', 'framework', 'database', 'boilerplate']) {
            if (intake[input]) continue;
            intake[input] = await helper.cli.getInputBySelectChoice({
                name: input,
                choices: input === 'boilerplate' ? setupserver.cst.boilerplate[intake['database']] : setupserver.cst[input],
            });
        }
        return intake;
    },


    //
    // action for setup server
    //
    action: async (options) => {
        try {

            //! get project details by prompting user
            const intake = await setupserver.getProjectDetails({ info: options});


            //! get project name in kebab-case by prompting user
            intake.projectName = await helper.cli.getInputInKebabCase({ name: 'projectName' });
            intake.projectNameCase = helper.cli.toAllCaseFormats(intake.projectName);
            const projectDir = path.join(process.cwd(), intake.projectName);

            if (helper.fs.isDirExists({ path: projectDir })) {
                console.log(`\n ${helper.csts.PREFIX_MSG_WARNING}Project directory already exists, path: ${chalk.yellow(projectDir)} \n`);
            
                const isConfirmed = await helper.cli.getConfirmation({ message: 'Do you want to overwrite existing project? (Y/N)' });
                if (!isConfirmed) {
                    console.log(`\n ${chalk.yellow(helper.csts.PREFIX_MSG)}'Please try again with different project name or change directory!' \n`);
                    process.exit(helper.csts.ERROR_EXIT);
                }
            }


            //! get directory structure for project
            const pathToSkeleton = path.join(__dirname, `../../../resources/skeleton/nodejs/${intake.framework}/${intake.database}/${intake.language}/${intake.boilerplate}/server`);
            const dirs = await helper.fs.getDirsToCreate({ pathToSkeleton, root: projectDir });
            if (!dirs) return process.exit(helper.csts.SUCCESS_EXIT);

            //! create project directory and files
            helper.fs.createDirAndFiles({ rootdir: intake.projectName, dirs: dirs, locals: { ...intake } });


            //! log success message and instructions
            console.log(`\n${helper.csts.PREFIX_MSG_SUCCESS}${chalk.green('Project created successfully!')}`);

            console.log(`\n${helper.csts.PREFIX_MSG_INFO}${chalk.green('Run following commands to start the server:')}`);
            console.log(`  ${chalk.blue.bold(`1. cd ${intake.projectName}`)}`);
            console.log(`  ${chalk.blue.bold('2. npm install')}`);
            console.log(`  ${chalk.blue.bold(`3. mv .env.example .env`)}`);
            console.log(`  ${chalk.blue.bold(`4. open .env file and fill out the variables`)}`);
            console.log(`  ${chalk.blue.bold('5. npm run dev')}`);

            console.log(`\n${helper.csts.PREFIX_MSG_INFO}${chalk.green('Steps to setup postman collection:')}`);
            console.log(`  ${chalk.blue.bold(`1. copy all content from 'postman.collection.json' file located at root of the project`)}`);
            console.log(`  ${chalk.blue.bold(`2. open postman and click on import button and paste the copied content`)}`);
            console.log(`  ${chalk.blue.bold(`3. go to variables tab, fill out the variables in current value column`)}`);
            console.log(`  ${chalk.blue.bold(`4. go to environment and add new environment with name of the project (this will be used to set token in header)`)}`);
            console.log(`  ${chalk.blue.bold(`5. test server by running 'backend server check' request in postman`)}`);

            console.log(`\n${helper.csts.PREFIX_MSG}${chalk.green('Happy coding :)')}\n`);


            //! exit process
            process.exit(helper.csts.SUCCESS_EXIT);
        } catch (error) {
            helper.cli.catchExit(error);  
        }
    }
}

module.exports = setupserver;