var assert = require('assert');
var cli = require('../lib');

describe('one arg options', function() {
    var command;

    beforeEach(function() {
        command = cli.command();
    });

    describe('required param', function() {
        it('should not be in values by default', function() {
            command
                .option('--option <arg>');

            assert.deepEqual(command.values, {});
            assert(command.hasOption('option'));
        });

        it('should store default value', function() {
            command
                .option('--option <arg>', 'description', 123);

            assert.strictEqual(command.values.option, 123);
        });

        it('default value should be wrapped by normalize function', function() {
            command
                .option('--option <arg>', 'description', function(value) {
                    return value * 2;
                }, 123);

            assert.strictEqual(command.values.option, 246);
        });

        it('should not be in values when normalize function preset but no default value', function() {
            command
                .option('--option <arg>', 'description', function() {
                    return 123;
                });

            assert.deepEqual(command.values, {});
        });

        it('should read only one argument', function() {
            let ok = false;
            let values;

            command
                .option('--option <arg>', 'description')
                .prepare(function({ options }) {
                    values = options;
                })
                .command('test')
                .action(function() {
                    ok = true;
                });

            command.run(['--option', '1', 'test']);
            assert.strictEqual(values.option, '1');
            assert.strictEqual(ok, true);
        });

        it('should ignore commands', function() {
            let ok = true;

            command
                .option('--option <arg>', 'description')
                .command('test')
                .action(function() {
                    ok = false;
                });

            const { options } = command.run(['--option', 'test']);
            assert.strictEqual(ok, true);
            assert.strictEqual(options.option, 'test');
        });

        it('should be exception if arg is not specified (no more arguments)', function() {
            command
                .option('--option <arg>', 'description');

            assert.throws(function() {
                command.run(['--option']);
            });
        });

        it('should be exception if arg is not specified (another option next)', function() {
            command
                .option('--test')
                .option('--option <arg>', 'description');

            assert.throws(function() {
                command.run(['--option', '--test']);
            });
        });

        it('#setValue should normalizenew value', function() {
            command
                .option('--option <arg>', 'description', function(value) {
                    return value * 2;
                });

            command.setValue('option', 123);
            assert.strictEqual(command.values.option, 246);
        });
    });

    describe('optional param', function() {
        it('should not be in values by default', function() {
            command
                .option('--option [arg]');

            assert.deepEqual(command.values, {});
            assert(command.hasOption('option'));
        });

        it('should store default value', function() {
            command
                .option('--option [arg]', 'description', 123);

            assert.strictEqual(command.values.option, 123);
        });

        it('default value should be wrapped by normalize function', function() {
            command
                .option('--option [arg]', 'description', function(value) {
                    return value * 2;
                }, 123);

            assert.strictEqual(command.values.option, 246);
        });

        it('should not be in values when normalize function preset but no default value', function() {
            command
                .option('--option [arg]', 'description', function() {
                    return 123;
                });

            assert.deepEqual(command.values, {});
        });

        it('should read only one argument', function() {
            let ok = false;
            let values;

            command
                .option('--option [arg]', 'description')
                .prepare(function({ options }) {
                    values = options;
                })
                .command('test')
                .action(function() {
                    ok = true;
                });

            command.run(['--option', '1', 'test']);
            assert.strictEqual(ok, true);
            assert.strictEqual(values.option, '1');
        });

        it('should ignore commands', function() {
            let ok = true;

            command
                .option('--option [arg]', 'description')
                .command('test')
                .action(function() {
                    ok = false;
                });

            const { options } = command.run(['--option', 'test']);
            assert.strictEqual(ok, true);
            assert.strictEqual(options.option, 'test');
        });

        it('should not be exception if arg is not specified (no more arguments)', function() {
            command
                .option('--option [arg]', 'description');

            assert.doesNotThrow(function() {
                command.run(['--option']);
            });
        });

        it('should not be exception if arg is not specified (another option next)', function() {
            command
                .option('--test')
                .option('--option [arg]', 'description');

            assert.doesNotThrow(function() {
                command.run(['--option', '--test']);
            });
        });

        it('#setValue should normalize new value', function() {
            command
                .option('--option [arg]', 'description', function(value) {
                    return value * 2;
                });

            command.setValue('option', 123);
            assert.strictEqual(command.values.option, 246);
        });
    });
});
