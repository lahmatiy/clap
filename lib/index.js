var Option = require('./option');
var Argument = require('./argument');
var Command = require('./command');
var Error = require('./parse-argv').CliError;
var showCommandHelp = require('./help');

module.exports = {
    Error,
    Argument,
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
