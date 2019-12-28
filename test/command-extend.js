var assert = require('assert');
var cli = require('../lib');

describe('Command#extend()', () => {
    it('basic', () => {
        const invocations = [];
        const extension = (...args) => {
            invocations.push(args);
        };

        const command = cli
            .command('test')
            .extend(extension, 1, 2);
        const nested = command
            .command('nested')
            .extend(extension)
            .extend(extension, 1, 2, 3, 4);

        command.extend(extension, 2, 3);

        assert.deepEqual(invocations, [
            [command, 1, 2],
            [nested],
            [nested, 1, 2, 3, 4],
            [command, 2, 3]
        ]);
    });
});
