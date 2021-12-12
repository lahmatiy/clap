import { deepEqual } from 'assert';
import * as clap from 'clap';

describe('suggest', () => {
    function getSuggestions(startWith) {
        return all.filter(name => name.startsWith(startWith)).sort();
    }

    const all = [
        '--help',
        '--foo',
        '--bar',
        '--required-arg',
        '--optional-arg',
        'foo',
        'bar'
    ];

    /* eslint-disable indent */
    const command = clap.command('test [arg1]')
        .option('-f, --foo', 'foo')
        .option('-b, --bar', 'bar')
        .option('--required-arg <arg>', 'option with required argument')
        .option('--optional-arg <arg>', 'option with optional argument')
        .command('foo')
            .option('--foo', 'nested option 1')
            .option('--bar', 'nested option 2')
            .option('--baz', 'nested option 3')
            .end()
        .command('bar [arg2]')
            .command('baz').end()
            .command('qux').end()
            .option('--test', 'test option')
            .end();
    /* eslint-enable indent */

    it('should suggest commands and options when no input', () => {
        deepEqual(command.parse([], true), getSuggestions(''));
    });

    it('should suggest options names when one dash', () => {
        deepEqual(command.parse(['-'], true), getSuggestions('-'));
    });

    it('should suggest options names when double dash', () => {
        deepEqual(command.parse(['--'], true), getSuggestions('--'));
    });

    it('should suggest matched options', () => {
        deepEqual(command.parse(['--b'], true), getSuggestions('--b'));
    });

    it('should suggest matched commands', () => {
        deepEqual(command.parse(['b'], true), getSuggestions('bar'));
    });

    it('should suggest nothing when no matches', () => {
        deepEqual(command.parse(['--miss'], true), []);
    });

    it('should suggest matched commands and options of subcommands when no input', () => {
        deepEqual(command.parse(['bar', ''], true), ['--help', '--test', 'baz', 'qux']);
    });

    it('should suggest matched commands of subcommands', () => {
        deepEqual(command.parse(['bar', 'b'], true), ['baz']);
    });

    it('should suggest options of subcommands', () => {
        deepEqual(command.parse(['foo', '-'], true), ['--bar', '--baz', '--foo', '--help']);
        deepEqual(command.parse(['foo', '--'], true), ['--bar', '--baz', '--foo', '--help']);
    });

    it('should suggest matched options of subcommands', () => {
        deepEqual(command.parse(['foo', '--b'], true), ['--bar', '--baz']);
    });

    it('should suggest nothing for option arguments', () => {
        deepEqual(command.parse(['--required-arg', ''], true), []);
        deepEqual(command.parse(['--required-arg', 'a'], true), []);
        deepEqual(command.parse(['--optional-arg', ''], true), []);
        deepEqual(command.parse(['--optional-arg', 'a'], true), []);
    });

    it('should suggest nothing after double dash', () => {
        deepEqual(command.parse(['--', ''], true), []);
        deepEqual(command.parse(['--', 'a'], true), []);
        deepEqual(command.parse(['--', '-'], true), []);
        deepEqual(command.parse(['--', '--'], true), []);
    });
});
