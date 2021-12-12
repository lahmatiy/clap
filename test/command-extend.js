import { deepEqual } from 'assert';
import * as clap from 'clap';

describe('Command#extend()', () => {
    it('basic', () => {
        const invocations = [];
        const extension = (...args) => {
            invocations.push(args);
        };

        const command = clap.command('test')
            .extend(extension, 1, 2);
        const nested = command
            .command('nested')
            .extend(extension)
            .extend(extension, 1, 2, 3, 4);

        command.extend(extension, 2, 3);

        deepEqual(invocations, [
            [command, 1, 2],
            [nested],
            [nested, 1, 2, 3, 4],
            [command, 2, 3]
        ]);
    });
});
