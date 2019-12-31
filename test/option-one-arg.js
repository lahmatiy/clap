const assert = require('assert');
const cli = require('../lib');

describe('one arg options', function() {
    describe('required param', function() {
        it('should not be in values by default', function() {
            const command = cli.command()
                .option('--option <arg>');

            const { options } = command.run([]);
            assert.deepEqual(options, Object.create(null));
            assert(command.hasOption('option'));
        });

        it('should store default value', function() {
            const command = cli.command()
                .option('--option <arg>', 'description', 123);

            const { options } = command.run([]);
            assert.strictEqual(options.option, 123);
        });

        it('default value should be wrapped by normalize function', function() {
            const command = cli.command()
                .option('--option <arg>', 'description', value => value * 2, 123);

            const { options } = command.run([]);
            assert.strictEqual(options.option, 246);
        });

        it('should not be in values when normalize function preset but no default value', function() {
            const command = cli.command()
                .option('--option <arg>', 'description', function() {
                    return 123;
                });

            const { options } = command.run([]);
            assert.deepEqual(options, Object.create(null));
        });

        it('should read only one argument', function() {
            let ok = false;
            let values;

            const command = cli.command()
                .option('--option <arg>', 'description')
                .finishContext(({ options }) => values = options)
                .command('test')
                .action(() => ok = true)
                .end();

            command.run(['--option', '1', 'test']);
            assert.strictEqual(values.option, '1');
            assert.strictEqual(ok, true);
        });

        it('should ignore commands', function() {
            let ok = true;
            const command = cli.command()
                .option('--option <arg>', 'description')
                .command('test')
                .action(() => ok = false)
                .end();

            const { options } = command.run(['--option', 'test']);
            assert.strictEqual(ok, true);
            assert.strictEqual(options.option, 'test');
        });

        it('should be exception if arg is not specified (no more arguments)', function() {
            const command = cli.command()
                .option('--option <arg>', 'description');

            assert.throws(
                () => command.run(['--option']),
                /Option --option should be used with at least 1 argument\(s\)/
            );
        });

        it('should be exception if arg is not specified (another option next)', function() {
            const command = cli.command()
                .option('--test')
                .option('--option <arg>', 'description');

            assert.throws(
                () => command.run(['--option', '--test']),
                /Option --option should be used with at least 1 argument\(s\)/
            );
        });

        it('#setValue should normalizenew value', function() {
            const command = cli.command()
                .option('--option <arg>', 'description', value => value * 2);

            const { options } = command.run([]);
            options.option = 123;
            assert.strictEqual(options.option, 246);
        });
    });

    describe('optional param', function() {
        it('should not be in values by default', function() {
            const command = cli.command()
                .option('--option [arg]');

            const { options } = command.run([]);
            assert.deepEqual(options, Object.create(null));
            assert(command.hasOption('option'));
        });

        it('should store default value', function() {
            const command = cli.command()
                .option('--option [arg]', 'description', 123);

            const actual = command.run([]);
            assert.strictEqual(actual.options.option, 123);
        });

        it('default value should be wrapped by normalize function', function() {
            const command = cli.command()
                .option('--option [arg]', 'description', function(value) {
                    return value * 2;
                }, 123);

            const actual = command.run([]);
            assert.strictEqual(actual.options.option, 246);
        });

        it('should not be in values when normalize function preset but no default value', function() {
            const command = cli.command()
                .option('--option [arg]', 'description', function() {
                    return 123;
                });

            const actual = command.run([]);
            assert.deepStrictEqual(actual.options, Object.create(null));
        });

        it('should read only one argument', function() {
            let ok = false;
            let values;

            const command = cli.command()
                .option('--option [arg]', 'description')
                .finishContext(({ options }) => values = options)
                .command('test')
                .action(() => ok = true)
                .end();

            command.run(['--option', '1', 'test']);
            assert.strictEqual(ok, true);
            assert.strictEqual(values.option, '1');
        });

        it('should ignore commands', function() {
            let ok = true;

            const command = cli.command()
                .option('--option [arg]', 'description')
                .command('test')
                .action(() => ok = false)
                .end();

            const { options } = command.run(['--option', 'test']);
            assert.strictEqual(ok, true);
            assert.strictEqual(options.option, 'test');
        });

        it('should not be exception if arg is not specified (no more arguments)', function() {
            const command = cli.command()
                .option('--option [arg]', 'description');

            assert.doesNotThrow(function() {
                command.run(['--option']);
            });
        });

        it('should not be exception if arg is not specified (another option next)', function() {
            const command = cli.command()
                .option('--test')
                .option('--option [arg]', 'description');

            assert.doesNotThrow(function() {
                command.run(['--option', '--test']);
            });
        });

        it('set value to options should normalize new value', function() {
            const command = cli.command()
                .option('--option [arg]', 'description', value => value * 2);

            const { options } = command.run([]);
            options.option = 123;
            assert.strictEqual(options.option, 246);
        });
    });
});
