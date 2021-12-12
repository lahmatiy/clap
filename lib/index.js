import { basename, extname } from 'path';
import Params from './params.js';
import Option from './option.js';
import Command from './command.js';
import Error from './parse-argv-error.js';
import getCommandHelp from './help.js';

function nameFromProcessArgv() {
    return basename(process.argv[1], extname(process.argv[1]));
}

function command(name, params, config) {
    name = name || nameFromProcessArgv() || 'command';

    return new Command(name, params, config);
}

export {
    Error,
    Params,
    Command,
    Option,

    getCommandHelp,
    command
};
