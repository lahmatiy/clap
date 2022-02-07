import { deepStrictEqual, throws, equal } from 'assert';
import * as clap from 'clap';

describe('command run', () => {
    describe('args and options', () => {
        let command;

        beforeEach(() => {
            command = clap.command('test [foo]')
                .option('--foo', 'Foo')
                .option('--bar <number>', 'Bar', Number);
        });

        it('no arguments', () => {
            const actual = command.run([]);

            deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: false
                },
                args: [],
                literalArgs: null
            });
        });

        it('args', () => {
            const actual = command.run(['qux']);

            deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: false
                },
                args: ['qux'],
                literalArgs: null
            });
        });

        it('args: - as a value', () => {
            const actual = command.run(['-']);

            deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: false
                },
                args: ['-'],
                literalArgs: null
            });
        });

        it('args: - as a value after an option', () => {
            const actual = command.run(['--foo', '-']);

            deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: true
                },
                args: ['-'],
                literalArgs: null
            });
        });

        it('options', () => {
            const actual = command.run(['--foo', '--bar', '123']);

            deepStrictEqual(actual, {
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

        it('literal args', () => {
            const actual = command.run(['--', '--one', '--two', '123']);

            deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: false
                },
                args: [],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('args & options', () => {
            const actual = command.run(['qux', '--foo', '--bar', '123']);

            deepStrictEqual(actual, {
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

        it('args & options before', () => {
            const actual = command.run(['--foo', '--bar', '123', 'qux']);

            deepStrictEqual(actual, {
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

        it('args & literal args', () => {
            const actual = command.run(['qux', '--', '--one', '--two', '123']);

            deepStrictEqual(actual, {
                commandPath: ['test'],
                options: {
                    __proto__: null,
                    foo: false
                },
                args: ['qux'],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('options & literal args', () => {
            const actual = command.run(['--foo', '--bar', '123', '--', '--one', '--two', '123']);

            deepStrictEqual(actual, {
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

        it('args & options & literal args', () => {
            const actual = command.run(['qux', '--foo', '--bar', '123', '--', '--one', '--two', '123']);

            deepStrictEqual(actual, {
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
            const command = clap.command()
                .option('--option <arg1> [arg2]', 'description', function(value, oldValue) {
                    return (oldValue || []).concat(value);
                });

            deepStrictEqual(
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
        const command = clap
            .command('test <arg1>')
            .action(() => action = '1')
            .command('nested <arg2>')
            .action(() => action = '2')
            .end();

        beforeEach(() => {
            action = '';
        });

        it('should throw exception if no first argument', () => {
            throws(
                () => command.run([]),
                /Missed required argument\(s\) for command "test"/
            );
        });
        it('should throw exception if no second argument', () => {
            throws(
                () => command.run(['one', 'nested']),
                /Missed required argument\(s\) for command "nested"/
            );
        });
        it('should treat first argument as value', () => {
            command.run(['nested']);
            equal(action, '1');
        });
        it('should run nested action', () => {
            command.run(['one', 'nested', 'two']);
            equal(action, '2');
        });
    });
});
