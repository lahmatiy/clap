const assert = require('assert');
const cli = require('../lib');

describe('suggest', function() {
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
    const command = cli
        .command('test [arg1]')
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

    it('should suggest commands and options when no input', function() {
        assert.deepEqual(command.parse([], true), getSuggestions(''));
    });

    it('should suggest options names when one dash', function() {
        assert.deepEqual(command.parse(['-'], true), getSuggestions('-'));
    });

    it('should suggest options names when double dash', function() {
        assert.deepEqual(command.parse(['--'], true), getSuggestions('--'));
    });

    it('should suggest matched options', function() {
        assert.deepEqual(command.parse(['--b'], true), getSuggestions('--b'));
    });

    it('should suggest matched commands', function() {
        assert.deepEqual(command.parse(['b'], true), getSuggestions('bar'));
    });

    it('should suggest nothing when no matches', function() {
        assert.deepEqual(command.parse(['--miss'], true), []);
    });

    it('should suggest matched commands and options of subcommands when no input', function() {
        assert.deepEqual(command.parse(['bar', ''], true), ['--help', '--test', 'baz', 'qux']);
    });

    it('should suggest matched commands of subcommands', function() {
        assert.deepEqual(command.parse(['bar', 'b'], true), ['baz']);
    });

    it('should suggest options of subcommands', function() {
        assert.deepEqual(command.parse(['foo', '-'], true), ['--bar', '--baz', '--foo', '--help']);
        assert.deepEqual(command.parse(['foo', '--'], true), ['--bar', '--baz', '--foo', '--help']);
    });

    it('should suggest matched options of subcommands', function() {
        assert.deepEqual(command.parse(['foo', '--b'], true), ['--bar', '--baz']);
    });

    it('should suggest nothing for option arguments', function() {
        assert.deepEqual(command.parse(['--required-arg', ''], true), []);
        assert.deepEqual(command.parse(['--required-arg', 'a'], true), []);
        assert.deepEqual(command.parse(['--optional-arg', ''], true), []);
        assert.deepEqual(command.parse(['--optional-arg', 'a'], true), []);
    });

    it('should suggest nothing after double dash', function() {
        assert.deepEqual(command.parse(['--', ''], true), []);
        assert.deepEqual(command.parse(['--', 'a'], true), []);
        assert.deepEqual(command.parse(['--', '-'], true), []);
        assert.deepEqual(command.parse(['--', '--'], true), []);
    });
});
