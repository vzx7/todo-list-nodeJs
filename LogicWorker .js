import boxen from "boxen";
import chalk from "chalk";
import FSWorker from "./FSWorker.js"
import DataWorker from "./DataWorker.js"

const args = process.argv;

const styleAdd = chalk.bold.green;
const styleDel = chalk.bold.red;
const styleError = chalk.bold.red;
const styleWarn = chalk.bold.yellow;
const styleReport = chalk.bold.blue;
const styleInfo = chalk.bold.white;
const styleDone = chalk.bold.green;


export default class LogicWorker {
    #boxenOptions;
    #dataWorker;
    #fsWorker;
    constructor() {
        this.#boxenOptions = {
            padding: 1,
            margin: 1,
            borderStyle: "singleDouble",
            borderColor: "green",
            backgroundColor: "#555555"
        };
        this.#dataWorker = new DataWorker();
        this.#fsWorker = new FSWorker();
    }

    createVue (greeting, exStyle) {
        const msgBox = boxen(greeting, { ...this.#boxenOptions, ...exStyle });
        console.log(msgBox);
    }

    help () {
        this.createVue(styleInfo(this.#dataWorker.getHelpStr()), { title: 'Использование' })
    };

    list () {
        const filterData = this.#dataWorker.getToDoData();
        const len = filterData.length;

        if (len === 0) {
            this.createVue(styleWarn('Нет невыполненных задач, добавьте новые.'));
            return;
        }

        let report = '';

        for (let i = 0; i < len; i++) {
            report += `
${len - (len - i) + 1}. ${filterData[i]}`
        }
        this.createVue(styleReport(report), { title: 'Отчет' });
    };

    add () {
        const newTask = args[3];
        if (newTask) {
            this.#fsWorker.writeToDo(
                newTask,
                () => this.createVue(styleAdd('Добавлена задача: "' + newTask + '"'), { title: 'Отчет' })
            );
        } else {
            this.createVue(styleError('Error: Вы не дообавили никакого сообщения для задачи! Задача не будет добавлена...'), { title: 'Ошибка' });
        }
    }
    delete () {
        const deleteIndex = args[3];
        if (deleteIndex) {
            const filterData = this.#dataWorker.getToDoListArr();

            if (deleteIndex > filterData.length || deleteIndex <= 0) {
                this.createVue(styleError(`Error: задача #${deleteIndex} не существует. Ничего не будет удалено...`), { title: 'Ошибка' });
            } else {
                filterData.splice(filterData.length - deleteIndex, 1);
                this.#fsWorker.writeToDo(
                    filterData,
                    () => this.createVue(styleDel(`Удалена задача #${deleteIndex}`), { title: 'Отчет' })
                );
            }
        } else {
            this.createVue(styleError('Error: Пропущен номер задачи для удаления...'), { title: 'Ошибка' });
        }
    }

    doMark () {
        const doneIndex = args[3];

        if (doneIndex) {
            let dateobj = new Date();
            let dateString = dateobj.toISOString().substring(0, 10);
            const filterData = this.#dataWorker.getToDoListArr();

            if (doneIndex > filterData.length || doneIndex <= 0) {
                this.createVue(styleError(`Error: задача # ${doneIndex} не существует.`), { title: 'Ошибка' });
            } else {

                const deleted = filterData.splice(
                    filterData.length - doneIndex, 1);
                filterData.length && this.#fsWorker.writeToDo(filterData);
                this.#fsWorker.writeToDoDone(
                    dateString,
                    deleted,
                    () => this.createVue(styleDone(`Задача #${doneIndex} отмечена как выполненная.`), { title: 'Отчет' })
                );
            }
        } else {
            this.createVue(styleError(`Error: Пропушен номер задачи, невомзожно отметить, что она выполнена!`), { title: 'Ошибка' });
        }
    }

    report () {
        const data = this.#dataWorker.getReportData();

        this.createVue(styleReport(`${data.dateString} 
Ожидает выполнения : ${data.filterTodoData.length}. 
Выполнены : ${data.filterDoneData.length}.`), { title: 'Отчет' });
    };

}