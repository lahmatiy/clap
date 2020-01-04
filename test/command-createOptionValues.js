const assert = require('assert');
const cli = require('../lib');

describe('createOptionValues()', function() {
    it('boolean option', function() {
        const command = cli.command()
            .option('--option', 'description', Boolean);

        assert.deepStrictEqual(
            command.createOptionValues({ option: 'bad value' }),
            {
                __proto__: null,
                option: true
            }
        );
    });

    it('number option', function() {
        const command = cli.command()
            .option('--option <arg>', 'description', function(value) {
                return isNaN(value) ? 0 : value;
            }, 1);

        assert.deepStrictEqual(
            command.createOptionValues({ option: 'bad value' }),
            {
                __proto__: null,
                option: 0
            }
        );
    });

    it('multi arg option', function() {
        const command = cli.command()
            .option('--option <arg1> [arg2]', 'description', function(value, oldValue) {
                return (oldValue || []).concat(value);
            });

        assert.deepStrictEqual(
            command.createOptionValues({ option: ['foo', 'bar'] }),
            {
                __proto__: null,
                option: ['foo', 'bar']
            }
        );
    });

    it('option with no default value and argument should be set', function() {
        const command = cli.command()
            .option('--option <value>');

        assert.deepStrictEqual(
            command.createOptionValues({ option: 'ok' }),
            {
                __proto__: null,
                option: 'ok'
            }
        );
    });

    it('should ignore unknown keys', function() {
        const command = cli.command()
            .option('--option <value>');

        assert.deepStrictEqual(
            command.createOptionValues({ foo: 'ok' }),
            Object.create(null)
        );
    });

    it('general test', function() {
        const command = cli.command()
            .option('--foo <value>', '', Number)
            .option('--bar [value]')
            .option('--with-default [x]', '', { default: 'default' })
            .option('--bool');

        assert.deepStrictEqual(
            command.createOptionValues({
                foo: '123',
                option: 'ok'
            }),
            {
                __proto__: null,
                foo: 123,
                withDefault: 'default',
                bool: false
            }
        );
    });
});
