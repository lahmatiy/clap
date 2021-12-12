import colors from 'ansi-colors';

const MAX_LINE_WIDTH = process.stdout.columns || 200;
const MIN_OFFSET = 20;
const reAstral = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
const ansiRegex = /\x1B\[([0-9]{1,3}(;[0-9]{1,3})*)?[m|K]/g;
const byName = (a, b) => a.name > b.name || -(a.name < b.name);

function stringLength(str) {
    return str
        .replace(ansiRegex, '')
        .replace(reAstral, ' ')
        .length;
}

function pad(width, str) {
    // str.padEnd(width + str.length - stringLength(str))
    return str + ' '.repeat(width - stringLength(str));
}

function breakByLines(str, offset) {
    const words = str.split(' ');
    const maxWidth = MAX_LINE_WIDTH - offset || 0;
    const lines = [];
    let line = '';

    while (words.length) {
        const word = words.shift();

        if (!line || (line.length + word.length + 1) < maxWidth) {
            line += (line ? ' ' : '') + word;
        } else {
            lines.push(line);
            words.unshift(word);
            line = '';
        }
    }

    lines.push(line);

    return lines
        .map((line, idx) => (idx && offset ? pad(offset, '') : '') + line)
        .join('\n');
}

function args(params, fn = s => s) {
    if (params.args.length === 0) {
        return '';
    }

    return ' ' + fn(
        params.args
            .map(({ name, required }) => required ? '<' + name + '>' : '[' + name + ']')
            .join(' ')
    );
}

function formatLines(lines) {
    const maxNameLength = Math.max(MIN_OFFSET, ...lines.map(line => stringLength(line.name)));

    return lines.map(line => (
        '    ' + pad(maxNameLength, line.name) +
        '    ' + breakByLines(line.description, maxNameLength + 8)
    ));
}

function commandsHelp(command) {
    if (command.commands.size === 0) {
        return '';
    }

    const lines = command.getCommands().sort(byName).map(({ name, meta, params }) => ({
        description: meta.description,
        name: colors.green(name) + args(params, colors.gray)
    }));

    return [
        '',
        'Commands:',
        '',
        ...formatLines(lines),
        ''
    ].join('\n');
}

function optionsHelp(command) {
    if (command.options.size === 0) {
        return '';
    }

    const options = command.getOptions().sort(byName);
    const shortPlaceholder = options.some(option => option.short) ? '    ' : '';
    const lines = options.map(({ short, long, params, description }) => ({
        description,
        name: [
            short ? colors.yellow(short) + ', ' : shortPlaceholder,
            colors.yellow(long),
            args(params)
        ].join('')
    }));

    // Prepend the help information
    return [
        '',
        'Options:',
        '',
        ...formatLines(lines),
        ''
    ].join('\n');
}

/**
 * Return program help documentation.
 *
 * @return {String}
 * @api private
 */
export default function getCommandHelp(command, commandPath) {
    commandPath = Array.isArray(commandPath) && commandPath.length
        ? commandPath.concat(command.name).join(' ')
        : command.name;

    return [
        (command.meta.description ? command.meta.description + '\n\n' : '') +
        'Usage:\n\n' +
            '    ' + colors.cyan(commandPath) +
            args(command.params, colors.magenta) +
            (command.options.size !== 0 ? ' [' + colors.yellow('options') + ']' : '') +
            (command.commands.size !== 0 ? ' [' + colors.green('command') + ']' : ''),
        commandsHelp(command) +
        optionsHelp(command)
    ].join('\n');
};
