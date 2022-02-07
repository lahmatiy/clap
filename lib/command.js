import getCommandHelp from './help.js';
import parseArgv from './parse-argv.js';
import Params from './params.js';
import Option from './option.js';

const noop = () => {}; // nothing todo
const self = value => value;
const defaultHelpAction = (instance, _, { commandPath }) => instance.outputHelp(commandPath);
const defaultVersionAction = instance => console.log(instance.meta.version);
const lastCommandHost = new WeakMap();
const lastAddedOption = new WeakMap();

export default class Command {
    constructor(usage = '', ...rest) {
        if (rest.length > 0) {
            throw new Error('Second parameter in Command constructor is deprecated, use first parameter to define args instead, i.e. command("name [arg1] [arg2]")');
        }

        const [name, params] = usage.trim().split(/(\s+.*)$/);

        this.name = name;
        this.params = new Params(params, `"${name}" command definition`);
        this.options = new Map();
        this.commands = new Map();
        this.meta = {
            description: '',
            version: '',
            help: null
        };

        this.handlers = {
            init: noop,
            applyConfig: noop,
            finishContext: noop,
            action: self
        };

        this.help();
    }

    // handlers
    init(fn) {
        this.handlers.init = fn.bind(null);
        return this;
    }
    applyConfig(fn) {
        this.handlers.applyConfig = fn.bind(null);
        return this;
    }
    finishContext(fn) {
        this.handlers.finishContext = fn.bind(null);
        return this;
    }
    action(fn) {
        this.handlers.action = fn.bind(null);
        return this;
    }

    // definition chaining
    extend(fn, ...args) {
        fn(this, ...args);
        return this;
    }
    description(description) {
        this.meta.description = description;

        return this;
    }
    version(version, usage, description, action) {
        this.meta.version = version;
        this.option(
            usage || '-v, --version',
            description || 'Output version',
            { action: action || defaultVersionAction }
        );

        return this;
    }
    help(usage, description, action) {
        if (this.meta.help) {
            this.meta.help.names().forEach(name => this.options.delete(name));
            this.meta.help = null;
        }

        if (usage !== false) {
            this.option(
                usage || '-h, --help',
                description || 'Output usage information',
                { action: action || defaultHelpAction }
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
            if (this.options.has(name)) {
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
    command(usageOrCommand) {
        const subcommand = typeof usageOrCommand === 'string'
            ? new Command(usageOrCommand)
            : usageOrCommand;
        const name = subcommand.name;

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

        for (const { name, normalize, default: value } of this.getOptions()) {
            if (typeof value !== 'undefined') {
                storage[name] = normalize(value);
            }
        }

        return Object.assign(new Proxy(storage, {
            set: (obj, key, value, reciever) => {
                const option = this.getOption(key);

                if (!option) {
                    return true; // throw new Error(`Unknown option: "${key}"`);
                }

                const oldValue = obj[option.name];
                const newValue = option.normalize(value, oldValue);
                const retValue = Reflect.set(obj, option.name, newValue);

                if (option.shortcut) {
                    Object.assign(reciever, option.shortcut.call(null, newValue, oldValue));
                }

                return retValue;
            }
        }), values);
    }

    // misc
    messageRef() {
        return `${this.usage}${this.params.args.map(arg => ` ${arg.name}`)}`;
    }
    getOption(name) {
        return this.options.get(name) || null;
    }
    getOptions() {
        return [...new Set(this.options.values())];
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
