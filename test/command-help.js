const assert = require('assert');
const stdout = require('test-console').stdout;
const cli = require('../lib');

describe('Command help', () => {
    let inspect;
    beforeEach(() => inspect = stdout.inspect());
    afterEach(() => inspect.restore());

    it('should show help', () => {
        cli.command('test', false).run(['--help']);

        assert.equal(inspect.output, [
            'Usage:',
            '',
            '    \u001b[36mtest\u001b[39m [\u001b[33moptions\u001b[39m]',
            '',
            'Options:',
            '',
            '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m                 Output usage information',
            '',
            ''
        ].join('\n'));
    });

    it('should show help all cases', () => {
        cli
            .command('test', '[qux]')
            .description('Test description')
            .option('-f, --foo', 'Foo')
            .option('--bar <baz>', 'Bar')
            .command('nested')
            .end()
            .run(['--help']);

        assert.equal(inspect.output, [
            'Test description',
            '',
            'Usage:',
            '',
            '    \u001b[36mtest\u001b[39m \u001b[35m[qux]\u001b[39m [\u001b[33moptions\u001b[39m] [\u001b[32mcommand\u001b[39m]',
            '',
            'Commands:',
            '',
            '    \u001b[32mnested\u001b[39m                     ',
            '',
            'Options:',
            '',
            '        \u001b[33m--bar\u001b[39m <baz>            Bar',
            '    \u001b[33m-f\u001b[39m, \u001b[33m--foo\u001b[39m                  Foo',
            '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m                 Output usage information',
            '',
            ''
        ].join('\n'));
    });

    it('should show help for nested command', () => {
        cli
            .command('test', '[qux]')
            .option('-f, --foo', 'Foo')
            .command('nested', '[nested-arg]')
            .option('--bar <baz>', 'Bar')
            .end()
            .run(['nested', '--help']);

        assert.equal(inspect.output, [
            'Usage:',
            '',
            '    \u001b[36mtest nested\u001b[39m \u001b[35m[nested-arg]\u001b[39m [\u001b[33moptions\u001b[39m]',
            '',
            'Options:',
            '',
            '        \u001b[33m--bar\u001b[39m <baz>            Bar',
            '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m                 Output usage information',
            '',
            ''
        ].join('\n'));
    });

    it('should not define default help when defaultHelp in config is falsy', function() {
        const command = cli.command('test', false, {
            defaultHelp: false
        });

        assert.equal(command.hasOption('help'), false);
    });

    it('should show help message when Command#outputHelp called', function() {
        const command = cli
            .command('test', '[qux]')
            .option('-f, --foo', 'Foo');

        command.outputHelp();

        assert.equal(inspect.output, [
            'Usage:',
            '',
            '    \u001b[36mtest\u001b[39m \u001b[35m[qux]\u001b[39m [\u001b[33moptions\u001b[39m]',
            '',
            'Options:',
            '',
            '    \u001b[33m-f\u001b[39m, \u001b[33m--foo\u001b[39m                  Foo',
            '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m                 Output usage information',
            '',
            ''
        ].join('\n'));
    });
});
