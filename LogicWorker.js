import boxen from "boxen";
import chalk from "chalk";
import FSWorker from "./FSWorker.js";
import DataWorker from "./DataWorker.js";

export default class LogicWorker {
    // workers
    #dataWorker;
    #fsWorker;
    #errorHandler = null;
    #utils = {
        add: null,
        del: null,
        error: null,
        warn: null,
        report: null,
        info: null,
        done: null
    };
    #createVue;
    // vars
    #boxenOptions;
    #args;

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
        this.#utils = {
            add: chalk.bold.green,
            del: chalk.bold.red,
            error: chalk.bold.red,
            warn: chalk.bold.yellow,
            report: chalk.bold.blue,
            info: chalk.bold.white,
            done: chalk.bold.green
        };
        this.#args = process.argv;
        this.#errorHandler = (msg) => this.#createVue(this.#utils.error(msg), { title: 'Ошибка' });
        this.#createVue = (greeting, exStyle) => {
            const msgBox = boxen(greeting, { ...this.#boxenOptions, ...exStyle });
            console.log(msgBox);
        }
    }

    help () {
        this.#createVue(this.#utils.info(this.#dataWorker.getHelpStr()), { title: 'Использование' })
    };

    list () {
        const filterData = this.#dataWorker.getToDoData();
        const len = filterData.length;

        if (len === 0) {
            this.#createVue(this.#utils.warn('Нет невыполненных задач, добавьте новые.'));
            return;
        }

        let report = '';

        for (let i = 0; i < len; i++) {
            report += `
${len - (len - i) + 1}. ${filterData[i]}`
        }
        this.#createVue(this.#utils.report(report), { title: 'Отчет' });
    };

    add () {
        const newTask = this.#args[3];
        if (newTask) {
            this.#fsWorker.writeToDo(
                newTask,
                () => this.#createVue(this.#utils.add('Добавлена задача: "' + newTask + '"'), { title: 'Отчет' })
            );
        } else {
            this.#errorHandler('Error: Вы не дообавили никакого сообщения для задачи! Задача не будет добавлена...')
        }
    }
    delete () {
        const deleteIndex = this.#args[3];
        if (deleteIndex) {
            const filterData = this.#dataWorker.getToDoListArr();

            if (deleteIndex > filterData.length || deleteIndex <= 0) {
                this.#errorHandler(`Error: задача #${deleteIndex} не существует. Ничего не будет удалено...`);
            } else {
                filterData.splice(filterData.length - deleteIndex, 1);
                this.#fsWorker.writeToDo(
                    filterData,
                    () => this.#createVue(this.#utils.del(`Удалена задача #${deleteIndex}`), { title: 'Отчет' })
                );
            }
        } else {
            this.#errorHandler('Error: Пропущен номер задачи для удаления...');
        }
    }

    doMark () {
        const doneIndex = this.#args[3];

        if (doneIndex) {
            let dateobj = new Date();
            let dateString = dateobj.toISOString().substring(0, 10);
            const filterData = this.#dataWorker.getToDoListArr();

            if (doneIndex > filterData.length || doneIndex <= 0) {
                this.#errorHandler(`Error: задача # ${doneIndex} не существует.`);
            } else {

                const deleted = filterData.splice(
                    filterData.length - doneIndex, 1);
                filterData.length && this.#fsWorker.writeToDo(filterData);
                this.#fsWorker.writeToDoDone(
                    dateString,
                    deleted,
                    () => this.#createVue(this.#utils.done(`Задача #${doneIndex} отмечена как выполненная.`), { title: 'Отчет' })
                );
            }
        } else {
            this.#errorHandler(`Error: Пропушен номер задачи, невомзожно отметить, что она выполнена!`);
        }
    }

    report () {
        const data = this.#dataWorker.getReportData();

        this.#createVue(this.#utils.report(`${data.dateString} 
Ожидает выполнения : ${data.filterTodoData.length}. 
Выполнены : ${data.filterDoneData.length}.`), { title: 'Отчет' });
    };
}