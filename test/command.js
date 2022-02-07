import { throws } from 'assert';
import * as clap from 'clap';

describe('create a command', () => {
    it('should throw when second argument is used', () => {
        throws(() => {
            clap.command('test', '[arg]');
        }, /Second parameter in Command constructor is deprecated/);
    });
});
