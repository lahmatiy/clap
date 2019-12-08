function findVariants(obj, entry) {
    return obj.suggestions.filter(function(item) {
        return item.substr(0, entry.length) === entry;
    });
}

function createResultChunk(command) {
    return {
        command,
        args: [],
        literalArgs: [],
        options: [],
        infoOptions: []
    };
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
            resultChunk.infoOptions.push(option);
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
        resultChunk.options.push({
            option: option,
            value: params
        });
    }

    var suggestStartsWith = '';
    var noSuggestions = false;
    var resultChunk = createResultChunk(command);
    var result = [resultChunk];

    for (var i = 0; i < args.length; i++) {
        var suggestPoint = suggest && i === args.length - 1;
        var token = args[i];

        if (suggestPoint && (token === '--' || token === '-' || token[0] !== '-')) {
            suggestStartsWith = token;
            break; // returns long option & command list outside the loop
        }

        if (token === '--') {
            resultChunk.literalArgs.push(...args.slice(i + 1));
            break;
        }

        if (token[0] === '-') {
            if (token[1] === '-') {
                // long option
                var option = command.long[token.substr(2)];

                if (!option) {
                    // option doesn't exist
                    if (suggestPoint) {
                        return findVariants(command, token);
                    }

                    throw new CliError('Unknown option: ' + token);
                }

                // process option
                processOption(option, command);
            } else {
                // short options sequence
                if (!/^-[a-zA-Z]+$/.test(token)) {
                    throw new CliError('Wrong short option sequence: ' + token);
                }

                for (var j = 1; j < token.length; j++) {
                    var option = command.short[token[j]];

                    if (!option) {
                        throw new CliError('Unknown short option: -' + token[j]);
                    }

                    if (option.maxArgsCount > 0 && token.length > 2) {
                        throw new CliError('Non-boolean option -' + token[j] + ' can\'t be used in short option sequence: ' + token);
                    }

                    processOption(option, command);
                }
            }
        } else {
            if (command.commands[token] &&
                (!command.params || resultChunk.args.length >= command.params.minArgsCount)) {
                // switch control to another command
                command = command.commands[token];

                resultChunk = createResultChunk(command);
                result.push(resultChunk);
            } else {
                if (resultChunk.options.length === 0 &&
                    (command.params && resultChunk.args.length < command.params.maxArgsCount)) {
                    resultChunk.args.push(token);
                    continue;
                }

                if (suggestPoint) {
                    return findVariants(command, token);
                }

                throw new CliError('Unknown command: ' + token);
            }
        }
    }

    if (suggest) {
        if (resultChunk.literalArgs.length || noSuggestions) {
            return [];
        }

        return findVariants(command, suggestStartsWith);
    } else if (command.params && resultChunk.args.length < command.params.minArgsCount) {
        throw new CliError('Missed required argument(s) for command `' + command.name + '`');
    }

    return result;
};
module.exports.CliError = CliError;
