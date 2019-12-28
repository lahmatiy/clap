const processArgv = require('./parse-argv');
const parseParams = require('./parse-params');
const showCommandHelp = require('./help');
const Option = require('./option');

function noop() {
    // nothing todo
}

function addOptionToCommand(command, option) {
    var commandOption;

    // short
    if (option.short) {
        commandOption = command.short[option.short];

        if (commandOption) {
            throw new Error('Short option name -' + option.short + ' already in use by ' + commandOption.usage + ' ' + commandOption.description);
        }

        command.short[option.short] = option;
    }

    // long
    commandOption = command.long[option.long];

    if (commandOption) {
        throw new Error('Long option --' + option.long + ' already in use by ' + commandOption.usage + ' ' + commandOption.description);
    }

    command.long[option.long] = option;

    // camel
    commandOption = command.options[option.camelName];

    if (commandOption) {
        throw new Error('Name option ' + option.camelName + ' already in use by ' + commandOption.usage + ' ' + commandOption.description);
    }

    command.options[option.camelName] = option;

    // set default value
    if (typeof option.defValue !== 'undefined') {
        command.setOption(option.camelName, option.defValue, true);
    }

    return option;
}

function setFunctionFactory(name) {
    return function(fn) {
        var property = name + '_';

        if (this[property] !== noop) {
            throw new Error('Method `' + name + '` could be invoked only once');
        }

        if (typeof fn !== 'function') {
            throw new Error('Value for `' + name + '` method should be a function');
        }

        this[property] = fn;

        return this;
    };
}

/**
* @class
*/
var Command = function(name, params, config) {
    config = config || {};

    this.name = name;
    this.params = false;

    try {
        if (params) {
            this.params = parseParams(params);
        }
    } catch (e) {
        throw new Error('Bad paramenter description in command definition: ' + this.name + ' ' + params);
    }

    this.commands = {};
    this.options = {};
    this.short = {};
    this.long = {};
    this.values = {};
    this.defaults_ = {};

    if ('defaultHelp' in config === false || config.defaultHelp) {
        this.infoOption('-h, --help', 'Output usage information', chunks =>
            showCommandHelp(this, chunks.slice(0, chunks.length - 1).map(chunk => chunk.command.name))
        );
    }

    if (typeof config.infoOptionAction === 'function') {
        this.infoOptionAction = config.infoOptionAction;
    }
};

