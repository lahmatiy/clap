const assert = require('assert');
const cli = require('../lib');

describe('init()/applyConfig()/finishContext()', function() {
    let command;
    let calls;

    beforeEach(function() {
        calls = [];
        command = cli.command('test [arg1]')
            .init(() => calls.push('init'))
            .applyConfig(() => calls.push('applyConfig'))
            .finishContext(() => calls.push('finishContext'));
        command.command('nested [arg2] [arg3]')
            .init(() => calls.push('nested init'))
            .applyConfig(() => calls.push('nested applyConfig'))
            .finishContext(() => calls.push('nested finishContext'));
    });

    it('with no arguments should init/finishContext top level command only', function() {
        command.run([]);
        assert.deepEqual(calls, ['init', 'applyConfig', 'finishContext']);
    });

    it('with one argument should init and finishContext top level command', function() {
        command.run(['foo']);
        assert.deepEqual(calls, ['init', 'applyConfig', 'finishContext']);
    });

    it('with first argument as command should init/finishContext both commands', function() {
        command.run(['nested']);
        assert.deepEqual(calls, ['init', 'applyConfig', 'finishContext', 'nested init', 'nested applyConfig', 'nested finishContext']);
    });
});
