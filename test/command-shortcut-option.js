import { deepEqual } from 'assert';
import * as clap from 'clap';

describe('Command#shortcutOption()', () => {
    it('basic', () => {
        const command = clap.command('test')
            .option('--foo [foo]', 'Foo', Number)
            .option('--no-bar', 'Bar')
            .option('--baz [x]', 'Baz', {
                normalize: x => x + x,
                shortcut: function(x) {
                    return {
                        foo: x,
                        bar: Boolean(Number(x)),
                        qux: 'xxx'
                    };
                }
            });

        deepEqual(command.run([]).options, {
            bar: true
        });
        deepEqual(command.run(['--baz', '5']).options, {
            bar: true,
            baz: '55',
            foo: 55
        });
        deepEqual(command.run(['--baz', '0']).options, {
            bar: false,
            baz: '00',
            foo: 0
        });
    });
});
