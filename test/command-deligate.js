var assert = require('assert');
var cli = require('../lib');

describe('Command#delegate()', function() {
    var calls;
    var command;
    var nestedCommand;

    beforeEach(function() {
        calls = [];
        command = cli
            .command('test', '[foo]')
            .delegate(function() {
                calls.push({
                    name: 'delegate',
                    this: this,
                    arguments: [].slice.call(arguments)
                });
            });

        nestedCommand = command
            .command('nested', '[bar]')
            .init(function() {
                calls.push({
                    name: 'nested init',
                    this: this,
                    arguments: [].slice.call(arguments)
                });
            });
    });

    it('should not be called until nested command is invoked', function() {
        command.run(['abc']);

        assert.equal(calls.length, 0);
    });

    it('should be called before nested command init and have an expected input', function() {
        command.run(['abc', 'nested', 'def']);

        assert.equal(calls.length, 2);
        assert.deepEqual(calls, [
            {
                name: 'delegate',
                this: command,
                arguments: [nestedCommand]
            },
            {
                name: 'nested init',
                this: nestedCommand,
                arguments: [['def']]
            }
        ]);
    });
});
