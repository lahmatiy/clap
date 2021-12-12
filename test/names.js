import assert, { notStrictEqual, throws, strictEqual } from 'assert';
import * as clap from 'clap';

describe('names', () => {
    it('bool option should be in values, options and long', () => {
        const command = clap.command()
            .option('--bool');

        assert([...command.options.keys()], ['--bool', 'bool']);
        notStrictEqual(command.getOption('--bool'), null);
        notStrictEqual(command.getOption('bool'), null);
    });

    it('inverted bool option should be in values and options as normal name and as is in long', () => {
        const command = clap.command()
            .option('--no-bool');

        assert([...command.options.keys()], ['--no-bool', 'bool']);
        notStrictEqual(command.getOption('--no-bool'), null);
        notStrictEqual(command.getOption('bool'), null);
    });

    it('dasherized option should store as camelName in options', () => {
        const command = clap.command()
            .option('--bool-option');

        assert([...command.options.keys()], ['--bool-option', 'boolOption']);
        notStrictEqual(command.getOption('--bool-option'), null);
        notStrictEqual(command.getOption('boolOption'), null);
    });

    it('non-bool option should have name as is', () => {
        const command = clap.command()
            .option('--no-bool <arg>');

        assert([...command.options.keys()], ['--no-bool', 'noBool']);
        notStrictEqual(command.getOption('--no-bool'), null);
        notStrictEqual(command.getOption('noBool'), null);
    });

    it('should be exception if no long form', () => {
        throws(
            () => clap.command().option('-b'),
            /Usage has no long name: -b/
        );
    });

    it('#getOption() should not resolve option name by long form', () => {
        const command = clap.command()
            .option('--long-form');

        strictEqual(command.getOption('long-form'), null);
    });

    it('#getOption() should resolve option name by camelName', () => {
        const command = clap.command()
            .option('--long-form');

        notStrictEqual(command.getOption('longForm'), null);
    });
});
