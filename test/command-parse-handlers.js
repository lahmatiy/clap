import { deepEqual } from 'assert';
import * as clap from 'clap';

describe('init()/applyConfig()/finishContext()', () => {
    let command;
    let calls;

    beforeEach(() => {
        calls = [];
        command = clap.command('test [arg1]')
            .init(() => calls.push('init'))
            .applyConfig(() => calls.push('applyConfig'))
            .finishContext(() => calls.push('finishContext'));
        command.command('nested [arg2] [arg3]')
            .init(() => calls.push('nested init'))
            .applyConfig(() => calls.push('nested applyConfig'))
            .finishContext(() => calls.push('nested finishContext'));
    });

    it('with no arguments should init/finishContext top level command only', () => {
        command.run([]);
        deepEqual(calls, ['init', 'applyConfig', 'finishContext']);
    });

    it('with one argument should init and finishContext top level command', () => {
        command.run(['foo']);
        deepEqual(calls, ['init', 'applyConfig', 'finishContext']);
    });

    it('with first argument as command should init/finishContext both commands', () => {
        command.run(['nested']);
        deepEqual(calls, ['init', 'applyConfig', 'finishContext', 'nested init', 'nested applyConfig', 'nested finishContext']);
    });
});
