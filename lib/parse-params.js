var Argument = require('./argument');

module.exports = function parseParams(str) {
    // params [..<required>] [..[optional]]
    // <foo> - require
    // [foo] - optional
    var tmp;
    var left = str.trim();
    var result = {
        minArgsCount: 0,
        maxArgsCount: 0,
        args: []
    };

    do {
        tmp = left;
        left = left.replace(/^<([a-zA-Z][a-zA-Z0-9\-\_]*)>\s*/, function(m, name) {
            result.args.push(new Argument(name, true));
            result.minArgsCount++;
            result.maxArgsCount++;

            return '';
        });
    }
    while (tmp !== left);

    do {
        tmp = left;
        left = left.replace(/^\[([a-zA-Z][a-zA-Z0-9\-\_]*)\]\s*/, function(m, name) {
            result.args.push(new Argument(name, false));
            result.maxArgsCount++;

            return '';
        });
    }
    while (tmp !== left);

    if (left) {
        throw new Error('Bad parameter description: ' + str);
    }

    return result.args.length ? result : false;
};
