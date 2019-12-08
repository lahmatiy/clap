function findVariants(obj, entry) {
    return obj.suggestions.filter(function(item) {
        return item.substr(0, entry.length) === entry;
    });
}

/**
* @class
*/

var CliError = function(message) {
    this.message = message;
};
CliError.prototype = Object.create(Error.prototype);
CliError.prototype.name = 'CliError';
CliError.prototype.clap = true;

module.exports = function processArgv(command, args, suggest) {
    function processOption(option) {
        var params = [];

        if (typeof option.info === 'function') {
            resultToken.infoOptions.push(option);
            return;
        }

        if (option.maxArgsCount) {
            for (var j = 0; j < option.maxArgsCount; j++) {
                var suggestPoint = suggest && i + 1 + j >= args.length - 1;
                var nextToken = args[i + 1];

                // TODO: suggestions for options
                if (suggestPoint) {
                    // search for suggest
                    noSuggestions = true;
                    i = args.length;
                    return;
                }

                if (!nextToken || nextToken[0] === '-') {
                    break;
                }

                params.push(args[++i]);
            }

            if (params.length < option.minArgsCount) {
                throw new CliError('Option ' + token + ' should be used with at least ' + option.minArgsCount + ' argument(s)\nUsage: ' + option.usage);
            }

            if (option.maxArgsCount === 1) {
                params = params[0];
            }
        } else {
            params = !option.defValue;
        }

        // command.values[option.camelName] = newValue;
        resultToken.options.push({
            option: option,
            value: params
        });
    }

    var suggestStartsWith = '';
    var noSuggestions = false;
    var collectArgs = false;
    var commandArgs = [];
    var noOptionsYet = true;
    var option;
    var resultToken = {
        command: command,
        args: [],
        literalArgs: [],
        options: [],
        infoOptions: []
    };
    var result = [resultToken];

    for (var i = 0; i < args.length; i++) {
        var suggestPoint = suggest && i === args.length - 1;
        var token = args[i];

        if (collectArgs) {
            commandArgs.push(token);
            continue;
        }

        if (suggestPoint && (token === '--' || token === '-' || token[0] !== '-')) {
            suggestStartsWith = token;
            break; // returns long option & command list outside the loop
        }

        if (token === '--') {
            resultToken.args = commandArgs;
            commandArgs = [];
            noOptionsYet = false;
            collectArgs = true;
            continue;
        }

        if (token[0] === '-') {
            noOptionsYet = false;

            if (commandArgs.length) {
                // command.args_.apply(command, commandArgs);
                resultToken.args = commandArgs;
                commandArgs = [];
            }

            if (token[1] === '-') {
                // long option
                option = command.long[token.substr(2)];

                if (!option) {
                    // option doesn't exist
                    if (suggestPoint) {
                        return findVariants(command, token);
                    } else {
                        throw new CliError('Unknown option: ' + token);
                    }
                }

                // process option
                processOption(option, command);
            } else {
                // short flags sequence
                if (!/^-[a-zA-Z]+$/.test(token)) {
                    throw new CliError('Wrong short option sequence: ' + token);
                }

                if (token.length === 2) {
                    option = command.short[token[1]];

                    if (!option) {
                        throw new CliError('Unknown short option name: -' + token[1]);
                    }

                    // single option
                    processOption(option, command);
                } else {
                    // short options sequence
                    for (var j = 1; j < token.length; j++) {
                        option = command.short[token[j]];

                        if (!option) {
                            throw new CliError('Unknown short option name: -' + token[j]);
                        }

                        if (option.maxArgsCount) {
                            throw new CliError('Non-boolean option -' + token[j] + ' can\'t be used in short option sequence: ' + token);
                        }

                        processOption(option, command);
                    }
                }
            }
        } else {
            if (command.commands[token] && (!command.params || commandArgs.length >= command.params.minArgsCount)) {
                if (noOptionsYet) {
                    resultToken.args = commandArgs;
                    commandArgs = [];
                }

                if (command.params && resultToken.args.length < command.params.minArgsCount) {
                    throw new CliError('Missed required argument(s) for command `' + command.name + '`');
                }

                // switch control to another command
                command = command.commands[token];
                noOptionsYet = true;

                resultToken = {
                    command: command,
                    args: [],
                    literalArgs: [],
                    options: []
                };
                result.push(resultToken);
            } else {
                if (noOptionsYet && command.params && commandArgs.length < command.params.maxArgsCount) {
                    commandArgs.push(token);
                    continue;
                }

                if (suggestPoint) {
                    return findVariants(command, token);
                } else {
                    throw new CliError('Unknown command: ' + token);
                }
            }
        }
    }

    if (suggest) {
        if (collectArgs || noSuggestions) {
            return [];
        }

        return findVariants(command, suggestStartsWith);
    } else {
        if (!noOptionsYet) {
            resultToken.literalArgs = commandArgs;
        } else {
            resultToken.args = commandArgs;
        }

        if (command.params && resultToken.args.length < command.params.minArgsCount) {
            throw new CliError('Missed required argument(s) for command `' + command.name + '`');
        }
    }

    return result;
};
module.exports.CliError = CliError;
