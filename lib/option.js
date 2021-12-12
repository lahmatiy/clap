import Params from './params.js';

const camelcase = name => name.replace(/-(.)/g, (m, ch) => ch.toUpperCase());
const ensureFunction = (fn, fallback) => typeof fn === 'function' ? fn : fallback;
const self = value => value;

export default class Option {
    static normalizeOptions(opt1, opt2) {
        const raw = typeof opt1 === 'function'
            ? { normalize: opt1, default: opt2 }
            : opt1 && typeof opt1 === 'object'
                ? opt1
                : { default: opt1 };

        return {
            default: raw.default,
            normalize: ensureFunction(raw.normalize, self),
            shortcut: ensureFunction(raw.shortcut),
            action: ensureFunction(raw.action),
            config: Boolean(raw.config)
        };
    }

    static parseUsage(usage) {
        const [m, short, long = ''] = usage.trim()
            .match(/^(?:(-[a-z\d])(?:\s*,\s*|\s+))?(--[a-z][a-z\d\-\_]*)\s*/i) || [];

        if (!m) {
            throw new Error(`Usage has no long name: ${usage}`);
        }

        let params = new Params(usage.slice(m.length), `option usage: ${usage}`);

        return { short, long, params };
    }

    constructor(usage, description, ...rawOptions) {
        const { short, long, params } = Option.parseUsage(usage);
        const options = Option.normalizeOptions(...rawOptions);

        const isBool = params.maxCount === 0 && !options.action;
        let name = camelcase(long.replace(isBool ? /^--(no-)?/ : /^--/, '')); // --no-flag - invert value if flag is boolean

        if (options.action) {
            options.default = undefined;
        } else if (isBool) {
            options.normalize = Boolean;
            options.default = long.startsWith('--no-');
        }

        // names
        this.short = short;
        this.long = long;
        this.name = name;

        // meta
        this.usage = usage.trim();
        this.description = description || '';

        // attributes
        this.params = params;
        Object.assign(this, options);
    }

    messageRef() {
        return `${this.usage} ${this.description}`;
    }

    names() {
        return [this.long, this.short, this.name].filter(Boolean);
    }
};
