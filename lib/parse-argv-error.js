export default class CliError extends Error {
    constructor(...args) {
        super(...args);
        this.name = 'CliError';
        this.clap = true;
    }
};
