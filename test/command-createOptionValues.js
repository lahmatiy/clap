import { deepStrictEqual } from 'assert';
import * as clap from 'clap';

describe('createOptionValues()', () => {
    it('boolean option', () => {
        const command = clap.command()
            .option('--option', 'description', Boolean);

        deepStrictEqual(
            command.createOptionValues({ option: 'bad value' }),
            {
                __proto__: null,
                option: true
            }
        );
    });

    it('number option', () => {
        const command = clap.command()
            .option('--option <arg>', 'description', function(value) {
                return isNaN(value) ? 0 : value;
            }, 1);

        deepStrictEqual(
            command.createOptionValues({ option: 'bad value' }),
            {
                __proto__: null,
                option: 0
            }
        );
    });

    it('multi arg option', () => {
        const command = clap.command()
            .option('--option <arg1> [arg2]', 'description', function(value, oldValue) {
                return (oldValue || []).concat(value);
            });

        deepStrictEqual(
            command.createOptionValues({ option: ['foo', 'bar'] }),
            {
                __proto__: null,
                option: ['foo', 'bar']
            }
        );
    });

    it('option with no default value and argument should be set', () => {
        const command = clap.command()
            .option('--option <value>');

        deepStrictEqual(
            command.createOptionValues({ option: 'ok' }),
            {
                __proto__: null,
                option: 'ok'
            }
        );
    });

    it('should ignore unknown keys', () => {
        const command = clap.command()
            .option('--option <value>');

        deepStrictEqual(
            command.createOptionValues({ foo: 'ok' }),
            Object.create(null)
        );
    });

    it('general test', () => {
        const command = clap.command()
            .option('--foo <value>', '', Number)
            .option('--bar [value]')
            .option('--with-default [x]', '', { default: 'default' })
            .option('--bool');

        deepStrictEqual(
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
