var Option = require('./option');
var Argument = require('./argument');
var Command = require('./command');
var { CliError } = require('./parse-argv');
var showCommandHelp = require('./help');

module.exports = {
    set color(value) {
        return showCommandHelp.color = Boolean(value);
    },
    get color() {
        return showCommandHelp.color;
    },

    Error: CliError,
    Argument: Argument,
    Command: Command,
    Option: Option,

    error: function(fn) {
        if (Command.errorHandler) {
            throw new Error('Error handler should be set only once');
        }

        if (typeof fn !== 'function') {
            throw new Error('Error handler should be a function');
        }

        Command.errorHandler = fn;

        return this;
    },

    create: function(name, params, config) {
        name = name || require('path').basename(process.argv[1]) || 'cli';

        return new Command(name, params, config);
    },

    confirm: function(message, fn) {
        process.stdout.write(message);
        process.stdin.setEncoding('utf8');
        process.stdin.once('data', function(val) {
            process.stdin.pause();
            fn(/^y|yes|ok|true$/i.test(val.trim()));
        });
        process.stdin.resume();
    }
};
