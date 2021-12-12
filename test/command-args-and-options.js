const assert = require('assert');
const cli = require('../lib');

describe('command run', function() {
    describe('args and options', () => {
        let command;

        beforeEach(function() {
            command = cli.command('test [foo]')
                .option('--foo', 'Foo')
                .option('--bar <number>', 'Bar', Number);
        });

        it('no arguments', function() {
            const actual = command.run([]);

            assert.deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: false
                },
                args: [],
                literalArgs: null
            });
        });

        it('args', function() {
            const actual = command.run(['qux']);

            assert.deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: false
                },
                args: ['qux'],
                literalArgs: null
            });
        });

        it('options', function() {
            const actual = command.run(['--foo', '--bar', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: true,
                    bar: 123
                },
                args: [],
                literalArgs: null
            });
        });

        it('literal args', function() {
            const actual = command.run(['--', '--one', '--two', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: false
                },
                args: [],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('args & options', function() {
            const actual = command.run(['qux', '--foo', '--bar', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: true,
                    bar: 123
                },
                args: ['qux'],
                literalArgs: null
            });
        });

        it('args & options before', function() {
            const actual = command.run(['--foo', '--bar', '123', 'qux']);

            assert.deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: true,
                    bar: 123
                },
                args: ['qux'],
                literalArgs: null
            });
        });

        it('args & literal args', function() {
            const actual = command.run(['qux', '--', '--one', '--two', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: false
                },
                args: ['qux'],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('options & literal args', function() {
            const actual = command.run(['--foo', '--bar', '123', '--', '--one', '--two', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: true,
                    bar: 123
                },
                args: [],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('args & options & literal args', function() {
            const actual = command.run(['qux', '--foo', '--bar', '123', '--', '--one', '--two', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: true,
                    bar: 123
                },
                args: ['qux'],
                literalArgs: ['--one', '--two', '123']
            });
        });
    });

    describe('multi arg option', () => {
        it('x', () => {
            const command = cli.command()
                .option('--option <arg1> [arg2]', 'description', function(value, oldValue) {
                    return (oldValue || []).concat(value);
                });

            assert.deepStrictEqual(
                command.run(['--option','foo', 'bar', '--option', 'baz']).options,
                {
                    __proto__: null,
                    option: ['foo', 'bar', 'baz']
                }
            );
        });
    });

    describe('required argument', () => {
        let action;
        const command = cli
            .command('test <arg1>')
            .action(() => action = '1')
            .command('nested <arg2>')
            .action(() => action = '2')
            .end();

        beforeEach(function() {
            action = '';
        });

        it('should throw exception if no first argument', function() {
            assert.throws(
                () => command.run([]),
                /Missed required argument\(s\) for command "test"/
            );
        });
        it('should throw exception if no second argument', function() {
            assert.throws(
                () => command.run(['one', 'nested']),
                /Missed required argument\(s\) for command "nested"/
            );
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
});
