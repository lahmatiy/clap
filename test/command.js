var assert = require('assert');
var stdout = require('test-console').stdout;
var cli = require('../lib');

describe('command run', function() {
    describe('init()/args()', function() {
        function regCall(name) {
            return function() {
                calls.push({
                    name: name,
                    this: this,
                    arguments: [].slice.call(arguments)
                });
            };
        }

        function sliceCallValues(field) {
            return calls.map(function(entry) {
                return entry[field];
            });
        }

        var command;
        var nestedCommand;
        var calls;

        beforeEach(function() {
            calls = [];
            command = cli.command('test', '[arg1]')
                .initContext(regCall('initContext'))
                .init(regCall('init'))
                .args(regCall('args'));
            nestedCommand = command.command('nested', '[arg2] [arg3]')
                .initContext(regCall('nested initContext'))
                .init(regCall('nested init'))
                .args(regCall('nested args'));
        });

        it('with no arguments should only init top level command', function() {
            command.run([]);
            assert.deepEqual(sliceCallValues('name'), ['initContext', 'init']);
        });

        it('with one argument should init and arg top level command', function() {
            command.run(['foo']);
            assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'args']);
            assert.deepEqual(sliceCallValues('arguments'), [[], [['foo']], [['foo']]]);
        });

        it('with first argument as command should init both commands', function() {
            command.run(['nested']);
            assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'nested init']);
        });

        it('should init and args both commands', function() {
            command.run(['foo', 'nested', 'bar']);
            assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'args', 'nested init', 'nested args']);
            assert.deepEqual(sliceCallValues('this'), [command, command, command, nestedCommand, nestedCommand]);
            assert.deepEqual(sliceCallValues('arguments'), [[], [['foo']], [['foo']], [['bar']], [['bar']]]);
        });

        it('should init and args top level command but only init nested', function() {
            command.run(['foo', 'nested']);
            assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'args', 'nested init']);
            assert.deepEqual(sliceCallValues('arguments'), [[], [['foo']], [['foo']], [[]]]);
        });

        it('should init top level command and init and args nested command', function() {
            command.run(['nested', 'bar', 'baz']);
            assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'nested init', 'nested args']);
            assert.deepEqual(sliceCallValues('arguments'), [[], [[]], [['bar', 'baz']], [['bar', 'baz']]]);
        });
    });

    describe('args and options', function() {
        var command;
        var collectedValues;

        beforeEach(function() {
            collectedValues = null;
            command = cli.command('test', '[foo]')
                .option('--foo', 'Foo')
                .option('--bar <number>', 'Bar')
                .action(function(args, literalArgs) {
                    collectedValues = {
                        values: this.values,
                        args,
                        literalArgs
                    };
                });
        });

        it('no arguments', function() {
            command.run([]);

            assert.deepEqual(collectedValues, {
                values: {
                    foo: false
                },
                args: [],
                literalArgs: []
            });
        });

        it('args', function() {
            command.run(['qux']);

            assert.deepEqual(collectedValues, {
                values: {
                    foo: false
                },
                args: ['qux'],
                literalArgs: []
            });
        });

        it('options', function() {
            command.run(['--foo', '--bar', '123']);

            assert.deepEqual(collectedValues, {
                values: {
                    foo: true,
                    bar: 123
                },
                args: [],
                literalArgs: []
            });
        });

        it('literal args', function() {
            command.run(['--', '--one', '--two', '123']);

            assert.deepEqual(collectedValues, {
                values: {
                    foo: false
                },
                args: [],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('args & options', function() {
            command.run(['qux', '--foo', '--bar', '123']);

            assert.deepEqual(collectedValues, {
                values: {
                    foo: true,
                    bar: 123
                },
                args: ['qux'],
                literalArgs: []
            });
        });

        it('args & literal args', function() {
            command.run(['qux', '--', '--one', '--two', '123']);

            assert.deepEqual(collectedValues, {
                values: {
                    foo: false
                },
                args: ['qux'],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('options & literal args', function() {
            command.run(['--foo', '--bar', '123', '--', '--one', '--two', '123']);

            assert.deepEqual(collectedValues, {
                values: {
                    foo: true,
                    bar: 123
                },
                args: [],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('args & options & literal args', function() {
            command.run(['qux', '--foo', '--bar', '123', '--', '--one', '--two', '123']);

            assert.deepEqual(collectedValues, {
                values: {
                    foo: true,
                    bar: 123
                },
                args: ['qux'],
                literalArgs: ['--one', '--two', '123']
            });
        });
    });

    describe('short options', function() {
        describe('sequence of boolean options', function() {
            var actual;
            var command = cli.command('test')
                .option('-f, --foo', 'Foo')
                .option('-b, --bar', 'Bar')
                .option('-x, --baz', 'Baz')
                .action(function() {
                    actual = this.values;
                });

            [
                { test: '-f', expected: { foo: true, bar: false, baz: false } },
                { test: '-fb', expected: { foo: true, bar: true, baz: false } },
                { test: '-fbx', expected: { foo: true, bar: true, baz: true } },
                { test: '-xfbfx', expected: { foo: true, bar: true, baz: true } }
            ].forEach(testcase =>
                it(testcase.test, () => {
                    command.run([testcase.test]);
                    assert.deepEqual(testcase.expected, actual);
                })
            );
        });

        describe('should throws when unknown short', function() {
            var command = cli.command('test')
                .option('-f, --foo', 'Foo')
                .option('-b, --bar', 'Bar');

            ['-z', '-fz', '-fbz'].forEach((test) => {
                it(test, () =>
                    assert.throws(
                        () => command.run(['-fz']),
                        /Unknown short option: -z/
                    )
                );
            });
        });

        it('should throws when non-boolean in sequence', function() {
            var command = cli.command('test')
                .option('-f, --foo', 'Foo')
                .option('-b, --bar <asd>', 'Bar');

            assert.throws(
                () => command.run(['-fb']),
                /Non-boolean option -b can't be used in short option sequence: -fb/
            );
            assert.throws(
                () => command.run(['-bf']),
                /Non-boolean option -b can't be used in short option sequence: -bf/
            );
        });
    });

    describe('action()', function() {
        it('should have an expected input', function() {
            var calls = [];
            var command = cli
                .command('test', '[foo]')
                .option('--bar', 'bar option')
                .action(function() {
                    calls.push({
                        this: this,
                        arguments: [].slice.call(arguments)
                    });
                });

            command.run(['abc', '--', 'rest', 'args']);

            assert.equal(calls.length, 1);
            assert.equal(calls[0].this, command);
            assert.deepEqual(calls[0].arguments, [['abc'], ['rest', 'args']]);
        });
    });

    describe('delegate()', function() {
        var calls;
        var command;
        var nestedCommand;

        beforeEach(function() {
            calls = [];
            command = cli
                .command('test', '[foo]')
                .delegate(function() {
                    calls.push({
                        name: 'delegate',
                        this: this,
                        arguments: [].slice.call(arguments)
                    });
                });

            nestedCommand = command
                .command('nested', '[bar]')
                .init(function() {
                    calls.push({
                        name: 'nested init',
                        this: this,
                        arguments: [].slice.call(arguments)
                    });
                });
        });

        it('should not be called until nested command is invoked', function() {
            command.run(['abc']);

            assert.equal(calls.length, 0);
        });

        it('should be called before nested command init and have an expected input', function() {
            command.run(['abc', 'nested', 'def']);

            assert.equal(calls.length, 2);
            assert.deepEqual(calls, [
                {
                    name: 'delegate',
                    this: command,
                    arguments: [nestedCommand]
                },
                {
                    name: 'nested init',
                    this: nestedCommand,
                    arguments: [['def']]
                }
            ]);
        });
    });

    describe('required argument', function() {
        var action;
        var command = cli
            .command('test', '<arg1>')
            .action(function() {
                action = '1';
            });
        command
            .command('nested', '<arg2>')
            .action(function() {
                action = '2';
            });

        beforeEach(function() {
            action = '';
        });

        it('should throw exception if no first argument', function() {
            assert.throws(function() {
                command.run([]);
            });
        });
        it('should throw exception if no second argument', function() {
            assert.throws(function() {
                command.run(['one', 'nested']);
            });
        });
        it('should treat first argument as value', function() {
            command.run(['nested']);
            assert.equal(action, '1');
        });
        it('should run nested action', function() {
            command.run(['one', 'nested', 'two']);
            assert.equal(action, '2');
        });
    });

    describe('help', () => {
        it('should show help', () => {
            var output;

            cli.command('test', false, {
                infoOptionAction: res => output = res
            }).run(['--help']);

            assert.equal(output, [
                'Usage:',
                '',
                '    \u001b[36mtest\u001b[39m [\u001b[33moptions\u001b[39m]',
                '',
                'Options:',
                '',
                '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m                 Output usage information',
                ''
            ].join('\n'));
        });

        it('should show help all cases', () => {
            var output;

            cli
                .command('test', '[qux]', {
                    infoOptionAction: res => output = res
                })
                .description('Test description')
                .option('-f, --foo', 'Foo')
                .option('--bar <baz>', 'Bar')
                .command('nested')
                .end()
                .run(['--help']);

            assert.equal(output, [
                'Test description',
                '',
                'Usage:',
                '',
                '    \u001b[36mtest\u001b[39m \u001b[35m[qux]\u001b[39m [\u001b[33moptions\u001b[39m] [\u001b[32mcommand\u001b[39m]',
                '',
                'Commands:',
                '',
                '    \u001b[32mnested\u001b[39m                     ',
                '',
                'Options:',
                '',
                '        \u001b[33m--bar\u001b[39m <baz>            Bar',
                '    \u001b[33m-f\u001b[39m, \u001b[33m--foo\u001b[39m                  Foo',
                '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m                 Output usage information',
                ''
            ].join('\n'));
        });

        it('should show help for nested command', () => {
            var output;

            cli
                .command('test', '[qux]')
                .option('-f, --foo', 'Foo')
                .command('nested', '[nested-arg]', {
                    infoOptionAction: res => output = res
                })
                .option('--bar <baz>', 'Bar')
                .end()
                .run(['nested', '--help']);

            assert.equal(output, [
                'Usage:',
                '',
                '    \u001b[36mtest nested\u001b[39m \u001b[35m[nested-arg]\u001b[39m [\u001b[33moptions\u001b[39m]',
                '',
                'Options:',
                '',
                '        \u001b[33m--bar\u001b[39m <baz>            Bar',
                '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m                 Output usage information',
                ''
            ].join('\n'));
        });

        it('should not define default help when defaultHelp in config is falsy', function() {
            var command = cli.command('test', false, {
                defaultHelp: false
            });

            assert.equal(command.hasOption('help'), false);
        });

        it('should show help message when Command#showHelp called', function() {
            var inspect = stdout.inspect();

            var command = cli
                .command('test', '[qux]')
                .option('-f, --foo', 'Foo');

            command.showHelp();
            inspect.restore();

            assert.equal(inspect.output.join(''), [
                'Usage:',
                '',
                '    \u001b[36mtest\u001b[39m \u001b[35m[qux]\u001b[39m [\u001b[33moptions\u001b[39m]',
                '',
                'Options:',
                '',
                '    \u001b[33m-f\u001b[39m, \u001b[33m--foo\u001b[39m                  Foo',
                '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m                 Output usage information',
                '',
                ''
            ].join('\n'));
        });
    });

    describe('version', () => {
        it('should show version when specified', () => {
            var output;

            cli
                .command('test', false, {
                    infoOptionAction: res => output = res
                })
                .version('1.2.3')
                .run(['--version']);

            assert.equal(output, '1.2.3');
        });
    });

    it('extend()', () => {
        const invocations = [];
        const extension = (...args) => {
            invocations.push(args);
        };

        const command = cli
            .command('test')
            .extend(extension, 1, 2);
        const nested = command
            .command('nested')
            .extend(extension)
            .extend(extension, 1, 2, 3, 4);

        command.extend(extension, 2, 3);

        assert.deepEqual(invocations, [
            [command, 1, 2],
            [nested],
            [nested, 1, 2, 3, 4],
            [command, 2, 3]
        ]);
    });
});
