import { deepEqual, notStrictEqual, strictEqual, throws, deepStrictEqual, doesNotThrow } from 'assert';
import * as clap from 'clap';

describe('one arg options', () => {
    describe('required param', () => {
        it('should not be in values by default', () => {
            const command = clap.command()
                .option('--option <arg>');

            const { options } = command.run([]);
            deepEqual(options, Object.create(null));
            notStrictEqual(command.getOption('option'), null);
        });

        it('should store default value', () => {
            const command = clap.command()
                .option('--option <arg>', 'description', 123);

            const { options } = command.run([]);
            strictEqual(options.option, 123);
        });

        it('default value should be wrapped by normalize function', () => {
            const command = clap.command()
                .option('--option <arg>', 'description', value => value * 2, 123);

            const { options } = command.run([]);
            strictEqual(options.option, 246);
        });

        it('should not be in values when normalize function preset but no default value', () => {
            const command = clap.command()
                .option('--option <arg>', 'description', () => {
                    return 123;
                });

            const { options } = command.run([]);
            deepEqual(options, Object.create(null));
        });

        it('should read only one argument', () => {
            let ok = false;
            let values;

            const command = clap.command()
                .option('--option <arg>', 'description')
                .finishContext(({ options }) => values = options)
                .command('test')
                .action(() => ok = true)
                .end();

            command.run(['--option', '1', 'test']);
            strictEqual(values.option, '1');
            strictEqual(ok, true);
        });

        it('should ignore commands', () => {
            let ok = true;
            const command = clap.command()
                .option('--option <arg>', 'description')
                .command('test')
                .action(() => ok = false)
                .end();

            const { options } = command.run(['--option', 'test']);
            strictEqual(ok, true);
            strictEqual(options.option, 'test');
        });

        it('should be exception if arg is not specified (no more arguments)', () => {
            const command = clap.command()
                .option('--option <arg>', 'description');

            throws(
                () => command.run(['--option']),
                /Option --option should be used with at least 1 argument\(s\)/
            );
        });

        it('should be exception if arg is not specified (another option next)', () => {
            const command = clap.command()
                .option('--test')
                .option('--option <arg>', 'description');

            throws(
                () => command.run(['--option', '--test']),
                /Option --option should be used with at least 1 argument\(s\)/
            );
        });

        it('#setValue should normalizenew value', () => {
            const command = clap.command()
                .option('--option <arg>', 'description', value => value * 2);

            const { options } = command.run([]);
            options.option = 123;
            strictEqual(options.option, 246);
        });
    });

    describe('optional param', () => {
        it('should not be in values by default', () => {
            const command = clap.command()
                .option('--option [arg]');

            const { options } = command.run([]);
            deepEqual(options, Object.create(null));
            notStrictEqual(command.getOption('option'), null);
        });

        it('should store default value', () => {
            const command = clap.command()
                .option('--option [arg]', 'description', 123);

            const actual = command.run([]);
            strictEqual(actual.options.option, 123);
        });

        it('default value should be wrapped by normalize function', () => {
            const command = clap.command()
                .option('--option [arg]', 'description', function(value) {
                    return value * 2;
                }, 123);

            const actual = command.run([]);
            strictEqual(actual.options.option, 246);
        });

        it('should not be in values when normalize function preset but no default value', () => {
            const command = clap.command()
                .option('--option [arg]', 'description', () => {
                    return 123;
                });

            const actual = command.run([]);
            deepStrictEqual(actual.options, Object.create(null));
        });

        it('should read only one argument', () => {
            let ok = false;
            let values;

            const command = clap.command()
                .option('--option [arg]', 'description')
                .finishContext(({ options }) => values = options)
                .command('test')
                .action(() => ok = true)
                .end();

            command.run(['--option', '1', 'test']);
            strictEqual(ok, true);
            strictEqual(values.option, '1');
        });

        it('should ignore commands', () => {
            let ok = true;

            const command = clap.command()
                .option('--option [arg]', 'description')
                .command('test')
                .action(() => ok = false)
                .end();

            const { options } = command.run(['--option', 'test']);
            strictEqual(ok, true);
            strictEqual(options.option, 'test');
        });

        it('should not be exception if arg is not specified (no more arguments)', () => {
            const command = clap.command()
                .option('--option [arg]', 'description');

            doesNotThrow(() => {
                command.run(['--option']);
            });
        });

        it('should not be exception if arg is not specified (another option next)', () => {
            const command = clap.command()
                .option('--test')
                .option('--option [arg]', 'description');

            doesNotThrow(() => {
                command.run(['--option', '--test']);
            });
        });

        it('set value to options should normalize new value', () => {
            const command = clap.command()
                .option('--option [arg]', 'description', value => value * 2);

            const { options } = command.run([]);
            options.option = 123;
            strictEqual(options.option, 246);
        });
    });
});
