const Params = require('./params');
const camelcase = name => name.replace(/-(.)/g, (m, ch) => ch.toUpperCase());
const ensureFunction = (fn, fallback) => typeof fn === 'function' ? fn : fallback;
const self = value => value;

module.exports = class Option {
    static normalizeOptions(opt1, opt2) {
        const raw = typeof opt1 === 'function'
            ? { normalize: opt1, value: opt2 }
            : opt1 && typeof opt1 === 'object'
                ? opt1
                : { value: opt1 };

        return {
            defValue: !ensureFunction(raw.action) ? raw.value : undefined,
            normalize: ensureFunction(raw.normalize, self),
            shortcut: ensureFunction(raw.shortcut),
            action: ensureFunction(raw.action),
            config: Boolean(raw.config)
        };
    }

    static parseUsage(usage) {
        const [m, short, long = ''] = usage.trim()
            .match(/^(?:(-[a-z\d])(?:\s*,\s*|\s+))?(--[a-z][a-z\d\-\_]*)?\s*/i) || [];

        if (!long) {
            throw new Error(`Usage has no long name: ${usage}`);
        }

        let name = long.replace(/^--(no-)?/, ''); // --no-flag - invert value if flag is boolean
        let defValue = /--no-/.test(long);
        let params = new Params(usage.slice(m.length), `option usage: ${usage}`);

        if (params.maxCount > 0) {
            name = long.slice(2);
            defValue = undefined;
        }

        return { short, long, name, params, defValue };
    }

    constructor(usage, description, ...options) {
        const { short, long, name, params, defValue } = Option.parseUsage(usage);

        // names
        this.short = short;
        this.long = long;
        this.name = camelcase(name);

        // meta
        this.usage = usage.trim();
        this.description = description || '';

        // attributes
        this.params = params;
        Object.assign(this, Option.normalizeOptions(...options));

        // ignore defValue from config for boolean options
        if (typeof defValue === 'boolean' && !this.action) {
            this.defValue = defValue;
        }
    }

    messageRef() {
        return `${this.usage} ${this.description}`;
    }
};
