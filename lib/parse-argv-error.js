const CliError = function(message) {
    this.message = message;
};
CliError.prototype = Object.create(Error.prototype);
CliError.prototype.name = 'CliError';
CliError.prototype.clap = true;

module.exports = CliError;
