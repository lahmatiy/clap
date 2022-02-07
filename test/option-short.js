import { deepEqual, throws } from 'assert';
import * as clap from 'clap';

describe('short options', function() {
    describe('params when not in a sequence', () => {
        const command = clap.command('test')
            .option('-o, --optional [abc]', 'Optional')
            .option('-r, --required <abc>', 'Required');

        it('should allow ommit optional parameters', () => {
            deepEqual(command.run(['-o']).options, {
                optional: undefined
            });
        });
        it('should take optional parameters', () => {
            deepEqual(command.run(['-o', 'test']).options, {
                optional: 'test'
            });
        });

        it('should throws when required parameter is missed', () => {
            throws(
                () => command.run(['-r']),
                /Option -r should be used with at least 1 argument\(s\)/
            );
        });
        it('should be ok when required parameter is presented', () => {
            deepEqual(command.run(['-r', 'test']).options, {
                required: 'test'
            });
        });
    });

    describe('sequence of boolean options', function() {
        const command = clap.command('test')
            .option('-f, --foo', 'Foo')
            .option('-b, --bar', 'Bar')
            .option('-x, --baz', 'Baz')
            .option('-0, --zero', 'Zero');

        [
            { test: '-f', expected: { foo: true, bar: false, baz: false, zero: false } },
            { test: '-0', expected: { foo: false, bar: false, baz: false, zero: true } },
            { test: '-fb', expected: { foo: true, bar: true, baz: false, zero: false } },
            { test: '-f0b', expected: { foo: true, bar: true, baz: false, zero: true } },
            { test: '-fbx', expected: { foo: true, bar: true, baz: true, zero: false } },
            { test: '-xfbfx', expected: { foo: true, bar: true, baz: true, zero: false } }
        ].forEach(testcase =>
            it(testcase.test, () => {
                const actual = command.run([testcase.test]);
                deepEqual(actual.options, testcase.expected);
            })
        );
    });

    describe('should throws when unknown short', function() {
        const command = clap.command('test')
            .option('-f, --foo', 'Foo')
            .option('-b, --bar', 'Bar');

        ['-z', '-fz', '-fbz'].forEach((test) => {
            it(test, () =>
                throws(
                    () => command.run(['-fz']),
                    /Unknown option "z" in short options sequence: -fz/
                )
            );
        });
    });

    it('should throws when non-boolean in sequence', function() {
        const command = clap.command('test')
            .option('-f, --foo', 'Foo')
            .option('-b, --bar <asd>', 'Bar');

        throws(
            () => command.run(['-fb']),
            /Non-boolean option "-b" can't be used in short options sequence: -fb/
        );
        throws(
            () => command.run(['-bf']),
            /Non-boolean option "-b" can't be used in short options sequence: -bf/
        );
    });

    it('should throws when bad chars used in sequence', function() {
        const command = clap.command('test')
            .option('-f, --foo', 'Foo')
            .option('-b, --bar <asd>', 'Bar');

        throws(
            () => command.run(['-f!']),
            /Bad short options sequence: -f!/
        );
    });
});
