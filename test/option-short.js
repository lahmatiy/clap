const assert = require('assert');
const cli = require('../lib');

describe('short options', function() {
    describe('sequence of boolean options', function() {
        const command = cli.command('test')
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
                assert.deepEqual(testcase.expected, actual.options);
            })
        );
    });

    describe('should throws when unknown short', function() {
        const command = cli.command('test')
            .option('-f, --foo', 'Foo')
            .option('-b, --bar', 'Bar');

        ['-z', '-fz', '-fbz'].forEach((test) => {
            it(test, () =>
                assert.throws(
                    () => command.run(['-fz']),
                    /Unknown option "z" in short option sequence: -fz/
                )
            );
        });
    });

    it('should throws when non-boolean in sequence', function() {
        const command = cli.command('test')
            .option('-f, --foo', 'Foo')
            .option('-b, --bar <asd>', 'Bar');

        assert.throws(
            () => command.run(['-fb']),
            /Non-boolean option "-b" can't be used in short option sequence: -fb/
        );
        assert.throws(
            () => command.run(['-bf']),
            /Non-boolean option "-b" can't be used in short option sequence: -bf/
        );
    });
});
