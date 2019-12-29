var assert = require('assert');
var cli = require('../lib');

describe('Command#shortcutOption()', () => {
    it('basic', () => {
        const command = cli.command('test')
            .option('--foo [foo]', 'Foo', Number)
            .option('--no-bar', 'Bar')
            .shortcutOption('--baz [x]', 'Baz', function(x) {
                return {
                    foo: x,
                    bar: Boolean(Number(x)),
                    qux: 'xxx'
                };
            }, x => x + x)
            .action(function() {
                return this.values;
            });

        assert.deepEqual(command.run([]), {
            bar: true
        });
        assert.deepEqual(command.run(['--baz', '5']), {
            bar: true,
            baz: '55',
            foo: 55
        });
        assert.deepEqual(command.run(['--baz', '0']), {
            bar: false,
            baz: '00',
            foo: 0
        });
    });
});
