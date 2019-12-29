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
        command.defaults[option.camelName] = command.setValue(option.camelName, option.defValue);
    }

    return command;
}

function addHandlerSetter(command, name) {
    command.handlers[name] = noop;
    command[name] = function(fn) {
        if (typeof fn !== 'function') {
            throw new Error(`Value for "${name}" method should be a function`);
        }

        command.handlers[name] = fn.bind(command);

        return command;
    };
}

module.exports = class Command {
    constructor(name, params, config) {
        config = config || {};

        this.name = name;
        this.params = new Params(params || '', `"${this.name}" command definition`);
        this.commands = {};
        this.lastCommandHost = null;
        this.options = {};
        this.short = {};
        this.long = {};
        this.values = {};
        this.defaults = {};
        this.handlers = {};
        this.meta = {
            description: '',
            version: ''
        };

        addHandlerSetter(this, 'init');
        addHandlerSetter(this, 'initContext');
        addHandlerSetter(this, 'args');
        addHandlerSetter(this, 'delegate');
        addHandlerSetter(this, 'action');

        if ('defaultHelp' in config === false || config.defaultHelp) {
            this.actionOption('-h, --help', 'Output usage information', chunks =>
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

    // options
    option(usage, description, ...optionOpts) {
        return addOptionToCommand(this, new Option(usage, description, ...optionOpts));
    }
    actionOption(usage, description, getInfo) {
        return this.option(
            usage,
            description,
            { action: commands => this.infoOptionAction(getInfo(commands)) }
        );
    }
    shortcutOption(usage, description, fn, ...options) {
        return addOptionToCommand(this, new Option(usage, description, {
            ...Option.normalizeOptions(...options),
            shortcut: fn
        }));
    }
    hasOption(name) {
        return has(this.options, name);
    }
    hasOptions() {
        return Object.keys(this.options).length > 0;
    }

    // command chaining
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
            subcommand.lastCommandHost = this;
            this.commands[name] = subcommand;
        }

        return subcommand;
    }
    end() {
        return this.lastCommandHost;
    }
    hasCommand(name) {
        return has(this.commands, name);
    }
    hasCommands() {
        return Object.keys(this.commands).length > 0;
    }

    // values
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
                this.setValues(
                    option.shortcut.call(null, newValue, oldValue) || {},
                    true
                );
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
            ...this.defaults
        };
    }
    normalize(values = {}) {
        const normalized = {
            ...this.defaults
        };

        for (const [name, value] of Object.entries(values)) {
            if (this.hasOption(name)) {
                normalized[name] = this.options[name].normalize.call(this, value);
            }
        }

        return normalized;
    }

    // meta
    version(version, usage, description) {
        this.meta.version = version;
        this.actionOption(
            usage || '-v, --version',
            description || 'Output version',
            () => version
        );

        return this;
    }
    description(description) {
        this.meta.description = description;

        return this;
    }

    // parse & run
    parse(argv, suggest) {
        return processArgv(this, argv || process.argv.slice(2), suggest);
    }
    run(argv, context = this.handlers.initContext()) {
        const commandPipeline = this.parse(argv);

        for (let i = 0; i < commandPipeline.length; i++) {
            const chunk = commandPipeline[i];

            if (chunk.actionOptions.length) {
                chunk.actionOptions[0].action(commandPipeline.slice(0, i + 1));
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

            if (prevCommand) {
                prevCommand.handlers.delegate(command);
            }

            // apply beforeInit options
            for (const entry of chunk.options) {
                if (entry.option.beforeInit) {
                    command.setValue(entry.option.camelName, entry.value);
                }
            }

            command.handlers.init(chunk.args.slice());     // use slice to avoid args mutation in handler

            if (chunk.args.length) {
                command.handlers.args(chunk.args.slice()); // use slice to avoid args mutation in handler
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
            return command.handlers.action(chunk.args, chunk.literalArgs);
        }
    }

    // misc
    extend(fn, ...args) {
        fn(this, ...args);
        return this;
    }
    showHelp(commandPath) {
        console.log(showCommandHelp(this, commandPath));
    }
};
