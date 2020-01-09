const assert = require('assert');
const cli = require('../lib');

describe('action()', function() {
    it('should have an expected input', function() {
        const calls = [];
        const command = cli
            .command('test [foo]')
            .option('--bar', 'bar option')
            .action(function(...args) {
                calls.push({
                    this: this,
                    arguments: args
                });
            });

        command.run(['abc', '--', 'rest', 'args']);

        assert.equal(calls.length, 1);
        assert.notDeepEqual(calls[0].this, command);
        assert.deepEqual(calls[0].arguments, [{
            commandPath: ['test'],
            options: { bar: false },
            args: ['abc'],
            literalArgs: ['rest', 'args']
        }]);
    });
});
