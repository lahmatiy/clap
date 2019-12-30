var assert = require('assert');
var cli = require('../lib');

describe('short options', function() {
    describe('sequence of boolean options', function() {
        var command = cli.command('test')
            .option('-f, --foo', 'Foo')
            .option('-b, --bar', 'Bar')
            .option('-x, --baz', 'Baz');

        [
            { test: '-f', expected: { foo: true, bar: false, baz: false } },
            { test: '-fb', expected: { foo: true, bar: true, baz: false } },
            { test: '-fbx', expected: { foo: true, bar: true, baz: true } },
            { test: '-xfbfx', expected: { foo: true, bar: true, baz: true } }
        ].forEach(testcase =>
            it(testcase.test, () => {
                const actual = command.run([testcase.test]);
                assert.deepEqual(testcase.expected, actual.options);
            })
        );
    });

    describe('should throws when unknown short', function() {
        var command = cli.command('test')
            .option('-f, --foo', 'Foo')
            .option('-b, --bar', 'Bar');

        ['-z', '-fz', '-fbz'].forEach((test) => {
            it(test, () =>
                assert.throws(
                    () => command.run(['-fz']),
                    /Unknown short option: -z/
                )
            );
        });
    });

    it('should throws when non-boolean in sequence', function() {
        var command = cli.command('test')
            .option('-f, --foo', 'Foo')
            .option('-b, --bar <asd>', 'Bar');

        assert.throws(
            () => command.run(['-fb']),
            /Non-boolean option -b can't be used in short option sequence: -fb/
        );
        assert.throws(
            () => command.run(['-bf']),
            /Non-boolean option -b can't be used in short option sequence: -bf/
        );
    });
});
