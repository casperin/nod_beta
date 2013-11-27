function Checker (m) {

    // User defined function for checking the validity of the input
    if (!!(m && m.constructor && m.call && m.apply)) {
        return m;
    }


    if (m instanceof RegExp) {
        return function (value) {
            return m.test(value);
        };
    }

    var args  = m.split(':'),
        type = args.shift(),
        checker = checkers[type];

    if(!checker) {
        throw new Error("I don't know how to check for: " + type);
    }

    return checker.apply(nod, args);
}

var checkers = {
    'presence' : function () {
        return function (value) {
            return !!value;
        };
    },

    'one-of' : function () {
        return function (value) {
            return !!value;
        };
    },

    'all-or-none' : function () {
        return function (value) {
            return !!value;
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
        if ($(selector).length !== 1) {
            throw new Error('same-as selector must target one and only one element');
        }

        return function (value) {
            return value === $(selector).val();
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

    'exact-length': function (length) {
        return function (value) {
            return value.length === +length;
        };
    },

    'between': function (min, max) {
        return function (value) {
            return value.length >= +min && value.length <= +max;
        };
    },

    'integer': function () {
        return function (value) {
            return (/^\s*\d+\s*$/).test(value);
        };
    },

    'min-num': function (min) {
        return function (value) {
            return +value >= +min;
        };
    },

    'max-num': function (max) {
        return function (value) {
            return +value <= +max;
        };
    },

    'between-num': function (min, max) {
        return function (value) {
            return +value >= +min && +value <= +max;
        };
    },

    'float': function () {
        return function (value) {
            return (/^[-+]?[0-9]+(\.[0-9]+)?$/).test(value);
        };
    },

    'email': function () {
        return function (value) {
            // TODO: this really shouldn't be created every time this check is
            // made.
            var RFC822 = (/^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/);
            return RFC822.test(value);
        };
    }
}
