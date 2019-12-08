[![NPM version](https://img.shields.io/npm/v/clap.svg)](https://www.npmjs.com/package/clap)
[![Build Status](https://travis-ci.org/lahmatiy/clap.svg?branch=master)](https://travis-ci.org/lahmatiy/clap)
[![Coverage Status](https://coveralls.io/repos/github/lahmatiy/clap/badge.svg?branch=master)](https://coveralls.io/github/lahmatiy/clap?branch=master)

# Clap.js

Argument parser for command-line interfaces. It primary target to large tool sets that provides a lot of subcommands. Support for argument coercion and completion makes task run much easer, even if you doesn't use CLI.

## Usage

```
npm install clap
```

```js
const cli = require('clap');

const myCommand = cli.command('my-command', '[optional-arg]')
    .description('Optional description')
    .version('1.2.3')
    .option('-b, --bool', 'Bollean option')
    .option('--foo <foo>', 'Option with required argument')
    .option('--bar [bar]', 'Option with optional argument')
    .option('--baz [value]', 'Option with optional argument and normalize function', function(value) {
        // calls on init and for any value set
        return Number(value);
    }, 123) // 123 is default
    .action(function(args, literalArgs) {
        // args goes before options
        // literal args goes after --
        // this.values is an object with collected values
    });

myCommand.run();  // runs with process.argv.slice(2)
myCommand.run(['--foo', '123', '-b'])

// sub-commands
myCommand
    .command('nested')
        .option('-q, --quz', 'Some parameter', 'Default value')
        // ...
        .end()
    .command('another-command')
        // ...
        .command('level3-command')
            //...
```

## License

MIT
