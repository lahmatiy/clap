var assert = require('assert');
var cli = require('../lib');

describe('action()', function() {
    it('should have an expected input', function() {
        var calls = [];
        var command = cli
            .command('test', '[foo]')
            .option('--bar', 'bar option')
            .action(function() {
                calls.push({
                    this: this,
                    arguments: [].slice.call(arguments)
                });
            });

        command.run(['abc', '--', 'rest', 'args']);

        assert.equal(calls.length, 1);
        assert.equal(calls[0].this, command);
        assert.deepEqual(calls[0].arguments, [['abc'], ['rest', 'args']]);
    });
});
