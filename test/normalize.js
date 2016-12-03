var assert = require('assert');
var cli = require('..');

describe('normalize', function(){
  var command;

  beforeEach(function(){
    command = cli.create();
  });

  it('boolean option', function(){
    command
      .option('--option', 'description', Boolean);

    var res = command.normalize({ option: 'bad value' });
    assert(res.option === true);
  });

  it('enum option', function(){
    command
      .option('--option <arg>', 'description', function(value){ return isNaN(value) ? 0 : value; }, 1);

    var res = command.normalize({ option: 'bad value' });
    assert(res.option === 0);
  });
});
