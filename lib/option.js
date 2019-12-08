var parseParams = require('./parse-params');

function camelize(name) {
    return name.replace(/-(.)/g, function(m, ch) {
        return ch.toUpperCase();
    });
}

/**
* @class
* @param {string} usage
* @param {string} description
*/
var Option = function(usage, description, opt1, opt2) {
    var self = this;
    var params;
    var left = usage.trim()
        // short usage
        // -x
        .replace(/^-([a-zA-Z])(?:\s*,\s*|\s+)/, function(m, name) {
            self.short = name;

            return '';
        })
        // long usage
        // --flag
        // --no-flag - invert value if flag is boolean
        .replace(/^--([a-zA-Z][a-zA-Z0-9\-\_]+)\s*/, function(m, name) {
            self.long = name;
            self.name = name.replace(/(^|-)no-/, '$1');
            self.defValue = self.name !== self.long;

            return '';
        });

    if (!this.long) {
        throw new Error('Usage has no long name: ' + usage);
    }

    try {
        params = parseParams(left);
    } catch (e) {
        throw new Error('Bad paramenter in option usage: ' + usage, e);
    }

    if (params) {
        left = '';
        this.name = this.long;
        this.defValue = undefined;

        Object.assign(this, params);
    }

    if (left) {
        throw new Error('Bad usage for option: ' + usage);
    }

    if (!this.name) {
        this.name = this.long;
    }

    this.description = description || '';
    this.usage = usage.trim();
    this.camelName = camelize(this.name);

    if (typeof opt1 !== 'undefined') {
        if (opt2 === Option.info) {
            this.info = opt1;
            this.defValue = undefined;
        } else if (typeof opt2 !== 'undefined') {
            if (typeof opt1 === 'function') {
                this.normalize = opt1;
            }

            this.defValue = opt2;
        } else {
            if (opt1 && opt1.constructor === Object) {
                for (var key in opt1) {
                    if (key === 'normalize' ||
                        key === 'defValue' ||
                        key === 'beforeInit') {
                        this[key] = opt1[key];
                    }
                }

                // old name for `beforeInit` setting is `hot`
                if (opt1.hot) {
                    this.beforeInit = true;
                }
            } else {
                if (typeof opt1 === 'function') {
                    this.normalize = opt1;
                } else {
                    this.defValue = opt1;
                }
            }
        }
    }
};

Option.info = {};
Option.prototype = {
    name: '',
    description: '',
    short: '',
    long: '',

    beforeInit: false,
    required: false,
    minArgsCount: 0,
    maxArgsCount: 0,
    args: null,

    info: undefined,
    defValue: undefined,
    normalize: value => value
};

module.exports = Option;
