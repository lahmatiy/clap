import { deepEqual, notStrictEqual, notDeepEqual } from 'assert';
import { command as cli } from 'clap';

describe('Command#clone()', () => {
    let command;
    let clone;

    beforeEach(() => {
        command = cli('test')
            .description('test')
            .option('--test-option', 'xxx')
            .command('foo')
                .option('--foo-option', 'yyy') // eslint-disable-line indent
            .end();
        clone = command.clone();
    });

    it('should be deep equal, but dictionaries should not be the same', () => {
        deepEqual(clone, command);
        notStrictEqual(clone.commands, command.commands);
        notStrictEqual(clone.options, command.options);
    });

    it('should be deep equal if set the same version', () => {
        command.version('1.1.1');
        notDeepEqual(clone, command);

        clone.version('1.1.1');
        deepEqual(clone, command);
    });

    it('should be deep equal if add the same option', () => {
        command.option('--extra', 'zzz');
        notDeepEqual(clone, command);

        clone.option('--extra', 'zzz');
        deepEqual(clone, command);
    });

    it('should be deep equal if add the same subcommand', () => {
        command.command('bar').option('--abc', 'aaa');
        notDeepEqual(clone, command);

        clone.command('bar').option('--abc', 'aaa');
        deepEqual(clone.commands.bar, command.commands.bar);
    });

    it('should be deep equal if add the same option to nested command with deep cloning', () => {
        clone = command.clone(true);

        command.getCommand('foo').option('--extra', 'zzz');
        notDeepEqual(clone, command);

        clone.getCommand('foo').option('--extra', 'zzz');
        deepEqual(clone, command);
    });

    it('should apply handlers as expected', () => {
        const actual = clone
            .run(['--test-option']);

        deepEqual(actual.options, {
            testOption: true
        });
    });
});
