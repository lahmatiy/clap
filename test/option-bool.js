const assert = require('assert');
const cli = require('../lib');

describe('boolean options', function() {
    describe('positive', function() {
        it('should be false by default', function() {
            const command = cli.command()
                .option('--bool');

            const { options } = command.run([]);
            assert.strictEqual(options.bool, false);
        });

        it('should throw an exception if oposite option defined already', function() {
            assert.throws(
                () => cli.command()
                    .option('--no-bool')
                    .option('--bool'),
                /Option name "bool" already in use by --no-bool/
            );
        });

        it('should be true if option present', function() {
            const command = cli.command()
                .option('--bool');

            const { options } = command.run(['--bool']);
            assert.strictEqual(options.bool, true);
        });

        it('should throw an exception for inverted option', function() {
            const command = cli.command()
                .option('--bool');

            assert.throws(
                () => command.run(['--no-bool']),
                /Unknown option: --no-bool/
            );
        });

        it('process function result should be ignored', function() {
            const command = cli.command()
                .option('--bool', 'description', () => false);

            const { options } = command.run(['--bool']);
            assert.strictEqual(options.bool, true);
        });
    });


    describe('negative', function() {
        it('should be true by default', function() {
            const command = cli.command()
                .option('--no-bool');

            const { options } = command.run([]);
            assert.strictEqual(options.bool, true);
        });

        it('should throw an exception if oposite option defined already', function() {
            assert.throws(
                () => cli.command()
                    .option('--bool')
                    .option('--no-bool'),
                /Option name "bool" already in use by --bool/
            );
        });

        it('should be false if option present', function() {
            const command = cli.command()
                .option('--no-bool');

            const { options } = command.run(['--no-bool']);
            assert.strictEqual(options.bool, false);
        });

        it('should throw an exception for non-inverted option', function() {
            const command = cli.command()
                .option('--no-bool');

            assert.throws(
                () => command.run(['--bool']),
                /Unknown option: --bool/
            );
        });

        it('process function result should be ignored', function() {
            const command = cli.command()
                .option('--no-bool', 'description', () => true);

            const { options } = command.run(['--no-bool']);
            assert.strictEqual(options.bool, false);
        });
    });
});
