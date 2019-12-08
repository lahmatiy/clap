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
