import { strictEqual, equal } from 'assert';
import { stdout } from 'test-console';
import * as clap from 'clap';

describe('Command help', () => {
    let inspect;
    beforeEach(() => inspect = stdout.inspect());
    afterEach(() => inspect.restore());

    it('should remove default help when .help(false)', () => {
        const command = clap.command('test').help(false);

        strictEqual(command.getOption('help'), null);
    });

    it('should show help', () => {
        clap.command('test', false).run(['--help']);

        equal(inspect.output, [
            'Usage:',
            '',
            '    \u001b[36mtest\u001b[39m [\u001b[33moptions\u001b[39m]',
            '',
            'Options:',
            '',
            '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m              Output usage information',
            '',
            ''
        ].join('\n'));
    });

    it('help with no short options', () => {
        clap.command('test', false, { defaultHelp: false })
            .help('--help')
            .option('--foo', 'Foo')
            .run(['--help']);

        equal(inspect.output, [
            'Usage:',
            '',
            '    \u001b[36mtest\u001b[39m [\u001b[33moptions\u001b[39m]',
            '',
            'Options:',
            '',
            '    \u001b[33m--foo\u001b[39m                   Foo',
            '    \u001b[33m--help\u001b[39m                  Output usage information',
            '',
            ''
        ].join('\n'));
    });

    it('should show help all cases', () => {
        clap.command('test [qux]')
            .description('Test description')
            .option('-f, --foo', 'Foo')
            .option('--bar <baz>', 'Bar', 8080)
            .command('nested')
            .end()
            .command('nested2')
            .description('with description')
            .end()
            .run(['--help']);

        equal(inspect.output, [
            'Test description',
            '',
            'Usage:',
            '',
            '    \u001b[36mtest\u001b[39m \u001b[35m[qux]\u001b[39m [\u001b[33moptions\u001b[39m] [\u001b[32mcommand\u001b[39m]',
            '',
            'Commands:',
            '',
            '    \u001b[32mnested\u001b[39m                  ',
            '    \u001b[32mnested2\u001b[39m                 with description',
            '',
            'Options:',
            '',
            '        \u001b[33m--bar\u001b[39m <baz>         Bar',
            '    \u001b[33m-f\u001b[39m, \u001b[33m--foo\u001b[39m               Foo',
            '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m              Output usage information',
            '',
            ''
        ].join('\n'));
    });

    it('should show help for nested command', () => {
        clap.command('test [qux]')
            .option('-f, --foo', 'Foo')
            .command('nested [nested-arg]')
            .option('--bar <baz>', 'Bar')
            .end()
            .run(['nested', '--help']);

        equal(inspect.output, [
            'Usage:',
            '',
            '    \u001b[36mtest nested\u001b[39m \u001b[35m[nested-arg]\u001b[39m [\u001b[33moptions\u001b[39m]',
            '',
            'Options:',
            '',
            '        \u001b[33m--bar\u001b[39m <baz>         Bar',
            '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m              Output usage information',
            '',
            ''
        ].join('\n'));
    });

    it('should show help message when Command#outputHelp called', () => {
        const command = clap.command('test [qux]')
            .option('-f, --foo', 'Foo');

        command.outputHelp();

        equal(inspect.output, [
            'Usage:',
            '',
            '    \u001b[36mtest\u001b[39m \u001b[35m[qux]\u001b[39m [\u001b[33moptions\u001b[39m]',
            '',
            'Options:',
            '',
            '    \u001b[33m-f\u001b[39m, \u001b[33m--foo\u001b[39m               Foo',
            '    \u001b[33m-h\u001b[39m, \u001b[33m--help\u001b[39m              Output usage information',
            '',
            ''
        ].join('\n'));
    });
});
