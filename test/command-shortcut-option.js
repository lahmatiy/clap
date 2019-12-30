const assert = require('assert');
const cli = require('../lib');

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
            }, x => x + x);

        assert.deepEqual(command.run([]).options, {
            bar: true
        });
        assert.deepEqual(command.run(['--baz', '5']).options, {
            bar: true,
            baz: '55',
            foo: 55
        });
        assert.deepEqual(command.run(['--baz', '0']).options, {
            bar: false,
            baz: '00',
            foo: 0
        });
    });
});
