import CliError from './parse-argv-error.js';

function findVariants(command, entry) {
    return [
        ...command.getOptions().map(option => option.long),
        ...command.commands.keys()
    ].filter(item => item.startsWith(entry)).sort();
}

function consumeOptionParams(option, rawOptions, argv, index, suggestPoint) {
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
        value = !option.default;
    }

    rawOptions.push({
        option,
        value
    });

    return index + tokens.length - 1;
}

export default function parseArgv(command, argv, context, suggestMode) {
    const suggestPoint = suggestMode ? argv.length - 1 : -1;
    const rawOptions = [];
    const result = {
        context,
        action: null,
        next: null
    };

    command = command.clone();
    context.commandPath.push(command.name);
    context.options = Object.freeze(command.createOptionValues());
    context.args = [];
    context.literalArgs = null;

    command.handlers.init(command, context);

    for (var i = 0; i < argv.length; i++) {
        const token = argv[i];

        if (i === suggestPoint) {
            return findVariants(command, token); // returns long option & command list
        }

        if (token === '--') {
            if (suggestPoint > i) {
                return [];
            }

            context.literalArgs = argv.slice(i + 1);
            break;
        }

        // special case, use - as a value for an arg
        if (token === '-' && context.args.length < command.params.maxCount) {
            context.args.push(token);
            continue;
        }

        if (token[0] === '-') {
            if (token[1] === '-' || token.length === 2) {
                // long option
                const option = command.getOption(token);

                if (option === null) {
                    throw new CliError(`Unknown option: ${token}`);
                }

                // process option params
                i = consumeOptionParams(option, rawOptions, argv, i + 1, suggestPoint);
                if (i === suggestPoint) {
                    return [];
                }
            } else {
                // short options sequence
                if (!/^-[a-zA-Z0-9]+$/.test(token)) {
                    throw new CliError(`Bad short options sequence: ${token}`);
                }

                for (let j = 1; j < token.length; j++) {
                    const option = command.getOption(`-${token[j]}`);

                    if (option === null) {
                        throw new CliError(`Unknown option "${token[j]}" in short options sequence: ${token}`);
                    }

                    if (option.params.maxCount > 0) {
                        throw new CliError(
                            `Non-boolean option "-${token[j]}" can\'t be used in short options sequence: ${token}`
                        );
                    }

                    rawOptions.push({
                        option,
                        value: !option.default
                    });
                }
            }
        } else {
            const subcommand = command.getCommand(token);

            if (subcommand !== null &&
                context.args.length >= command.params.minCount) {
                // set next command and rest argv
                result.next = {
                    command: subcommand,
                    argv: argv.slice(i + 1)
                };
                break;
            } else {
                if (context.args.length >= command.params.maxCount) {
                    throw new CliError(`Unknown command: ${token}`);
                }

                context.args.push(token);
            }
        }
    }

    // final checks
    if (suggestMode && !result.next) {
        return findVariants(command, '');
    } else if (context.args.length < command.params.minCount) {
        throw new CliError(`Missed required argument(s) for command "${command.name}"`);
    }

    // create new option values storage
    context.options = command.createOptionValues();

    // process action option
    const actionOption = rawOptions.find(({ option }) => option.action);
    if (actionOption) {
        const { option, value } = actionOption;
        result.action = () => option.action(command, value, context);
        result.next = null;
        return result;
    }

    // apply config options
    for (const { option, value } of rawOptions) {
        if (option.config) {
            context.options[option.name] = value;
        }
    }

    // run apply config handler
    command.handlers.applyConfig(context);

    // apply regular options
    for (const { option, value } of rawOptions) {
        if (!option.config) {
            context.options[option.name] = value;
        }
    }

    // run context finish handler
    command.handlers.finishContext(context);

    // set action if no rest argv
    if (!result.next) {
        result.action = command.handlers.action;
    }

    return result;
};
