function Checker (validate, selectors) {

    // User defined function for checking the validity of the input
    if (!!(validate && validate.constructor && validate.call && validate.apply)) {
        return validate;
    }


    if (validate instanceof RegExp) {
        return function (value) {
            return validate.test(value);
        };
    }

    var args  = validate.split(':'),
        type = args.shift(),
        checker = checkers[type];

    if(!checker) {
        throw new Error("I don't know how to check for: " + type);
    }

    return checker.apply(this, args);
}

var checkers = {
    'presence' : function () {
        return function (value) {
            return !!value;
        };
    },

    'presence-if' : function (selector, checkValue) {
        var checkElement = $(selector);
        return function (value) {
            return checkElement.val() === checkValue ? !!value : true;
        };
    },

    'empty' : function () {
        return function (value) {
            return value.length === 0 || !!(void 0);
        };
    },

    'exact' : function (checkValue) {
        return function (value) {
            return value === checkValue;
        };
    },

    'not' : function (checkValue) {
        return function (value) {
            return value !== checkValue;
        };
    },

    'same-as' : function (selector) {
        var checkElement = $(selector);
        if (checkElement.length !== 1) {
            throw new Error('same-as selector must target one and only one element');
        }

        return function (value) {
            return value === checkElement.val();
        };
    },

    'one-of' : function (selectors) {
        var checkElement = $(selectors);
        return function () {
            var results = checkElement.map(function () {
                return this.value;
            }).get().join('');
            return !!results;
        };
    },

    'all-or-none' : function (selectors) {
        var checkElement = $(selectors);
        return function () {
            var results = checkElement.map(function () {
                return !!this.value;
            }).get();
            return (all(eq(true), results) || all(eq(false), results));
        };
    },

    'min': function (min) {
        return function (value) {
            var parsedVal = isNaN(value) ? value.length : +value;
            return parsedVal >= +min;
        };
    },

    'max': function (max) {
        return function (value) {
            var parsedVal = isNaN(value) ? value.length : +value;
            return parsedVal <= +max;
        };
    },

    'between': function (min, max) {
        return function (value) {
            var parsedVal = isNaN(value) ? value.length : +value;
            return parsedVal >= +min && parsedVal <= +max;
        };
    },

    'exact-length': function (length) {
        return function (value) {
            return value.length === +length;
        };
    },

    'min-length': function (length) {
        return function (value) {
            return value.length >= +length;
        };
    },

    'max-length': function (length) {
        return function (value) {
            return value.length <= +length;
        };
    },

    'integer': function () {
        return function (value) {
            return regexps.int.test(value);
        };
    },

    'float': function () {
        return function (value) {
            return regexps.float.test(value);
        };
    },

    'email': function () {
        return function (value) {
            return regexps.email.test(value);
        };
    }
};

// Backwards compatability
checkers["min-num"] = checkers.min;
checkers["max-num"] = checkers.max;
checkers["between-length"] = checkers["between-num"] = checkers.between;

var regexps = {
    "int" : /^\s*\d+\s*$/,
    "float" : /^\s*[-+]?[0-9]+(\.[0-9]+)\s*?$/,
    // email regexp follows RFC822
    "email" : /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/
};
