const processArgv = require('./parse-argv');
const showCommandHelp = require('./help');
const Params = require('./params');
const Option = require('./option');

const noop = () => {}; // nothing todo
const has = (host, property) => hasOwnProperty.call(host, property);

function assertAlreadyInUse(dict, name, subject) {
    if (has(dict, name)) {
        throw new Error(
            `${subject}${name} already in use by ${dict[name].usage} ${dict[name].description}`
        );
    }
}

function addOptionToCommand(command, option) {
    // short
    if (option.short) {
        assertAlreadyInUse(command.short, option.short, 'Short option name -');
        command.short[option.short] = option;
    }

    // long
    assertAlreadyInUse(command.long, option.long, 'Long option name --');
    command.long[option.long] = option;

    // camel
    assertAlreadyInUse(command.options, option.camelName, 'Option name ');
    command.options[option.camelName] = option;

    // set default value
    if (typeof option.defValue !== 'undefined') {
        command.defaults_[option.camelName] = command.setValue(option.camelName, option.defValue);
    }

    return command;
}

function setFunctionFactory(name) {
    return function(fn) {
        const property = name + '_';

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

class Command {
    constructor(name, params, config) {
        config = config || {};

        this.name = name;
        this.params = new Params(params || '', `"${this.name}" command definition`);
        this.commands = {};
        this.options = {};
        this.short = {};
        this.long = {};
        this.values = {};
        this.defaults_ = {};

        this.description_ = '';
        this.version_ = '';
        this.initContext_ = noop;
        this.init_ = noop;
        this.delegate_ = noop;
        this.action_ = noop;
        this.args_ = noop;
        this.end_ = null;

        this.init = setFunctionFactory('init');
        this.initContext = setFunctionFactory('initContext');
        this.args = setFunctionFactory('args');
        this.delegate = setFunctionFactory('delegate');
        this.action = setFunctionFactory('action');

        if ('defaultHelp' in config === false || config.defaultHelp) {
            this.infoOption('-h, --help', 'Output usage information', chunks =>
                showCommandHelp(this, chunks.slice(0, chunks.length - 1).map(chunk => chunk.command.name))
            );
        }

        if (typeof config.infoOptionAction === 'function') {
            this.infoOptionAction = config.infoOptionAction;
        }
    }

    infoOptionAction(info) {
        console.log(info);
        process.exit(0);
    }

    option(usage, description, ...optionOpts) {
        return addOptionToCommand(this, new Option(usage, description, ...optionOpts));
    }
    infoOption(usage, description, getInfo) {
        return this.option(
            usage,
            description,
            commands => this.infoOptionAction(getInfo(commands)),
            Option.info
        );
    }
    shortcut(usage, description, fn, ...optionOpts) {
        return addOptionToCommand(this, new Option(usage, description, {
            ...Option.normalizeOptions(...optionOpts),
            shortcut: fn
        }));
    }
    hasOption(name) {
        return has(this.options, name);
    }
    hasOptions() {
        return Object.keys(this.options).length > 0;
    }

    setValue(name, value, ignoreUnknown) {
        if (!this.hasOption(name)) {
            if (ignoreUnknown) {
                return;
            }

            throw new Error(`No option is defined for "${name}"`);
        }

        const option = this.options[name];
        const oldValue = this.values[name];
        const newValue = option.params.maxCount
            ? option.normalize.call(null, value, oldValue)
            : Boolean(value);

        if (!has(this.values, name) || newValue !== oldValue) {
            this.values[name] = newValue;

            if (typeof option.shortcut === 'function') {
                const values = option.shortcut.call(null, newValue) || {};

                if (has(values, name)) {
                    throw new Error('Shortcut option can not to set a value for itself');
                }

                this.setValues(values, true);
            }
        }

        return this.values[name];
    }
    setValues(values, ignoreUnknown) {
        for (const [name, value] of Object.entries(values)) {
            this.setValue(name, value, ignoreUnknown);
        }
    }
    reset() {
        this.values = {
            ...this.defaults_
        };
    }
    normalize(values = {}) {
        const normalized = {
            ...this.defaults_
        };

        for (const [name, value] of Object.entries(values)) {
            if (this.hasOption(name)) {
                normalized[name] = this.options[name].normalize.call(this, value);
            }
        }

        return normalized;
    }

    command(nameOrCommand, params, config) {
        let name;
        let command;

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
        let subcommand = this.commands[name];

        if (!subcommand) {
            // create new one if not exists
            subcommand = command;
            subcommand.end_ = this;
            this.commands[name] = subcommand;
        }

        return subcommand;
    }
    end() {
        return this.end_;
    }
    hasCommands() {
        return Object.keys(this.commands).length > 0;
    }

    version(version, usage, description) {
        if (this.version_) {
            throw new Error('Version for command could be set only once');
        }

        this.version_ = version;
        this.infoOption(
            usage || '-v, --version',
            description || 'Output version',
            () => version
        );

        return this;
    }
    description(description) {
        if (this.description_) {
            throw new Error('Description for command could be set only once');
        }

        this.description_ = description;

        return this;
    }

    extend(fn, ...args) {
        fn(this, ...args);
        return this;
    }

    parse(argv, suggest) {
        return processArgv(this, argv || process.argv.slice(2), suggest);
    }
    run(argv, context = this.initContext_()) {
        const commandPipeline = this.parse(argv);

        for (let i = 0; i < commandPipeline.length; i++) {
            const chunk = commandPipeline[i];

            if (chunk.infoOptions.length) {
                chunk.infoOptions[0].info(commandPipeline.slice(0, i + 1));
                return;
            }
        }

        let prevCommand;
        let command;
        let chunk;

        for (chunk of commandPipeline) {
            command = chunk.command;

            // reset command values
            command.reset();
            command.context = context;
            command.root = this;

            if (prevCommand) {
                prevCommand.delegate_(command);
            }

            // apply beforeInit options
            for (const entry of chunk.options) {
                if (entry.option.beforeInit) {
                    command.setValue(entry.option.camelName, entry.value);
                }
            }

            command.init_(chunk.args.slice());     // use slice to avoid args mutation in handler

            if (chunk.args.length) {
                command.args_(chunk.args.slice()); // use slice to avoid args mutation in handler
            }

            // apply regular options
            for (const entry of chunk.options) {
                if (!entry.option.beforeInit) {
                    command.setValue(entry.option.camelName, entry.value);
                }
            }

            prevCommand = command;
        }

        // return last command action result
        if (command) {
            return command.action_(chunk.args, chunk.literalArgs);
        }
    }

    showHelp(commandPath) {
        console.log(showCommandHelp(this, commandPath));
    }
};

module.exports = Command;
