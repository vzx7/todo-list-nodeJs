import path from "path";
import chalk from "chalk";
import boxen from "boxen";
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url);
const log = console.log;
import FSWorker from "./FSWorker.js"

const styleAdd = chalk.bold.green;
const styleDel = chalk.bold.red;
const styleError = chalk.bold.red;
const styleWarn = chalk.bold.yellow;
const styleReport = chalk.bold.blue;
const styleInfo = chalk.bold.white;
const styleDone = chalk.bold.green;

const args = process.argv;
const scriptFileName = path.basename(__filename);
const FsWorker = new FSWorker();

const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "singleDouble",
    borderColor: "green",
    backgroundColor: "#555555"
};

// helpers
const createVue = (greeting, exStyle) => {
    const msgBox = boxen(greeting, { ...boxenOptions, ...exStyle });
    log(msgBox);
}

const getToDoListArr = () => {
    let data = [];
    const fileData = FsWorker.readToDo();
    data = fileData.split('\n');

    let filterData = data.filter(function (value) {
        return value.length !== 0;
    });

    filterData.reverse();
    return filterData;
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
    const fileData = FsWorker.readToDo();

    data = fileData.split('\n');
    console.log(data);

    let filterData = data.filter(function (value) {
        return value !== '';
    });

    const len = filterData.length;

    if (len === 0) {
        createVue(styleWarn('Нет невыполненных задач, добавьте новые.'));
        return;
    }

    let report = '';

    for (let i = 0; i < len; i++) {
        report += `
${len - (len - i) + 1}. ${filterData[i]}`
    }
    createVue(styleReport(report), { title: 'Отчет' });
};


const addFunction = () => {
    const newTask = args[3];
    if (newTask) {
        FsWorker.writeToDo(
            newTask,
            () => createVue(styleAdd('Добавлена задача: "' + newTask + '"'), { title: 'Отчет' })
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
            FsWorker.writeToDo(
                filterData,
                () => createVue(styleDel(`Удалена задача #${deleteIndex}`), { title: 'Отчет' })
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
        const filterData = getToDoListArr();

        if (doneIndex > filterData.length || doneIndex <= 0) {
            createVue(styleError(`Error: задача # ${doneIndex} не существует.`), { title: 'Ошибка' });
        } else {

            const deleted = filterData.splice(
                filterData.length - doneIndex, 1);
            console.log(filterData);
            filterData.length && FsWorker.writeToDo(filterData);
            FsWorker.writeToDoDone(
                dateString,
                deleted,
                () => createVue(styleDone(`Задача #${doneIndex} отмечена как выполненная.`), { title: 'Отчет' })
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

    const todo = FsWorker.readToDo();
    const done = FsWorker.readToDoDone();

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



