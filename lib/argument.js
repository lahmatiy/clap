/**
* @class
*/
var Argument = function(name, required) {
    this.name = name;
    this.required = required;
};
Argument.prototype = {
    required: false,
    name: '',
    normalize: value => value,
    suggest: function() {
        return [];
    }
};

module.exports = Argument;
