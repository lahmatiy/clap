var assert = require('assert');
var stdout = require('test-console').stdout;
var cli = require('../lib');

describe('Command help', () => {
    it('should show help', () => {
        var output;

        cli.command('test', false, {
            infoOptionAction: res => output = res
        }).run(['--help']);

        assert.equal(output, [
            'Usage:',
            '',
            '    \u001b[36mtest\u001b[39m [\u001b[33moptions\u001b[39m]',
            '',
            'Options:',
            '',
            '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m                 Output usage information',
            ''
        ].join('\n'));
    });

    it('should show help all cases', () => {
        var output;

        cli
            .command('test', '[qux]', {
                infoOptionAction: res => output = res
            })
            .description('Test description')
            .option('-f, --foo', 'Foo')
            .option('--bar <baz>', 'Bar')
            .command('nested')
            .end()
            .run(['--help']);

        assert.equal(output, [
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
            ''
        ].join('\n'));
    });

    it('should show help for nested command', () => {
        var output;

        cli
            .command('test', '[qux]')
            .option('-f, --foo', 'Foo')
            .command('nested', '[nested-arg]', {
                infoOptionAction: res => output = res
            })
            .option('--bar <baz>', 'Bar')
            .end()
            .run(['nested', '--help']);

        assert.equal(output, [
            'Usage:',
            '',
            '    \u001b[36mtest nested\u001b[39m \u001b[35m[nested-arg]\u001b[39m [\u001b[33moptions\u001b[39m]',
            '',
            'Options:',
            '',
            '        \u001b[33m--bar\u001b[39m <baz>            Bar',
            '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m                 Output usage information',
            ''
        ].join('\n'));
    });

    it('should not define default help when defaultHelp in config is falsy', function() {
        var command = cli.command('test', false, {
            defaultHelp: false
        });

        assert.equal(command.hasOption('help'), false);
    });

    it('should show help message when Command#showHelp called', function() {
        var inspect = stdout.inspect();

        var command = cli
            .command('test', '[qux]')
            .option('-f, --foo', 'Foo');

        command.showHelp();
        inspect.restore();

        assert.equal(inspect.output.join(''), [
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
