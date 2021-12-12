import { equal } from 'assert';
import { stdout } from 'test-console';
import * as clap from 'clap';

describe('command run', () => {
    let inspect;
    beforeEach(() => inspect = stdout.inspect());
    afterEach(() => inspect.restore());

    it('should output version when specified', () => {
        clap.command('test', false)
            .version('1.2.3')
            .run(['--version']);

        equal(inspect.output, '1.2.3\n');
    });
});
