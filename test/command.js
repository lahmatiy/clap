var assert = require('assert');
var cli = require('..');

describe('command run', function(){
  describe('init/args', function(){
    var command;
    var calls;

    beforeEach(function(){
      calls = [];
      command = cli.create('test', '[arg1]')
                  .init(function(){
                    calls.push('init');
                  })
                  .args(function(){
                    calls.push('args');
                  });
      command
        .command('nested', '[arg2]')
          .init(function(){
            calls.push('nested init');
          })
          .args(function(){
            calls.push('nested args');
          });
    });

    it('with no aguments should only init top level command', function(){
      command.run([]);
      assert.deepEqual(calls, ['init']);
    });

    it('with one argument should init and arg top level command', function(){
      command.run(['foo']);
      assert.deepEqual(calls, ['init', 'args']);
    });

    it('with first argument as command should init both commands', function(){
      command.run(['nested']);
      assert.deepEqual(calls, ['init', 'nested init']);
    });

    it('should init and args both commands', function(){
      command.run(['foo', 'nested', 'bar']);
      assert.deepEqual(calls, ['init', 'args', 'nested init', 'nested args']);
    });

    it('should init and args top level command but only init nested', function(){
      command.run(['foo', 'nested']);
      assert.deepEqual(calls, ['init', 'args', 'nested init']);
    });

    it('should init top level command and init and args nested command', function(){
      command.run(['nested', 'bar']);
      assert.deepEqual(calls, ['init', 'nested init', 'nested args']);
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
