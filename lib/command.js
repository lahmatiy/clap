const getCommandHelp = require('./help');
const parseArgv = require('./parse-argv');
const Params = require('./params');
const Option = require('./option');

const noop = () => {}; // nothing todo
const self = value => value;
const defaultHelpAction = (instance, _, { commandPath }) => instance.outputHelp(commandPath);
const defaultVersionAction = instance => console.log(instance.meta.version);
const lastCommandHost = new WeakMap();
const lastAddedOption = new WeakMap();

const handlers = ['init', 'applyConfig', 'finishContext', 'action'].reduce((res, name) => {
    res.initial[name] = name === 'action' ? self : noop;
    res.setters[name] = function(fn) {
        this.handlers[name] = fn.bind(null);

        return this;
    };
    return res;
}, { initial: {}, setters: {} });

module.exports = class Command {
    constructor(name, params) {
        this.name = name;
        this.params = new Params(params || '', `"${this.name}" command definition`);
        this.options = new Map();
        this.commands = new Map();
        this.meta = {
            description: '',
            version: '',
            help: null
        };

        this.handlers = { ...handlers.initial };
        Object.assign(this, handlers.setters);

        this.help();
    }

    // definition chaining
    description(description) {
        this.meta.description = description;

        return this;
    }
    version(version, usage, description, action) {
        this.meta.version = version;
        this.actionOption(
            usage || '-v, --version',
            description || 'Output version',
            action || defaultVersionAction
        );

        return this;
    }
    help(usage, description, action) {
        if (this.meta.help) {
            this.meta.help.names().forEach(name => this.options.delete(name));
            this.meta.help = null;
        }

        if (usage !== false) {
            this.actionOption(
                usage || '-h, --help',
                description || 'Output usage information',
                action || defaultHelpAction
            );
            this.meta.help = lastAddedOption.get(this);
        }

        return this;
    }
    option(usage, description, ...optionOpts) {
        const option = new Option(usage, description, ...optionOpts);
        const nameType = ['Long option', 'Short option', 'Option'];
        const names = option.names();

        names.forEach((name, idx) => {
            if (this.hasOption(name)) {
                throw new Error(
                    `${nameType[names.length === 2 ? idx * 2 : idx]} name "${name}" already in use by ${this.getOption(name).messageRef()}`
                );
            }
        });

        for (const name of names) {
            this.options.set(name, option);
        }

        lastAddedOption.set(this, option);

        return this;
    }
    actionOption(usage, description, action) {
        return this.option(usage, description, { action });
    }
    shortcutOption(usage, description, shortcut, ...options) {
        return this.option(usage, description, {
            ...Option.normalizeOptions(...options),
            shortcut
        });
    }
    command(nameOrCommand, params, config) {
        let subcommand;
        let name;

        if (nameOrCommand instanceof Command) {
            subcommand = nameOrCommand;
            name = subcommand.name;
        } else {
            name = nameOrCommand;
            subcommand = new Command(name, params, config);
        }

        if (!/^[a-z][a-z0-9\-\_]*$/i.test(name)) {
            throw new Error(`Bad subcommand name: ${name}`);
        }

        // search for existing one
        if (this.commands.has(name)) {
            throw new Error(
                `Subcommand name "${name}" already in use by ${this.getCommand(name).messageRef()}`
            );
        }

        // attach subcommand
        this.commands.set(name, subcommand);
        lastCommandHost.set(subcommand, this);

        return subcommand;
    }
    end() {
        const host = lastCommandHost.get(this) || null;
        lastCommandHost.delete(this);
        return host;
    }

    // helpers
    extend(fn, ...args) {
        fn(this, ...args);
        return this;
    }
    clone(deep) {
        const clone = Object.create(Object.getPrototypeOf(this));

        for (const [key, value] of Object.entries(this)) {
            clone[key] = value && typeof value === 'object'
                ? (value instanceof Map
                    ? new Map(value)
                    : Object.assign(Object.create(Object.getPrototypeOf(value)), value))
                : value;
        }

        if (deep) {
            for (const [name, subcommand] of clone.commands.entries()) {
                clone.commands.set(name, subcommand.clone(deep));
            }
        }

        return clone;
    }
    createOptionValues(values) {
        const storage = Object.create(null);

        for (const { name, normalize, defValue } of this.getOptions()) {
            if (typeof defValue !== 'undefined') {
                storage[name] = normalize(defValue);
            }
        }

        return Object.assign(new Proxy(storage, {
            set: (obj, key, value, reciever) => {
                const option = this.getOption(key);

                if (!option) {
                    return true; // throw new Error(`Unknown option: "${key}"`);
                }

                const oldValue = obj[option.name];
                const newValue = option.params.maxCount ? option.normalize(value, oldValue) : Boolean(value);
                const retValue = Reflect.set(obj, option.name, newValue);

                if (option.shortcut) {
                    Object.assign(reciever, option.shortcut.call(null, newValue, oldValue));
                }

                return retValue;
            }
        }), values);
    }

    // parse & run
    parse(argv, suggest) {
        let chunk = {
            context: {
                commandPath: [],
                options: null,
                args: null,
                literalArgs: null
            },
            next: {
                command: this,
                argv: argv || process.argv.slice(2)
            }
        };

        do {
            chunk = parseArgv(
                chunk.next.command,
                chunk.next.argv,
                chunk.context,
                suggest
            );
        } while (chunk.next);

        return chunk;
    }
    run(argv) {
        const chunk = this.parse(argv);

        if (typeof chunk.action === 'function') {
            return chunk.action.call(null, chunk.context);
        }
    }

    // misc
    messageRef() {
        return `${this.usage}${this.params.args.map(arg => ` ${arg.name}`)}`;
    }
    hasOption(name) {
        return this.options.has(name);
    }
    hasOptions() {
        return this.options.size > 0;
    }
    getOption(name) {
        return this.options.get(name) || null;
    }
    getOptions() {
        return [...new Set(this.options.values())];
    }
    hasCommand(name) {
        return this.commands.has(name);
    }
    hasCommands() {
        return this.commands.size > 0;
    }
    getCommand(name) {
        return this.commands.get(name) || null;
    }
    getCommands() {
        return [...this.commands.values()];
    }
    outputHelp(commandPath) {
        console.log(getCommandHelp(this, Array.isArray(commandPath) ? commandPath.slice(0, -1) : null));
    }
};
