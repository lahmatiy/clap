var assert = require('assert');
var cli = require('../lib');

describe('Command#clone()', () => {
    let command;
    let clone;

    beforeEach(() => {
        command = cli
            .command('test')
            .description('test')
            .option('--test-option', 'xxx')
            .command('foo')
                .option('--foo-option', 'yyy') // eslint-disable-line indent
            .end();
        clone = command.clone();
    });

    it('should be deep equal, but dictionaries should not be the same', () => {
        assert.deepEqual(clone, command);
        assert.notStrictEqual(clone.commands, command.commands);
        assert.notStrictEqual(clone.options, command.options);
    });

    it('should be deep equal if set the same version', () => {
        command.version('1.1.1');
        assert.notDeepEqual(clone, command);

        clone.version('1.1.1');
        assert.deepEqual(clone, command);
    });

    it('should be deep equal if add the same option', () => {
        command.option('--extra', 'zzz');
        assert.notDeepEqual(clone, command);

        clone.option('--extra', 'zzz');
        assert.deepEqual(clone, command);
    });

    it('should be deep equal if add the same subcommand', () => {
        command.command('bar').option('--abc', 'aaa');
        assert.notDeepEqual(clone, command);

        clone.command('bar').option('--abc', 'aaa');
        assert.deepEqual(clone.commands.bar, command.commands.bar);
    });

    it('should be deep equal if add the same option to nested command with deep cloning', () => {
        clone = command.clone(true);

        command.commands.foo.option('--extra', 'zzz');
        assert.notDeepEqual(clone, command);

        clone.commands.foo.option('--extra', 'zzz');
        assert.deepEqual(clone, command);
    });

    it('should apply handlers as expected', () => {
        const actual = clone
            .run(['--test-option']);

        assert.deepEqual(actual.options, {
            testOption: true
        });
    });
});
