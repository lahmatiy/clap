## 2.0.0 (December 8, 2019)

- Dropped support for Node < 8
- Bumped deps to latest versions
- Added config argument for Command and create function
    - `defaultHelp` option to prevent adding `--`help option on command create
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
