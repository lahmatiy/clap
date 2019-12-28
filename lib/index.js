const Params = require('./params');
const Option = require('./option');
const Command = require('./command');
const Error = require('./parse-argv-error');
const showCommandHelp = require('./help');

module.exports = {
    Error,
    Params,
    Command,
    Option,

    set color(value) {
        return showCommandHelp.color = Boolean(value);
    },
    get color() {
        return showCommandHelp.color;
    },

    command: function(name, params, config) {
        name = name || require('path').basename(process.argv[1]) || 'command';

        return new Command(name, params, config);
    }
};