Command.prototype = {
    params: null,
    commands: null,
    options: null,
    short: null,
    long: null,
    values: null,
    defaults_: null,

    description_: '',
    version_: '',
    initContext_: noop,
    init_: noop,
    delegate_: noop,
    action_: noop,
    args_: noop,
    end_: null,

    infoOptionAction: function(info) {
        console.log(info);
        process.exit(0);
    },

    option: function(usage, description, opt1, opt2) {
        addOptionToCommand(this, new Option(usage, description, opt1, opt2));

        return this;
    },
    infoOption: function(usage, description, getInfo) {
        this.option(
            usage,
            description,
            commands => this.infoOptionAction(getInfo(commands)),
            Option.info
        );
    },
    shortcut: function(usage, description, fn, opt1, opt2) {
        if (typeof fn !== 'function') {
            throw new Error('fn should be a function');
        }

        var command = this;
        var option = addOptionToCommand(this, new Option(usage, description, opt1, opt2));
        var normalize = option.normalize;

        option.normalize = function(value) {
            var values;

            value = normalize.call(command, value);
            values = fn(value);

            for (var name in values) {
                if (hasOwnProperty.call(values, name)) {
                    if (hasOwnProperty.call(command.options, name)) {
                        command.setOption(name, values[name]);
                    } else {
                        command.values[name] = values[name];
                    }
                }
            }

            command.values[option.name] = value;

            return value;
        };

        return this;
    },
    hasOption: function(name) {
        return hasOwnProperty.call(this.options, name);
    },
    hasOptions: function() {
        return Object.keys(this.options).length > 0;
    },
    setOption: function(name, value, isDefault) {
        if (!this.hasOption(name)) {
            throw new Error('Option `' + name + '` is not defined');
        }

        var option = this.options[name];
        var oldValue = this.values[name];
        var newValue = option.normalize.call(this, value, oldValue);

        this.values[name] = option.maxArgsCount ? newValue : value;

        if (isDefault && !hasOwnProperty.call(this.defaults_, name)) {
            this.defaults_[name] = this.values[name];
        }
    },
    setOptions: function(values) {
        for (var name in values) {
            if (hasOwnProperty.call(values, name) && this.hasOption(name)) {
                this.setOption(name, values[name]);
            }
        }
    },
    reset: function() {
        this.values = {};

        Object.assign(this.values, this.defaults_);
    },

    command: function(nameOrCommand, params, config) {
        var name;
        var command;

        if (nameOrCommand instanceof Command) {
            command = nameOrCommand;
            name = command.name;
        } else {
            name = nameOrCommand;
            command = new Command(name, params, config);
        }

        if (!/^[a-zA-Z][a-zA-Z0-9\-\_]*$/.test(name)) {
            throw new Error('Bad subcommand name: ' + name);
        }

        // search for existing one
        var subcommand = this.commands[name];

        if (!subcommand) {
            // create new one if not exists
            subcommand = command;
            subcommand.end_ = this;
            this.commands[name] = subcommand;
        }

        return subcommand;
    },
    end: function() {
        return this.end_;
    },
    hasCommands: function() {
        return Object.keys(this.commands).length > 0;
    },

    version: function(version, usage, description) {
        if (this.version_) {
            throw new Error('Version for command could be set only once');
        }

        this.version_ = version;
        this.infoOption(
            usage || '-v, --version',
            description || 'Output version',
            function() {
                return version;
            }
        );

        return this;
    },
    description: function(description) {
        if (this.description_) {
            throw new Error('Description for command could be set only once');
        }

        this.description_ = description;

        return this;
    },

    init: setFunctionFactory('init'),
    initContext: setFunctionFactory('initContext'),
    args: setFunctionFactory('args'),
    delegate: setFunctionFactory('delegate'),
    action: setFunctionFactory('action'),

    extend: function(fn, ...args) {
        fn(this, ...args);
        return this;
    },

    parse: function(args, suggest) {
        if (!args) {
            args = process.argv.slice(2);
        }

        return processArgv(this, args, suggest);
    },
    run: function(args, context) {
        var commands = this.parse(args);

        for (var i = 0; i < commands.length; i++) {
            var item = commands[i];

            if (item.infoOptions.length) {
                item.infoOptions[0].info(commands.slice(0, i + 1));
                return;
            }
        }

        var prevCommand;
        var context = Object.assign({}, context || this.initContext_());
        for (var i = 0; i < commands.length; i++) {
            var item = commands[i];
            var command = item.command;

            // reset command values
            command.reset();
            command.context = context;
            command.root = this;

            if (prevCommand) {
                prevCommand.delegate_(command);
            }

            // apply beforeInit options
            item.options.forEach(function(entry) {
                if (entry.option.beforeInit) {
                    command.setOption(entry.option.camelName, entry.value);
                }
            });

            command.init_(item.args.slice());     // use slice to avoid args mutation in handler

            if (item.args.length) {
                command.args_(item.args.slice()); // use slice to avoid args mutation in handler
            }

            // apply regular options
            item.options.forEach(function(entry) {
                if (!entry.option.beforeInit) {
                    command.setOption(entry.option.camelName, entry.value);
                }
            });

            prevCommand = command;
        }

        // return last command action result
        if (command) {
            return command.action_(item.args, item.literalArgs);
        }
    },

    normalize: function(values) {
        var result = {};

        if (!values) {
            values = {};
        }

        for (var name in this.values) {
            if (hasOwnProperty.call(this.values, name)) {
                result[name] = hasOwnProperty.call(values, name) && hasOwnProperty.call(this.options, name)
                    ? this.options[name].normalize.call(this, values[name])
                    : this.values[name];
            }
        }

        for (var name in values) {
            if (hasOwnProperty.call(values, name) && !hasOwnProperty.call(result, name)) {
                result[name] = values[name];
            }
        }

        return result;
    },

    showHelp: function(commandPath) {
        console.log(showCommandHelp(this, commandPath));
    }
};

module.exports = Command;
