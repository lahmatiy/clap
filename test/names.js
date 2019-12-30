const assert = require('assert');
const cli = require('../lib');

describe('names', function() {
    it('bool option should be in values, options and long', function() {
        const command = cli.command()
            .option('--bool');

        assert([...command.options.keys()], ['--bool', 'bool']);
        assert(command.hasOption('--bool'));
        assert(command.hasOption('bool'));
    });

    it('inverted bool option should be in values and options as normal name and as is in long', function() {
        const command = cli.command()
            .option('--no-bool');

        assert([...command.options.keys()], ['--no-bool', 'bool']);
        assert(command.hasOption('--no-bool'));
        assert(command.hasOption('bool'));
    });

    it('dasherized option should store as camelName in options', function() {
        const command = cli.command()
            .option('--bool-option');

        assert([...command.options.keys()], ['--bool-option', 'boolOption']);
        assert(command.hasOption('--bool-option'));
        assert(command.hasOption('boolOption'));
    });

    it('non-bool option should have name as is', function() {
        const command = cli.command()
            .option('--no-bool <arg>');

        assert([...command.options.keys()], ['--no-bool', 'noBool']);
        assert(command.hasOption('--no-bool'));
        assert(command.hasOption('noBool'));
    });

    it('should be exception if no long form', function() {
        assert.throws(
            () => cli.command().option('-b'),
            /Usage has no long name: -b/
        );
    });

    it('#hasOption should not resolve option name by long form', function() {
        const command = cli.command()
            .option('--long-form');

        assert(command.hasOption('long-form') === false);
    });

    it('#hasOption should resolve option name by camelName', function() {
        const command = cli.command()
            .option('--long-form');

        assert(command.hasOption('longForm'));
    });
});
