const Params = require('./params');
const Option = require('./option');
const Command = require('./command');
const Error = require('./parse-argv-error');

module.exports = {
    Error,
    Params,
    Command,
    Option,

    command: function(name, params, config) {
        name = name || require('path').basename(process.argv[1]) || 'command';

        return new Command(name, params, config);
    }
};
