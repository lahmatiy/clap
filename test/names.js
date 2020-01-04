const assert = require('assert');
const cli = require('../lib');

describe('names', function() {
    it('bool option should be in values, options and long', function() {
        const command = cli.command()
            .option('--bool');

        assert([...command.options.keys()], ['--bool', 'bool']);
        assert.notStrictEqual(command.getOption('--bool'), null);
        assert.notStrictEqual(command.getOption('bool'), null);
    });

    it('inverted bool option should be in values and options as normal name and as is in long', function() {
        const command = cli.command()
            .option('--no-bool');

        assert([...command.options.keys()], ['--no-bool', 'bool']);
        assert.notStrictEqual(command.getOption('--no-bool'), null);
        assert.notStrictEqual(command.getOption('bool'), null);
    });

    it('dasherized option should store as camelName in options', function() {
        const command = cli.command()
            .option('--bool-option');

        assert([...command.options.keys()], ['--bool-option', 'boolOption']);
        assert.notStrictEqual(command.getOption('--bool-option'), null);
        assert.notStrictEqual(command.getOption('boolOption'), null);
    });

    it('non-bool option should have name as is', function() {
        const command = cli.command()
            .option('--no-bool <arg>');

        assert([...command.options.keys()], ['--no-bool', 'noBool']);
        assert.notStrictEqual(command.getOption('--no-bool'), null);
        assert.notStrictEqual(command.getOption('noBool'), null);
    });

    it('should be exception if no long form', function() {
        assert.throws(
            () => cli.command().option('-b'),
            /Usage has no long name: -b/
        );
    });

    it('#getOption() should not resolve option name by long form', function() {
        const command = cli.command()
            .option('--long-form');

        assert.strictEqual(command.getOption('long-form'), null);
    });

    it('#getOption() should resolve option name by camelName', function() {
        const command = cli.command()
            .option('--long-form');

        assert.notStrictEqual(command.getOption('longForm'), null);
    });
});
