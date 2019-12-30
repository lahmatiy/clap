const Params = require('./params');
const camelize = name => name.replace(/-(.)/g, (m, ch) => ch.toUpperCase());
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
            action: ensureFunction(raw.action)
        };
    }

    static parseUsage(usage) {
        let short;
        let name;
        let long;
        let defValue;
        let params;
        let left = usage.trim()
            // short usage
            // -x
            .replace(/^-([a-zA-Z])(?:\s*,\s*|\s+)/, (_, m) => {
                short = m;

                return '';
            })
            // long usage
            // --flag
            // --no-flag - invert value if flag is boolean
            .replace(/^--([a-zA-Z][a-zA-Z0-9\-\_]+)\s*/, (_, m) => {
                long = m;
                name = m.replace(/(^|-)no-/, '$1');
                defValue = name !== long;

                return '';
            });

        if (!long) {
            throw new Error(`Usage has no long name: ${usage}`);
        }

        params = new Params(left, `option usage: ${usage}`);

        if (params.maxCount > 0) {
            left = '';
            name = long;
            defValue = undefined;
        }

        if (left) {
            throw new Error('Bad usage for option: ' + usage);
        }

        return { short, long, name, params, defValue };
    }

    constructor(usage, description, ...options) {
        const { short, long, name, params, defValue } = Option.parseUsage(usage);

        // names
        this.short = short;
        this.long = long;
        this.name = name || long;
        this.camelName = camelize(this.name);

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
