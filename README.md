[![NPM version](https://img.shields.io/npm/v/clap.svg)](https://www.npmjs.com/package/clap)
[![Build Status](https://github.com/lahmatiy/clap/actions/workflows/build.yml/badge.svg)](https://github.com/lahmatiy/clap/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/lahmatiy/clap/badge.svg?branch=master)](https://coveralls.io/github/lahmatiy/clap?branch=master)

# Clap.js

A library for node.js to build command-line interfaces (CLI). With its help, making a simple CLI application is a trivial task. It equally excels in complex tools with a lot of subcommands and specific features. This library supports argument coercion and completion suggestion — typing the commands is much easier.

Inspired by [commander.js](https://github.com/tj/commander.js)

Features:

- TBD

## Usage

```
npm install clap
```

```js
const cli = require('clap');

const myCommand = cli.command('my-command [optional-arg]')
    .description('Optional description')
    .version('1.2.3')
    .option('-b, --bool', 'Bollean option')
    .option('--foo <foo>', 'Option with required argument')
    .option('--bar [bar]', 'Option with optional argument')
    .option('--baz [value]', 'Option with optional argument and normalize function',
        value => Number(value),
        123 // 123 is default
    )
    .action(function({ options, args, literalArgs }) {
        // options is an object with collected values
        // args goes before options
        // literal args goes after "--"
    });

myCommand.run();  // the same as "myCommnad.run(process.argv.slice(2))"
myCommand.run(['--foo', '123', '-b'])

// sub-commands
myCommand
    .command('nested')
        .option('-q, --quz', 'Some parameter', 'Default value')
        // ...
        .end()
    .command('another-command [arg1] [arg2]')
        // ...
        .command('level3-command')
            //...
```

## API

### Command

```
.command()
    // definition
    .description(value)
    .version(value, usage, description, action)
    .help(usage, description, action)
    .option(usage, description, ...options)
    .command(usageOrCommand)
    .extend(fn, ...options)
    .end()

    // argv processing pipeline handler setters
    .init(command, context)
    .applyConfig(context)
    .prerareContenxt(context)
    .action(context)

    // main methods
    .parse(argv, suggest)
    .run(argv)

    // misc
    .clone(deep)
    .createOptionValues()
    .getCommand(name)
    .getCommands()
    .getOption(name)
    .getOptions()
    .outputHelp()
```

### .option(usage, description, ...options)

There are two usage:

```
.option(usage, description, normalize, value)
.option(usage, description, options)
```

Where `options`:

```
{
    default: any,          // default value
    normalize: (value, oldValue) => { ... }, // any value for option is passing through this function and its result stores as option value
    shortcut: (value, oldValue) => { ... },  // for shortcut options, the handler is executed after the value is set, and its result (an object) is used as a source of values for other options
    action: () => { ... }, // for an action option, which breaks regular args processing and preform and action (e.g. show help or version)
    config: boolean        // mark option is about config and should be applied before `applyConfig()`
}
```

### Argv processing

- `init(command, context)`  // before arguments parsing
    - invoke action option and exit if any
- apply **config** options
- `applyConfig(context)`
- apply all the rest options
- `prepareContext(context)` // after arguments parsing
    - switch to next command -> command is prescending
        - `init(command, context)`
            - invoke action option and exit if any
        - apply **config** options
        - `applyConfig(context)`
        - apply all the rest options
        - `prepareContext(context)` // after arguments parsing
            - switch to next command
                - ...
            - `action(context)` -> command is target
    - `action(context)` -> command is target

## License

MIT
