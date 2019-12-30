var assert = require('assert');
var cli = require('../lib');

describe('init()/args()', function() {
    function regCall(name) {
        return function(...args) {
            calls.push({
                name,
                this: this,
                arguments: args
            });
        };
    }

    function sliceCallValues(field) {
        return calls.map(function(entry) {
            return entry[field];
        });
    }

    var command;
    var calls;

    beforeEach(function() {
        calls = [];
        command = cli.command('test', '[arg1]')
            .init(regCall('init'))
            .prepare(regCall('prepare'));
        command.command('nested', '[arg2] [arg3]')
            .init(regCall('nested init'))
            .prepare(regCall('nested prepare'));
    });

    it('with no arguments should init/prepare top level command only', function() {
        command.run([]);
        assert.deepEqual(sliceCallValues('name'), ['init', 'prepare']);
    });

    it('with one argument should init and prepare top level command', function() {
        command.run(['foo']);
        assert.deepEqual(sliceCallValues('name'), ['init', 'prepare']);
    });

    it('with first argument as command should init/prepare both commands', function() {
        command.run(['nested']);
        assert.deepEqual(sliceCallValues('name'), ['init', 'prepare', 'nested init', 'nested prepare']);
    });
});
