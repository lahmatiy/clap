var assert = require('assert');
var cli = require('../lib');

describe('command run', function() {
    it('should output version when specified', () => {
        var output;

        cli
            .command('test', false, {
                infoOptionAction: res => output = res
            })
            .version('1.2.3')
            .run(['--version']);

        assert.equal(output, '1.2.3');
    });
});
