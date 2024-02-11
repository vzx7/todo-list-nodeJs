import fs from "fs";
import path from "path";
import chalk from "chalk";
import boxen from "boxen";
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const log = console.log;

const styleAdd = chalk.bold.green;
const styleDel = chalk.bold.red;
const styleError = chalk.bold.red;
const styleWarn = chalk.bold.yellow;
const styleReport = chalk.bold.blue;
const styleInfo = chalk.bold.white;
const styleDone = chalk.bold.green;

const args = process.argv;
const currentWorkingDirectory = args[1].slice(0, -8);
const scriptFileName = path.basename(__filename);

const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "singleDouble",
    borderColor: "green",
    backgroundColor: "#555555"
};

const createVue = (greeting, exStyle) => {
    const msgBox = boxen(greeting, { ...boxenOptions, ...exStyle });
    log(msgBox);
}

// Create files for data
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

    createVue(styleInfo(UsageText), { title: 'Использование' })
};

const listFunction = () => {

    let data = [];
    const fileData = fs.readFileSync(
        currentWorkingDirectory + 'todo.txt')
        .toString();

    data = fileData.split('\n');

    let filterData = data.filter(function (value) {
        return value !== '';
    });

    const len = filterData.length;

    if (len === 0) {
        createVue(styleWarn('Нет невыполненны задач, добавьте новые.'));
        return;
    }

    let report = '';

    for (let i = 0; i < len; i++) {
        report += `
${len - (len - i) + 1}. ${filterData[i]}`
    }
    createVue(styleReport(report), { title: 'Отчет' });
};

const readFileTodo = () => fs
    .readFileSync(currentWorkingDirectory + 'todo.txt')
    .toString();

const getToDoListArr = () => {
    let data = [];
    const fileData = readFileTodo();
    data = fileData.split('\n');

    let filterData = data.filter(function (value) {
        return value !== '';
    });

    filterData.reverse();
    return filterData;
}

const addFunction = () => {
    const newTask = args[3];

    if (newTask) {
        const fileData = readFileTodo();
        fs.writeFile(
            currentWorkingDirectory + 'todo.txt',
            newTask + '\n' + fileData,

            function (err) {
                if (err) throw err;
                createVue(styleAdd('Добавлена задача: "' + newTask + '"'), { title: 'Отчет' });
            },
        );
    } else {
        createVue(styleError('Error: Вы не дообавили никакого сообщения для задачи! Задача не будет добавлена...'), { title: 'Ошибка' });
    }
};

const deleteFunction = () => {
    const deleteIndex = args[3];
    if (deleteIndex) {
        const filterData = getToDoListArr();

        if (deleteIndex > filterData.length || deleteIndex <= 0) {
            createVue(styleError(`Error: задача #${deleteIndex} не существует. Ничего не будет удалено...`), { title: 'Ошибка' });
        } else {
            filterData.splice(filterData.length - deleteIndex, 1);
            const newData = filterData.join('\n');
            fs.writeFile(
                currentWorkingDirectory + 'todo.txt',
                newData,
                function (err) {
                    if (err) throw err;
                    createVue(styleDel(`Удалена задача #${deleteIndex}`), { title: 'Отчет' });
                },
            );
        }
    } else {
        createVue(styleError('Error: Пропущен номер задачи для удаления...'), { title: 'Ошибка' });
    }
};

const doneFunction = () => {

    const doneIndex = args[3];

    if (doneIndex) {
        let dateobj = new Date();
        let dateString = dateobj.toISOString().substring(0, 10);

        const doneData = fs
            .readFileSync(currentWorkingDirectory + 'done.txt')
            .toString();

        const filterData = getToDoListArr();

        if (doneIndex > filterData.length || doneIndex <= 0) {
            createVue(styleError(`Error: задача # ${doneIndex} не существует.`), { title: 'Ошибка' });
        } else {

            const deleted = filterData.splice(
                filterData.length - doneIndex, 1);

            const newData = filterData.join('\n');

            fs.writeFile(
                currentWorkingDirectory + 'todo.txt',
                newData,
                function (err) {
                    if (err) throw err;
                },
            );

            fs.writeFile(
                currentWorkingDirectory + 'done.txt',
                'x ' + dateString + ' ' + deleted
                + '\n' + doneData,
                function (err) {
                    if (err) throw err;
                    createVue(styleDone(`Задача #${doneIndex} отмечена как выполненная.`), { title: 'Отчет' });
                },
            );
        }
    } else {
        createVue(styleError(`Error: Пропушен номер задачи, невомзожно отметить, что она выполнена!`), { title: 'Ошибка' });
    }
};


const reportFunction = () => {

    let todoData = [];
    let doneData = [];

    let dateobj = new Date();

    let dateString = dateobj.toISOString().substring(0, 10);

    const todo = fs.readFileSync(currentWorkingDirectory
        + 'todo.txt').toString();
    const done = fs.readFileSync(currentWorkingDirectory
        + 'done.txt').toString();

    todoData = todo.split('\n');

    doneData = done.split('\n');
    let filterTodoData = todoData.filter(function (value) {
        return value !== '';
    });

    let filterDoneData = doneData.filter(function (value) {
        return value !== '';
    });

    createVue(styleReport(`${dateString} 
Ожидает выполнения : ${filterTodoData.length}. 
Выполнены : ${filterDoneData.length}.`), { title: 'Отчет' });
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
    }
}



