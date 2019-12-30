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

## API

### Command

```
.command()
    // definition
    .version(value)
    .description(value)
    .option(usage, description, ...options)
    .actionOption(usage, description, action)
    .shortcutOption(usage, description, handler, ...options)
    .command(nameOrCommand, params, config)
    .extend(fn, ...options)
    .clone(deep)
    .end()

    // argv processing handlers
    .init(command, context)
    .prepare(context)
    .action(context)

    // run
    .parse(argv, suggest)
    .run(argv)

    // utils
    .setValue(name, value, ignoreUnknown)
    .setValues(values, ignoreUnknown)
    .reset()
    .createOptionValues()
    .normalize(values)
    .hasCommand(name)
    .hasCommands()
    .hasOption(name)
    .hasOptions()
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
    value: any,            // default value
    normalize: (value, oldValue) => { ... }, // any value for option is passing through this function and its result stores as option value
    shortcut: (value, oldValue) => { ... },  // for shortcut options, the handler is executed after the value is set, and its result (an object) is used as a source of values for other options
    action: () => { ... }  // for an action option, which breaks regular args processing and preform and action (e.g. show help or version)
}
```

### Args processing

- init(command)  // before arguments parsing
- invoke action option and exit if any
- apply option values
- prepare(values, context) // after arguments parsing
    - switch to next command -> command is prescending
        - init(...)
        - invoke action option and exit if any
        - apply option values
        - prepare(values, context) // after arguments parsing
            - switch to next command
                - ...
            - action(values, context) -> command is target
    - action(values, context) -> command is target

## License

MIT
