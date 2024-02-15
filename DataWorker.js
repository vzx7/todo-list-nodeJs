import path from "path";
import { fileURLToPath } from 'url'
import FSWorker from "./FSWorker.js";
export default class DataWorker {
    #scriptFileName;
    #fsWorer;

    constructor() {
        const __filename = fileURLToPath(import.meta.url);
        this.#scriptFileName = path.basename(__filename);
        this.#fsWorer = new FSWorker();
    }

    getHelpStr () {
        return ` 
$ node ${this.#scriptFileName} add "Поставленная задача"      # Добавить новую задачу
$ node ${this.#scriptFileName} ls                             # Показать список невыполненных задач
$ node ${this.#scriptFileName} del NUMBER                     # Удалить задачу
$ node ${this.#scriptFileName} done NUMBER                    # Пометить задачу как выполенную
$ node ${this.#scriptFileName} help, -h, --help               # Отобразить данную аннатацию
$ node ${this.#scriptFileName} report                         # Вывести статистику`;
    }

    getToDoListArr () {
        let data = [];
        const fileData = this.#fsWorer.readToDo();
        data = fileData.split('\n');

        let filterData = data.filter(function (value) {
            return value.length !== 0;
        });

        filterData.reverse();
        return filterData;
    }

    getToDoData () {
        let data = [];
        const fileData = this.#fsWorer.readToDo();

        data = fileData.split('\n');

        let filterData = data.filter(function (value) {
            return value !== '';
        });

        return filterData;
    }

    getReportData () {
        let todoData = [];
        let doneData = [];
        const result = {
            filterTodoData: null,
            filterDoneData: null,
            dateString: null
        }

        const dateobj = new Date();

        result.dateString = dateobj.toISOString().substring(0, 10);

        const todo = this.#fsWorer.readToDo();
        const done = this.#fsWorer.readToDoDone();

        todoData = todo.split('\n');

        doneData = done.split('\n');
        result.filterTodoData = todoData.filter(function (value) {
            return value !== '';
        });

        result.filterDoneData = doneData.filter(function (value) {
            return value !== '';
        });

        return result;
    }
}