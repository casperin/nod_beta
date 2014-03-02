;(function(window, undefined){
'use strict';var log = console.log.bind(console);


//+ fnOf :: a -> fn -> b
var fnOf = autoCurry(function (x, fn) {
        return fn(x);
    }),

    invoke = autoCurry(function (method, obj) {
        return obj[method]();
    }),

    pluck = autoCurry(function (prop, arr) {
        var result = [], i = -1;
        while (++i < arr.length) {
            if (arr[i])
                result.push(arr[i][prop]);
        }
        return result;
    }),

    intersection = autoCurry(function (arr, arr2) {
        var result = [], i = -1;
        while (++i < arr.length) {
            if (arr2.indexOf(arr[i]) !== -1)
                result.push(arr[i]);
        }
        return result;
    }),

    each = autoCurry(function (fn, items) {
        if (items.forEach) return items.forEach(fn);
        if (items.length === +items.length) {
          var i = -1;
          while (++i < items.length)
            fn(items[i]);
        } else {
          for (var key in items)
            if (items.hasOwnProperty(key)) fn(items[key]);
        }
        return items;
    }),

    map = autoCurry(function (fn, items) {
        var result, i;
        if (items.map) return items.map(fn);
        if (items.length === +items.length) {
          result = [];
          i = -1;
          while (++i < items.length)
            result.push(fn(items[i]));
          return result;
        } else {
          result = {};
          for (var key in items_)
            if (items.hasOwnProperty(k)) result[key] = fn(items[key]);
          return result;
        }
    }),

    all = autoCurry(function (fn, arr) {
        var i = -1;
        while (++i < arr.length)
          if (!fn(arr[i])) return false;
        return true;
    }),

    any = autoCurry(function (fn, arr) {
        var i = -1;
        while (++i < arr.length)
          if (fn(arr[i])) return true;
        return false;
    }),


    eq = autoCurry(function (x, y) {
        return y === x;
    }),

    neq = autoCurry(function (x, y) {
        return y !== x;
    }),

    find = autoCurry(function (fn, items) {
        var len = items.length;
        if (len === +len) {
            var i = -1;
            while (++i < len) {
                if (fn(items[i])) {
                    return items[i];
                }
            }
        } else {
            for (var key in items) {
                if (items.hasOwnProperty(key) && fn(items[key])) {
                    return items[key];
                }
            }
        }
    }),

    findIndex = autoCurry(function (item, list) {
        for (var i = 0; i < list.length; i++) {
            if (list[i] === item) return i;
        }
        return -1;
    }),

    filter = autoCurry(function (fn, items) {
        var result, i;
        if (items.filter) return items.filter(fn);
        if (items.length === +items.length) {
          result = [];
          i = -1;
          while (++i < items.length)
            if (fn(items[i])) result.push(items[i]);
          return result;
        } else {
          result = {};
          for (var key in items) {
            if (items.hasOwnProperty(key) && fn(items[key]))
              result[key] = items[key];
          }
          return result;
        }
    }),

    dot = autoCurry(function (prop, obj) {
        return obj[prop];
    }),

    debounce = function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        return function() {
            context = this;
            args = arguments;
            timestamp = new Date();
            var later = function() {
                var last = (new Date()) - timestamp;
                if (last < wait) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) result = func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) result = func.apply(context, args);
            return result;
        };
    };

function compose() {
    var fns = arguments;
    return function() {
        var args = arguments, i = fns.length;
        while (i--) {
            args = [fns[i].apply(this, args)];
        }
        return args[0];
    };
}

function head(arr){ return arr[0]; }
function last(arr){ return arr[arr.length-1]; }


function curry(fn) {
  var toArray = function(arr, from) {
    return Array.prototype.slice.call(arr, from || 0);
  },
  args = toArray(arguments, 1);
  return function() {
    return fn.apply(this, args.concat(toArray(arguments)));
  };
}


function autoCurry(fn, numArgs) {
  var toArray = function(arr, from) {
    return Array.prototype.slice.call(arr, from || 0);
  };
  numArgs = numArgs || fn.length;
  return function() {
    var rem;
    if (arguments.length < numArgs) {
      rem = numArgs - arguments.length;
      if (numArgs - rem > 0) {
        return autoCurry(curry.apply(this, [fn].concat(toArray(arguments))), rem);
      } else {
        return curry.apply(this, [fn].concat(toArray(arguments)));
      }
    } else {
      return fn.apply(this, arguments);
    }
  };
}

var elems = [];      // List of all elements

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

    return checker.apply(this, args);
}

