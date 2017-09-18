var assert = require('assert');
var cli = require('..');

describe('command run', function(){
  describe('init()/args()', function(){
    function regCall(name){
      return function(){
        calls.push({
          name: name,
          this: this,
          arguments: [].slice.call(arguments)
        });
      };
    }

    function sliceCallValues(field){
      return calls.map(function(entry){
        return entry[field];
      });
    }

    var command;
    var nestedCommand;
    var calls;

    beforeEach(function(){
      calls = [];
      args = [];
      command = cli.create('test', '[arg1]')
                  .initContext(regCall('initContext'))
                  .init(regCall('init'))
                  .args(regCall('args'));
      nestedCommand = command
        .command('nested', '[arg2] [arg3]')
          .initContext(regCall('nested initContext'))
          .init(regCall('nested init'))
          .args(regCall('nested args'));
    });

    it('with no aguments should only init top level command', function(){
      command.run([]);
      assert.deepEqual(sliceCallValues('name'), ['initContext', 'init']);
    });

    it('with one argument should init and arg top level command', function(){
      command.run(['foo']);
      assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'args']);
      assert.deepEqual(sliceCallValues('arguments'), [[], [['foo']], ['foo']]);
    });

    it('with first argument as command should init both commands', function(){
      command.run(['nested']);
      assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'nested init']);
    });

    it('should init and args both commands', function(){
      command.run(['foo', 'nested', 'bar']);
      assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'args', 'nested init', 'nested args']);
      assert.deepEqual(sliceCallValues('this'), [command, command, command, nestedCommand, nestedCommand]);
      assert.deepEqual(sliceCallValues('arguments'), [[], [['foo']], ['foo'], [['bar']], ['bar']]);
    });

    it('should init and args top level command but only init nested', function(){
      command.run(['foo', 'nested']);
      assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'args', 'nested init']);
      assert.deepEqual(sliceCallValues('arguments'), [[], [['foo']], ['foo'], [[]]]);
    });

    it('should init top level command and init and args nested command', function(){
      command.run(['nested', 'bar', 'baz']);
      assert.deepEqual(sliceCallValues('name'), ['initContext', 'init', 'nested init', 'nested args']);
      assert.deepEqual(sliceCallValues('arguments'), [[], [[]], [['bar', 'baz']], ['bar', 'baz']]);
    });
  });

  describe('action()', function(){
    it('should have an expected input', function(){
      var calls = [];
      var command = cli
        .create('test', '[foo]')
        .option('--bar', 'bar option')
        .action(function(){
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

  describe('delegate()', function(){
    var calls;
    var command;
    var nestedCommand;

    beforeEach(function() {
      calls = [];
      command = cli
        .create('test', '[foo]')
        .delegate(function(){
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

    it('should not be called until nested command is invoked', function(){
      command.run(['abc']);

      assert.equal(calls.length, 0);
    });

    it('should be called before nested command init and have an expected input', function(){
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

  describe('required argument', function(){
    var action;
    var command = cli
      .create('test', '<arg1>')
      .action(function(){
        action = '1';
      });
    command
      .command('nested', '<arg2>')
      .action(function(){
        action = '2';
      });

    beforeEach(function(){
      action = '';
    });

    it('should throw exception if no first argument', function(){
      assert.throws(function(){
        command.run([]);
      })
    });
    it('should throw exception if no second argument', function(){
      assert.throws(function(){
        command.run(['one', 'nested']);
      })
    });
    it('should treat first argument as value', function(){
      command.run(['nested']);
      assert.equal(action, '1');
    });
    it('should run nested action', function(){
      command.run(['one', 'nested', 'two']);
      assert.equal(action, '2');
    });
  });
});
