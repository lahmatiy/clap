module.exports = class Params {
    constructor(description = '') {
        // params [..<required>] [..[optional]]
        // <foo> - require
        // [foo] - optional
        let tmp;
        let left = description.trim();

        this.minCount = 0;
        this.maxCount = 0;
        this.args = [];

        do {
            tmp = left;
            left = left.replace(/^<([a-zA-Z][a-zA-Z0-9\-\_]*)>\s*/, (_, name) => {
                this.args.push({ name, required: true });
                this.minCount++;
                this.maxCount++;

                return '';
            });
        } while (tmp !== left);

        do {
            tmp = left;
            left = left.replace(/^\[([a-zA-Z][a-zA-Z0-9\-\_]*)\]\s*/, (_, name) => {
                this.args.push({ name, required: false });
                this.maxCount++;

                return '';
            });
        } while (tmp !== left);

        if (left) {
            throw new Error(`Bad parameter description "${description.trim()}" in ${context}`);
        }
    }
};
