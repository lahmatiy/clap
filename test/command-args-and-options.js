var assert = require('assert');
var cli = require('../lib');

describe('command run', function() {
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
