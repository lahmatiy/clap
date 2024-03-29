## 3.1.1 (February 7, 2022)

- Fixed a regression introduced in `3.1.0` for short options which can't be used with a parameter when not in a short options sequence

## 3.1.0 (February 7, 2022)

- Fixed signature of `command()` function by removing parameters except the first one, since others are not used anymore
- Added throwing an error when using the second parameter in a command definition (i.e. `command("name", "[arg1] [arg2]")`) to avoid mistakes on migration from v2.0
- Allowed `-` as a value for arg

## 3.0.0 (December 12, 2021)

- Allowed args between and after the options
- Replaced `chalk` with `ansi-colors`
- Package
    - Changed supported versions of Node.js to `^12.20.0`, `^14.13.0` and `>=15.0.0`
    - Converted to ESM. CommonJS is supported as well (dual module)

## 3.0.0-beta.1 (February 14, 2020)

- Restored wrongly removed `Command#extend()`
- Changed `Command`'s constructor and `Command#command(method)` to take `usage` only (i.e. `command('name [param]')` instead `command('name', '[param]')`)
- Added `Command#clone()` method
- Added `Command#getCommand(name)` and `Command#getCommands()` methods
- Added `Command#getOption(name)` and `Command#getOptions()` methods
- Added `Command#messageRef()` and `Option#messageRef()` methods
- Added `Command#createOptionValues(values)` method
- Added `Command#help()` method similar to `Command#version()`, use `Command#help(false)` to disable default help action option
- Fixed `Command#showHelp()`, it's now logs help message in console instead of returning it
- Renamed `Command#showHelp()` into `Command#outputHelp()`
- Changed `Command` to store params info (as `Command#params`) even if no params
- Removed `Command#infoOption()` method, use `action` in option's config instead, i.e. `option(usage, description, { action: ... })`
- Removed `Command#infoOptionAction` and `infoOptionAction` option for `Command` constructor as well
- Removed `Command#shortcut()` method, use `shortcut` in option's config instead, i.e. `option(usage, description, { shortcut: ... })`
- Changed `Command#command()` to raise an exception when subcommand name already in use
- Removed `Command#setOptions()` method
- Removed `Command#setOption()` method
- Removed `Command#hasOptions()` method
- Removed `Command#hasOption()` method
- Removed `Command#hasCommands()` method
- Removed `Command#normalize()` method (use `createOptionValues()` instead)
- Changed `Option` to store params info as `Option#params`, it always an object even if no params
- Added `Option#names()` method
- Removed name validation for subcommands
- Allowed a number for options's short name
- Changed `argv` parse handlers to [`init()` → `applyConfig()` → `prepareContext()`]+ → `action()`
- Changed exports
    - Added `getCommandHelp()` function
    - Added `Params` class
    - Removed `Argument` class
    - Removed `color` option

## 2.0.1 (December 16, 2019)

- Fixed multiline description output in help

## 2.0.0 (December 8, 2019)

- Dropped support for Node < 8
- Bumped deps to latest versions
- Added config argument for `Command` and create a function
    - `defaultHelp` option to prevent adding `--help` option on command create
    - `infoOptionAction` option to override action when info option involved (output to stdout and `exit(0)` by default)
- Added `Command#infoOption()` method
- Fixed failure on argv parsing when all types of values are passed (i.e. args & options & literal args)
- Renamed `create()` method to `command()`
- Removed `error()` method
- Removed `confirm()` method

## 1.2.3 (September 20, 2017)

- Rolled back passing params to `args()` back as array

## 1.2.2 (September 18, 2017)

- Fixed context passed to `Command#args()`, now it's a command as expected (#10)
- Fixed consuming of literal arguments that wrongly concating with other arguments (i.e. anything going after `--` concats with arguments before `--`)

## 1.2.1 (September 18, 2017)

- Fixed multi value option processing (@tyanas & @smelukov, #9)

## 1.2.0 (June 13, 2017)

- Improved multi value option processing (@smelukov, #7)

## 1.1.3 (March 16, 2017)

- Fixed `Command#normalize()` issue when set a value for option with argument and no default value

## 1.1.2 (December 3, 2016)

- Fix exception on `Command#normalize()`

## 1.1.1 (May 10, 2016)

- Fix `chalk` version

## 1.1.0 (March 19, 2016)

- `Command#extend()` accepts parameters for passed function now
- Implement `Command#end()` method to return to parent command definition
- Fix suggestion bugs and add tests

## 1.0.0 (Oct 12, 2014)

- Initial release
