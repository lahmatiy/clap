const assert = require('assert');
const cli = require('../lib');
const optionValues = values => Object.assign(Object.create(null), values);

describe('command run', function() {
    describe('args and options', function() {
        var command;

        beforeEach(function() {
            command = cli.command('test', '[foo]')
                .option('--foo', 'Foo')
                .option('--bar <number>', 'Bar', Number);
        });

        it('no arguments', function() {
            const actual = command.run([]);

            assert.deepStrictEqual(actual, {
                commandPath: [],
                options: optionValues({
                    foo: false
                }),
                args: [],
                literalArgs: null
            });
        });

        it('args', function() {
            const actual = command.run(['qux']);

            assert.deepStrictEqual(actual, {
                commandPath: [],
                options: optionValues({
                    foo: false
                }),
                args: ['qux'],
                literalArgs: null
            });
        });

        it('options', function() {
            const actual = command.run(['--foo', '--bar', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: [],
                options: optionValues({
                    foo: true,
                    bar: 123
                }),
                args: [],
                literalArgs: null
            });
        });

        it('literal args', function() {
            const actual = command.run(['--', '--one', '--two', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: [],
                options: optionValues({
                    foo: false
                }),
                args: [],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('args & options', function() {
            const actual = command.run(['qux', '--foo', '--bar', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: [],
                options: optionValues({
                    foo: true,
                    bar: 123
                }),
                args: ['qux'],
                literalArgs: null
            });
        });

        it('args & literal args', function() {
            const actual = command.run(['qux', '--', '--one', '--two', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: [],
                options: optionValues({
                    foo: false
                }),
                args: ['qux'],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('options & literal args', function() {
            const actual = command.run(['--foo', '--bar', '123', '--', '--one', '--two', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: [],
                options: optionValues({
                    foo: true,
                    bar: 123
                }),
                args: [],
                literalArgs: ['--one', '--two', '123']
            });
        });

        it('args & options & literal args', function() {
            const actual = command.run(['qux', '--foo', '--bar', '123', '--', '--one', '--two', '123']);

            assert.deepStrictEqual(actual, {
                commandPath: [],
                options: optionValues({
                    foo: true,
                    bar: 123
                }),
                args: ['qux'],
                literalArgs: ['--one', '--two', '123']
            });
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
});
