const Params = require('./params');
const camelize = name => name.replace(/-(.)/g, (m, ch) => ch.toUpperCase());

class Option {
    static normalizeOptions(opt1, opt2) {
        if (typeof opt1 === 'function') {
            opt1 = {
                normalize: opt1,
                defValue: opt2
            };
        }

        return opt1 || {};
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

    constructor(usage, description, opt1, opt2) {
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
        this.defValue = defValue;
        this.params = params;
        this.required = false;
        this.beforeInit = false;
        this.info = undefined;
        this.normalize = value => value;

        if (typeof opt1 !== 'undefined') {
            if (opt2 === Option.info) {
                // 4 args: ..., any, Option.info
                this.info = opt1;
                this.defValue = undefined;
            } else if (typeof opt2 !== 'undefined') {
                // 4 args: ..., any, any
                if (typeof opt1 === 'function') {
                    this.normalize = opt1;
                }

                this.defValue = opt2;
            } else {
                // 3 args
                if (opt1 && opt1.constructor === Object) {
                    // 3 args: ..., object
                    if (typeof opt1.normalize === 'function') {
                        this.normalize = opt1.normalize;
                    }

                    if (typeof opt1.shortcut === 'function') {
                        this.shortcut = opt1.shortcut;
                    }

                    if (hasOwnProperty.call(opt1, 'defValue')) {
                        this.defValue = opt1.defValue;
                    }

                    // old name for `beforeInit` setting is `hot`
                    this.beforeInit = Boolean('beforeInit' in opt1 ? opt1.beforeInit : opt1.hot);
                } else {
                    if (typeof opt1 === 'function') {
                        // 3 args: ..., function
                        this.normalize = opt1;
                    } else {
                        // 3 args: ..., any
                        this.defValue = opt1;
                    }
                }
            }
        }
    }
};

Option.info = {};

module.exports = Option;
