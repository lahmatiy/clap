var assert = require('assert');
var cli = require('../lib');

describe('init()/args()', function() {
    function regCall(name) {
        return function() {
            calls.push({
                name: name,
                this: this,
                arguments: [].slice.call(arguments)
            });
        };
    }

    function sliceCallValues(field) {
        return calls.map(function(entry) {
            return entry[field];
        });
    }

    var command;
    var nestedCommand;
    var calls;

    beforeEach(function() {
        calls = [];
        command = cli.command('test', '[arg1]')
            .initContext(regCall('initContext'))
            .init(regCall('init'))
            .args(regCall('args'));
        nestedCommand = command.command('nested', '[arg2] [arg3]')
            .initContext(regCall('nested initContext'))
            .init(regCall('nested init'))
            .args(regCall('nested args'));
    });

    it('with no arguments should only init top level command', function() {
        command.run([]);
        assert.deepEqual(sliceCallValues('name'), ['initContext', 'init']);
    });

    it('with one argument should init and arg top level command', function() {
        command.run(['foo']);
        assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'args']);
        assert.deepEqual(sliceCallValues('arguments'), [[], [['foo']], [['foo']]]);
    });

    it('with first argument as command should init both commands', function() {
        command.run(['nested']);
        assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'nested init']);
    });

    it('should init and args both commands', function() {
        command.run(['foo', 'nested', 'bar']);
        assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'args', 'nested init', 'nested args']);
        assert.deepEqual(sliceCallValues('this'), [command, command, command, nestedCommand, nestedCommand]);
        assert.deepEqual(sliceCallValues('arguments'), [[], [['foo']], [['foo']], [['bar']], [['bar']]]);
    });

    it('should init and args top level command but only init nested', function() {
        command.run(['foo', 'nested']);
        assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'args', 'nested init']);
        assert.deepEqual(sliceCallValues('arguments'), [[], [['foo']], [['foo']], [[]]]);
    });

    it('should init top level command and init and args nested command', function() {
        command.run(['nested', 'bar', 'baz']);
        assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'nested init', 'nested args']);
        assert.deepEqual(sliceCallValues('arguments'), [[], [[]], [['bar', 'baz']], [['bar', 'baz']]]);
    });
});