var checkers = {
    'presence' : function () {
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

// These checkers share their checking functions
checkers["one-of"] = checkers.presence;
checkers["all-or-none"] = checkers.presence;

// Backwards compatability
checkers["min-length"] = checkers["min-num"] = checkers.min;
checkers["max-length"] = checkers["max-num"] = checkers.max;
checkers["between-length"] = checkers["between-num"] = checkers.between;

var regexps = {
    "int" : /^\s*\d+\s*$/,
    "float" : /^\s*[-+]?[0-9]+(\.[0-9]+)\s*?$/,
    // email regexp follows RFC822
    "email" : /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/
};

function SubmitButton (selector) {
    var btn = $(selector);

    function listenTo (el) {
        $(el).on('toggle:isValid', toggleBtn);
    }

    function toggleBtn () {
        var errors = !elems.allAreValid();
        btn.prop('disabled', errors).toggleClass('disabled', errors);
    }

    // Listen to each element and enable/disable submit button
    each(compose(listenTo, dot('el')), elems.items);

    // Toggle button from the beginning
    toggleBtn();

    return {
        add: listenTo
    };
}

//+ runCheck :: item -> event -> dom side effects
function runCheck (item) {
    return function (ev) {

        var isValid = item.validate(),

            // The text displayed will be either the first item in the results
            // that aren't `true` (errorText), or the item's single `validText`
            nodText = head(filter(neq(true), item.getResults())) || item.validText;

        // Set text in textHolder, and update the class of its group
        if (nodText !== undefined) {
            item.textHolder.html(nodText).fadeIn();
        } else {
            item.textHolder.hide();
        }
        item.group
            .toggleClass("has-success", isValid)
            .toggleClass("has-error", !isValid);

        if (item.isValid !== isValid) {
            item.isValid = isValid;
            $(item.el).trigger('toggle:isValid');
        }
    };
}

function listenTo (item, selector) {
    $(selector)
        .on('keyup', debounce(runCheck(item), 700))
        .on('change blur', runCheck(item));
}

function attachListener (item) {

    // Listen to changes of its own element
    listenTo(item, item.el);

    // Prepare special case(s)
    var validates_list = map(function(validateText) {
            return validateText.split(":");
        }, item.validates);

    // Listen to the selector in "same-as" validates
    each(   compose(listenTo.bind(null, item), last),
            filter(compose(eq("same-as"), head), validates_list));

}



function Elem (element) {

    this.el = element;

    this.$el = $(this.el);

    this.group = this.$el.parents(".form-group");

    this.textHolder = $('<span/>', {'class':'help-block nod-text'}).hide();

    this.checks = [];

    this.validText = '';

    this.validates = [];

    this.getValue = this.makeGetValue();

    this.isValid = this.validate() || null;


    // Add the text holder into the dom
    this.addTextHolderToDom();
}

Elem.prototype.makeGetValue = function () {
    if (this.$el.attr('type') === 'checkbox') {
        return function() { return this.$el.is(':checked'); };
    } else {
        return function() { return $.trim(this.el.value); };
    }
};

Elem.prototype.validate = function () {
    return all(eq(true), this.getResults());
};

Elem.prototype.getResults = function () {
    return map(fnOf(this.getValue()), this.checks);
};

// Only run as part of the constructor
Elem.prototype.addTextHolderToDom = function () {
    var previousTextHolder = this.group.find('.nod-text'),
        type = this.$el.attr('type');

    if (type === 'radio' && previousTextHolder.length) {
        this.textHolder = previousTextHolder;
    } else if (type === 'radio' || type === 'checkbox') {
        this.group.append(this.textHolder);
    } else {
        this.$el.after(this.textHolder);
    }
};



/*
 * Run from collection
 */

Elem.prototype.addCheck = function (check, errorText) {
    this.checks.push(function (value) {
        return check(value) ? true : errorText;
    });
};

Elem.prototype.setValidText = function (validText) {
    this.validText = validText;
};

// String from user metrics such as 'exact-length:2'
Elem.prototype.addValidate = function (validate) {
    this.validates.push(validate);
};

function Elems (metrics) {

    var $els = $(pluck('selector', metrics).join());

    this.items = [];

    this.expandedMetrics = this.expandMetrics(metrics);

    each(this.addElement.bind(this), $els);

    this.attachCheckersFromExpandedMetrics();

}

// Entirely untested
Elems.prototype.add = function (element) {
    var elem = this.addElement(element);
    this.attachCheckersFromExpandedMetrics(elem);
};

Elems.prototype.addElement = function (element) {
    var elem;
    // Only add element if it is not already in the list of items
    if (all(compose(neq(element), dot('el')), this.items)) {
        elem = new Elem(element);
        this.items.push(elem);
    }
    return elem;
};

Elems.prototype.expandMetrics = map(function (metric) {
    return {
        $els: $(metric.selector),
        check: Checker(metric.validate),
        validate: metric.validate,
        validText: metric.validText,
        errorText: metric.errorText
    };
});

Elems.prototype.attachCheckersFromExpandedMetrics = function (newItem) {
    var attachChecker = this.attachChecker,
        items = newItem ? [newItem] : this.items;

    each(function (expandedMetric) {
        expandedMetric.$els.each(function () {
            var item = find(compose(eq(this), dot('el')), items);
            attachChecker(expandedMetric, item);
        });
    }, this.expandedMetrics);
};

Elems.prototype.attachChecker = function (expandedMetric, item) {
    item.addCheck(expandedMetric.check, expandedMetric.errorText);
    item.setValidText(expandedMetric.validText);
    item.addValidate(expandedMetric.validate);
};


// untested
Elems.prototype.allAreValid = function () {
    return all(compose(eq(true), dot('isValid')), this.items);
};

// Main function called by user
function nod (metrics, options) {

    elems = new Elems(metrics);

    each(attachListener, elems.items);

    var submit = SubmitButton(options.submitBtn);

    //function addElement (el) {
        //$(el).each(function () {
            //var items = elems.addElement(this);
            //if (!items) return;
            //each(attachListener, items);
            //submit.add(el);
        //});
    //}

    //function removeElement (el) {
        //el = $(el);
        //el.each(function () { elems.removeElement(this); });
        //el.off();
    //}

    //return {
        //add         : addElement,
        //remove      : removeElement,
        //allValid    : elems.allAreValid
    //};

}

nod.checkers = checkers;


window.nod = nod;
}(window));