const path = require('path');
const Params = require('./params');
const Option = require('./option');
const Command = require('./command');
const Error = require('./parse-argv-error');
const getCommandHelp = require('./help');

function nameFromProcessArgv() {
    return path.basename(process.argv[1], path.extname(process.argv[1]));
}

module.exports = {
    Error,
    Params,
    Command,
    Option,

    getCommandHelp,
    command: function(name, params, config) {
        name = name || nameFromProcessArgv() || 'command';

        return new Command(name, params, config);
    }
};
