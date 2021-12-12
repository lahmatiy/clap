import { equal, deepEqual, strictEqual } from 'assert';
import * as clap from 'clap';

describe('action()', () => {
    it('should have an expected input', () => {
        const calls = [];
        const command = clap.command('test [foo]')
            .option('--bar', 'bar option')
            .action(function(...args) {
                calls.push({
                    this: this,
                    arguments: args
                });
            });

        command.run(['abc', '--', 'rest', 'args']);

        equal(calls.length, 1);
        strictEqual(calls[0].this, null);
        deepEqual(calls[0].arguments, [{
            commandPath: ['test'],
            options: { bar: false },
            args: ['abc'],
            literalArgs: ['rest', 'args']
        }]);
    });
});
