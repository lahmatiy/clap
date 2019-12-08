var MAX_LINE_WIDTH = process.stdout.columns || 200;
var MIN_OFFSET = 25;
var reAstral = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var ansiRegex = /\x1B\[([0-9]{1,3}(;[0-9]{1,3})*)?[m|K]/g;

function stringLength(str) {
    return str
        .replace(ansiRegex, '')
        .replace(reAstral, ' ')
        .length;
}

function pad(width, str) {
    return str + Array(Math.max(0, width - stringLength(str)) + 1).join(' ');
}

/**
 * Return program help documentation.
 *
 * @return {String}
 * @api private
 */

module.exports = function showCommandHelp(command, commandPath) {
    function breakByLines(str, offset) {
        var words = str.split(' ');
        var maxWidth = MAX_LINE_WIDTH - offset || 0;
        var lines = [];
        var line = '';

        while (words.length) {
            var word = words.shift();
            if (!line || (line.length + word.length + 1) < maxWidth) {
                line += (line ? ' ' : '') + word;
            } else {
                lines.push(line);
                words.unshift(word);
                line = '';
            }
        }

        lines.push(line);

        return lines.map(function(line, idx) {
            return (idx && offset ? pad(offset, '') : '') + line;
        }).join('\n');
    }

    function args(command) {
        return command.params.args.map(function(arg) {
            return arg.required
                ? '<' + arg.name + '>'
                : '[' + arg.name + ']';
        }).join(' ');
    }

    function commandsHelp() {
        if (!command.hasCommands()) {
            return '';
        }

        var maxNameLength = MIN_OFFSET - 2;
        var lines = Object.keys(command.commands).sort().map(function(name) {
            var subcommand = command.commands[name];

            var line = {
                name: chalk.green(name) + chalk.gray(
                    (subcommand.params ? ' ' + args(subcommand) : '')
                    // (subcommand.hasOptions() ? ' [options]' : '')
                ),
                description: subcommand.description_ || ''
            };

            maxNameLength = Math.max(maxNameLength, stringLength(line.name));

            return line;
        });

        return [
            '',
            'Commands:',
            '',
            lines.map(function(line) {
                return '    ' + pad(maxNameLength, line.name) + '    ' + breakByLines(line.description, maxNameLength + 4);
            }).join('\n'),
            ''
        ].join('\n');
    }

    function optionsHelp() {
        if (!command.hasOptions()) {
            return '';
        }

        var hasShortOptions = Object.keys(command.short).length > 0;
        var maxNameLength = MIN_OFFSET - 2;
        var lines = Object.keys(command.long).sort().map(function(name) {
            var option = command.long[name];
            var line = {
                name: option.usage
                    .replace(/^(?:-., |)/, function(m) {
                        return m || (hasShortOptions ? '    ' : '');
                    })
                    .replace(/(^|\s)(-[^\s,]+)/ig, function(m, p, flag) {
                        return p + chalk.yellow(flag);
                    }),
                description: option.description
            };

            maxNameLength = Math.max(maxNameLength, stringLength(line.name));

            return line;
        });

        // Prepend the help information
        return [
            '',
            'Options:',
            '',
            lines.map(function(line) {
                return '    ' + pad(maxNameLength, line.name) + '    ' + breakByLines(line.description, maxNameLength + 4);
            }).join('\n'),
            ''
        ].join('\n');
    }

    var chalk = require('chalk');
    var output = [];
    commandPath = Array.isArray(commandPath)
        ? commandPath.concat(command.name).join(' ')
        : command.name;

    chalk.enabled = module.exports.color && process.stdout.isTTY;

    if (command.description_) {
        output.push(command.description_ + '\n');
    }

    output.push(
        'Usage:\n\n    ' +
            chalk.cyan(commandPath) +
            (command.params ? ' ' + chalk.magenta(args(command)) : '') +
            (command.hasOptions() ? ' [' + chalk.yellow('options') + ']' : '') +
            (command.hasCommands() ? ' [' + chalk.green('command') + ']' : ''),
        commandsHelp() +
        optionsHelp()
    );

    return output.join('\n');
};

module.exports.color = true;
