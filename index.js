
import LogicWorker from "./LogicWorker.js"

const args = process.argv;
const LWorker = new LogicWorker();

switch (args[2]) {
    case 'add': {
        LWorker.add();
        break;
    }

    case 'ls': {
        LWorker.list();
        break;
    }

    case 'del': {
        LWorker.delete();
        break;
    }

    case 'done': {
        LWorker.doMark();
        break;
    }

    case 'help':
    case '-h':
    case '--help': {
        LWorker.help();
        break;
    }

    case 'report': {
        LWorker.report();
        break;
    }

    default: {
        LWorker.help();
    }
}