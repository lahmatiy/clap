import { strictEqual, throws } from 'assert';
import * as clap from 'clap';

describe('boolean options', () => {
    describe('positive', () => {
        it('should be false by default', () => {
            const command = clap.command()
                .option('--bool');

            const { options } = command.run([]);
            strictEqual(options.bool, false);
        });

        it('should throw an exception if oposite option defined already', () => {
            throws(
                () => clap.command()
                    .option('--no-bool')
                    .option('--bool'),
                /Option name "bool" already in use by --no-bool/
            );
        });

        it('should be true if option present', () => {
            const command = clap.command()
                .option('--bool');

            const { options } = command.run(['--bool']);
            strictEqual(options.bool, true);
        });

        it('should throw an exception for inverted option', () => {
            const command = clap.command()
                .option('--bool');

            throws(
                () => command.run(['--no-bool']),
                /Unknown option: --no-bool/
            );
        });

        it('normalize function result should be ignored', () => {
            const command = clap.command()
                .option('--bool', 'description', () => false);

            const { options } = command.run(['--bool']);
            strictEqual(options.bool, true);
        });
    });


    describe('negative', () => {
        it('should be true by default', () => {
            const command = clap.command()
                .option('--no-bool');

            const { options } = command.run([]);
            strictEqual(options.bool, true);
        });

        it('should throw an exception if oposite option defined already', () => {
            throws(
                () => clap.command()
                    .option('--bool')
                    .option('--no-bool'),
                /Option name "bool" already in use by --bool/
            );
        });

        it('should be false if option present', () => {
            const command = clap.command()
                .option('--no-bool');

            const { options } = command.run(['--no-bool']);
            strictEqual(options.bool, false);
        });

        it('should throw an exception for non-inverted option', () => {
            const command = clap.command()
                .option('--no-bool');

            throws(
                () => command.run(['--bool']),
                /Unknown option: --bool/
            );
        });

        it('normalize function result should be ignored', () => {
            const command = clap.command()
                .option('--no-bool', 'description', () => true);

            const { options } = command.run(['--no-bool']);
            strictEqual(options.bool, false);
        });
    });
});
