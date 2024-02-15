import fs from "fs";
export default class FSWorker {
    #currentWorkingDirectory;
    #todoList;
    #doneList;

    constructor() {
        this.#currentWorkingDirectory = process.argv[1].slice(0, -8);
        this.#todoList = 'todo.txt';
        this.#doneList = 'done.txt';
        // Create files for data
        if (fs.existsSync(this.#currentWorkingDirectory + this.#todoList) === false) {
            let createStream = fs.createWriteStream(this.#todoList);
            createStream.end();
        }

        if (fs.existsSync(this.#currentWorkingDirectory + this.#doneList) === false) {
            let createStream = fs.createWriteStream(this.#doneList);
            createStream.end();
        }
    }

    #readFile (file) {
        return fs
            .readFileSync(this.#currentWorkingDirectory + file)
            .toString();
    }

    readToDo () {
        return this.#readFile(this.#todoList);
    }

    readToDoDone () {
        return this.#readFile(this.#doneList);
    }

    writeToDo (newTask, successCB) {
        console.log(typeof newTask)
        const fileData = this.readToDo();
        fs.writeFile(
            this.#currentWorkingDirectory + this.#todoList,
            typeof newTask === 'string' ? newTask + '\n' + fileData : newTask.join('\n'),

            function (err) {
                if (err) throw err;
                successCB && successCB();
            },
        );
    }

    writeToDoDone (dateString, deleted, successCB) {
        const doneData = this.readToDoDone();
        fs.writeFile(
            this.#currentWorkingDirectory + this.#doneList,
            'x ' + dateString + ' ' + deleted
            + '\n' + doneData,
            function (err) {
                if (err) throw err;
                successCB && successCB();
            },
        );
    }
}