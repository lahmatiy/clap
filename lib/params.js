export default class Params {
    constructor(params = '', context) {
        // params = ..<required> ..[optional]
        // <foo> - required
        // [foo] - optional
        let left = params.trim();
        let m;

        this.args = [];

        while (m = left.match(/^<([^>]+)>\s*/)) {
            left = left.slice(m[0].length);
            this.args.push({ name: m[1], required: true });
        }

        this.minCount = this.args.length;

        while (m = left.match(/^\[([^\]]+)\]\s*/)) {
            left = left.slice(m[0].length);
            this.args.push({ name: m[1], required: false });
        }

        this.maxCount = this.args.length;

        if (left) {
            throw new Error(`Bad parameters description "${params.trim()}" in ${context}`);
        }
    }
};
