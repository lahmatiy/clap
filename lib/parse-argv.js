const CliError = require('./parse-argv-error');

function findVariants(command, entry) {
    return [
        ...Object.keys(command.long).map(name => '--' + name),
        ...Object.keys(command.commands)
    ].filter(item => item.startsWith(entry)).sort();
}

function getOwnValue(dict, key) {
    return hasOwnProperty.call(dict, key)
        ? dict[key]
        : null;
}

function createResultChunk(command) {
    return {
        command,
        args: [],
        literalArgs: [],
        options: [],
        actionOptions: []
    };
}

function consumeOptionParams(option, resultChunk, argv, index, suggestPoint) {
    const tokens = [];
    let value;

    if (option.params.maxCount) {
        for (let j = 0; j < option.params.maxCount; j++) {
            const token = argv[index + j];

            // TODO: suggestions for option params
            if (index + j === suggestPoint) {
                return suggestPoint;
            }

            if (!token || token[0] === '-') {
                break;
            }

            tokens.push(token);
        }

        if (tokens.length < option.params.minCount) {
            throw new CliError(
                `Option ${argv[index - 1]} should be used with at least ${option.params.minCount} argument(s)\n` +
                `Usage: ${option.usage}`
            );
        }

        value = option.params.maxCount === 1 ? tokens[0] : tokens;
    } else {
        value = !option.defValue;
    }

    resultChunk.options.push({
        option,
        value
    });

    return index + tokens.length - 1;
}

module.exports = function parseArgv(command, argv, suggestMode) {
    let resultChunk = createResultChunk(command);
    const result = [resultChunk];
    const suggestPoint = suggestMode ? argv.length - 1 : -1;

    for (var i = 0; i < argv.length; i++) {
        const token = argv[i];

        if (i === suggestPoint) {
            return findVariants(command, token); // returns long option & command list
        }

        if (token === '--') {
            if (suggestPoint > i) {
                return [];
            }

            resultChunk.literalArgs = argv.slice(i + 1);
            break;
        }

        if (token[0] === '-') {
            if (token[1] === '-') {
                // long option
                const option = getOwnValue(command.long, token.substr(2));

                if (option === null) {
                    throw new CliError(`Unknown option: ${token}`);
                }

                // process option params
                i = consumeOptionParams(option, resultChunk, argv, i + 1, suggestPoint);
                if (i === suggestPoint) {
                    return [];
                }
            } else if (token.length > 2) {
                // short options sequence
                if (!/^-[a-zA-Z]+$/.test(token)) {
                    throw new CliError(`Bad short option sequence: ${token}`);
                }

                for (let j = 1; j < token.length; j++) {
                    const option = getOwnValue(command.short, token[j]);

                    if (option === null) {
                        throw new CliError(`Unknown short option: -${token[j]}`);
                    }

                    if (option.params.maxCount > 0) {
                        throw new CliError(
                            `Non-boolean option -${token[j]} can\'t be used in short option sequence: ${token}`
                        );
                    }

                    resultChunk.options.push({
                        option,
                        value: !option.defValue
                    });
                }
            } else {
                // short option
                const option = getOwnValue(command.short, token.slice(1));

                if (option === null) {
                    throw new CliError(`Unknown short option: ${token}`);
                }

                // process option params
                i = consumeOptionParams(option, resultChunk, argv, i + 1, suggestPoint);
                if (i === suggestPoint) {
                    return [];
                }
            }
        } else {
            const subcommand = getOwnValue(command.commands, token);

            if (subcommand !== null && resultChunk.args.length >= command.params.minCount) {
                // switch control to another subcommand
                command = subcommand;
                resultChunk = createResultChunk(command);
                result.push(resultChunk);
            } else {
                if (resultChunk.options.length !== 0 ||
                    resultChunk.args.length >= command.params.maxCount) {
                    throw new CliError(`Unknown command: ${token}`);
                }

                resultChunk.args.push(token);
            }
        }
    }

    if (suggestMode) {
        return findVariants(command, '');
    } else if (resultChunk.args.length < command.params.minCount) {
        throw new CliError(`Missed required argument(s) for command "${command.name}"`);
    }

    return result;
};
