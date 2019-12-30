const assert = require('assert');
const stdout = require('test-console').stdout;
const cli = require('../lib');

describe('command run', function() {
    let inspect;
    beforeEach(() => inspect = stdout.inspect());
    afterEach(() => inspect.restore());

    it('should output version when specified', () => {
        cli
            .command('test', false)
            .version('1.2.3')
            .run(['--version']);

        assert.equal(inspect.output, '1.2.3\n');
    });
});
