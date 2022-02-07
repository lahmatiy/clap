import { basename, extname } from 'path';
import Params from './params.js';
import Option from './option.js';
import Command from './command.js';
import Error from './parse-argv-error.js';
import getCommandHelp from './help.js';

function nameFromProcessArgv() {
    return basename(process.argv[1], extname(process.argv[1]));
}

function command(usageOrCommand, ...rest) {
    return new Command(
        usageOrCommand || nameFromProcessArgv() || 'command',
        ...rest
    );
}

export {
    Error,
    Params,
    Command,
    Option,

    getCommandHelp,
    command
};
