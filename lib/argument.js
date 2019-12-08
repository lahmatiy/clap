/**
* @class
*/
var Argument = function(name, required) {
    this.name = name;
    this.required = required;
};
Argument.prototype = {
    required: false,
    name: ''
};

module.exports = Argument;
