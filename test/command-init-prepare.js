const assert = require('assert');
const cli = require('../lib');

describe('init()/prepare()', function() {
    let command;
    let calls;

    beforeEach(function() {
        calls = [];
        command = cli.command('test', '[arg1]')
            .init(() => calls.push('init'))
            .prepare(() => calls.push('prepare'));
        command.command('nested', '[arg2] [arg3]')
            .init(() => calls.push('nested init'))
            .prepare(() => calls.push('nested prepare'));
    });

    it('with no arguments should init/prepare top level command only', function() {
        command.run([]);
        assert.deepEqual(calls, ['init', 'prepare']);
    });

    it('with one argument should init and prepare top level command', function() {
        command.run(['foo']);
        assert.deepEqual(calls, ['init', 'prepare']);
    });

    it('with first argument as command should init/prepare both commands', function() {
        command.run(['nested']);
        assert.deepEqual(calls, ['init', 'prepare', 'nested init', 'nested prepare']);
    });
});
