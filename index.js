import fs from "fs";
import path from "path";
import chalk from "chalk";
import boxen from "boxen";
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const log = console.log;

// Accessing arguments 
const args = process.argv;

// The "index.js" is 8 characters long 
// so -8 removes last 8 characters 
const currentWorkingDirectory = args[1].slice(0, -8);

const scriptFileName = path.basename(__filename);

const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "singleDouble",
    borderColor: "green",
    backgroundColor: "#555555"
};

if (fs.existsSync(currentWorkingDirectory + 'todo.txt') === false) {
    let createStream = fs.createWriteStream('todo.txt');
    createStream.end();
}
if (fs.existsSync(currentWorkingDirectory + 'done.txt') === false) {
    let createStream = fs.createWriteStream('done.txt');
    createStream.end();
}

const InfoFunction = () => {
    const UsageText = ` 
$ node ${scriptFileName} add "Поставленная задача"      # Добавить новую задачу
$ node ${scriptFileName} ls                             # Показать список невыполненных задач
$ node ${scriptFileName} del NUMBER                     # Удалить задачу
$ node ${scriptFileName} done NUMBER                    # Пометить задачу как выполенную
$ node ${scriptFileName} help, -h, --help               # Отобразить данную аннатацию
$ node ${scriptFileName} report                         # Вывести статистику`;

    const greeting = chalk.white.bold(UsageText);
    const msgBox = boxen(greeting, { ...boxenOptions, title: 'Использование' });

    log(msgBox);

};

const listFunction = () => {

    // Create a empty array 
    let data = [];

    // Read from todo.txt and convert it 
    // into a string 
    const fileData = fs.readFileSync(
        currentWorkingDirectory + 'todo.txt')
        .toString();

    // Split the string and store into array 
    data = fileData.split('\n');

    // Filter the string for any empty lines in the file 
    let filterData = data.filter(function (value) {
        return value !== '';
    });

    if (filterData.length === 0) {
        log('There are no pending todos!');
    }

    for (let i = 0; i < filterData.length; i++) {
        log((filterData.length - i) + '. '
            + filterData[i]);
    }
};

const addFunction = () => {

    // New todo string argument is stored 
    const newTask = args[3];

    // If argument is passed 
    if (newTask) {

        // Create a empty array 
        let data = [];

        // Read the data from file todo.txt and 
        // convert it in string 
        const fileData = fs
            .readFileSync(currentWorkingDirectory + 'todo.txt')
            .toString();

        // New task is added to previous data 
        fs.writeFile(
            currentWorkingDirectory + 'todo.txt',
            newTask + '\n' + fileData,

            function (err) {

                // Handle if there is any error 
                if (err) throw err;

                // Logs the new task added 
                log('Added todo: "' + newTask + '"');
            },
        );
    } else {

        // If argument was no passed 
        log('Error: Missing todo string. Nothing added!');
    }
};


const deleteFunction = () => {

    // Store which index is passed 
    const deleteIndex = args[3];

    // If index is passed 
    if (deleteIndex) {

        // Create a empty array 
        let data = [];

        // Read the data from file and convert 
        // it into string 
        const fileData = fs
            .readFileSync(currentWorkingDirectory + 'todo.txt')
            .toString();

        data = fileData.split('\n');

        // Filter the data for any empty lines 
        let filterData = data.filter(function (value) {
            return value !== '';
        });

        // If delete index is greater than no. of task 
        // or less than zero 
        if (deleteIndex > filterData.length || deleteIndex <= 0) {
            log(
                'Error: todo #' + deleteIndex
                + ' does not exist. Nothing deleted.',
            );
        } else {

            // Remove the task 
            filterData.splice(filterData.length - deleteIndex, 1);

            // Join the array to form a string 
            const newData = filterData.join('\n');

            // Write the new data back in file 
            fs.writeFile(
                currentWorkingDirectory + 'todo.txt',
                newData,
                function (err) {
                    if (err) throw err;

                    // Logs the deleted index 
                    log('Deleted todo #' + deleteIndex);
                },
            );
        }
    } else {

        // Index argument was no passed 
        log(
            'Error: Missing NUMBER for deleting todo.');
    }
};


const doneFunction = () => {

    // Store the index passed as argument 
    const doneIndex = args[3];

    // If argument is passed 
    if (doneIndex) {

        // Empty array 
        let data = [];

        // Create a new date object 
        let dateobj = new Date();

        // Convert it to string and slice only the 
        // date part, removing the time part 
        let dateString = dateobj.toISOString().substring(0, 10);

        // Read the data from todo.txt 
        const fileData = fs
            .readFileSync(currentWorkingDirectory + 'todo.txt')
            .toString();

        // Read the data from done.txt 
        const doneData = fs
            .readFileSync(currentWorkingDirectory + 'done.txt')
            .toString();

        // Split the todo.txt data 
        data = fileData.split('\n');

        // Filter for any empty lines 
        let filterData = data.filter(function (value) {
            return value !== '';
        });

        // If done index is greater than no. of task or <=0 
        if (doneIndex > filterData.length || doneIndex <= 0) {
            log('Error: todo #'
                + doneIndex + ' does not exist.');
        } else {

            // Delete the task from todo.txt 
            // data and store it 
            const deleted = filterData.splice(
                filterData.length - doneIndex, 1);

            // Join the array to create a string 
            const newData = filterData.join('\n');

            // Write back the data in todo.txt 
            fs.writeFile(
                currentWorkingDirectory + 'todo.txt',
                newData,
                function (err) {
                    if (err) throw err;
                },
            );

            // Write the stored task in done.txt 
            // along with date string 
            fs.writeFile(
                currentWorkingDirectory + 'done.txt',
                'x ' + dateString + ' ' + deleted
                + '\n' + doneData,
                function (err) {
                    if (err) throw err;
                    log('Marked todo #'
                        + doneIndex + ' as done.');
                },
            );
        }
    } else {

        // If argument was not passed 
        log('Error: Missing NUMBER for'
            + ' marking todo as done.');
    }
};


const reportFunction = () => {

    // Create empty array for data of todo.txt 
    let todoData = [];

    // Create empty array for data of done.txt 
    let doneData = [];

    // Create a new date object 
    let dateobj = new Date();

    // Slice the date part 
    let dateString = dateobj.toISOString().substring(0, 10);

    // Read data from both the files 
    const todo = fs.readFileSync(currentWorkingDirectory
        + 'todo.txt').toString();
    const done = fs.readFileSync(currentWorkingDirectory
        + 'done.txt').toString();

    // Split the data from both files 
    todoData = todo.split('\n');

    doneData = done.split('\n');
    let filterTodoData = todoData.filter(function (value) {
        return value !== '';
    });

    let filterDoneData = doneData.filter(function (value) {

        // Filter both the data for empty lines 
        return value !== '';
    });

    log(
        dateString +
        ' ' +
        'Pending : ' +
        filterTodoData.length +
        ' Completed : ' +
        filterDoneData.length,
        // Log the stats calculated 
    );
};

switch (args[2]) {
    case 'add': {
        addFunction();
        break;
    }

    case 'ls': {
        listFunction();
        break;
    }

    case 'del': {
        deleteFunction();
        break;
    }

    case 'done': {
        doneFunction();
        break;
    }

    case 'help':
    case '-h':
    case '--help': {
        InfoFunction();
        break;
    }

    case 'report': {
        reportFunction();
        break;
    }

    default: {
        InfoFunction();
        // We will display help when no 
        // argument is passed or invalid 
        // argument is passed 
    }
}



