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

// These checkers share their checking functions
checkers["one-of"] = checkers.presence;
checkers["all-or-none"] = checkers.presence;

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

function SubmitButton (elems, selector) {
    var btn = $(selector);

    function listenTo ($el) {
        $el.on('toggle:isValid', toggleBtn);
    }

    function toggleBtn () {
        var errors = !elems.allAreValid();
        //log(errors);
        btn.prop('disabled', errors).toggleClass('disabled', errors);
    }

    // Listen to each element and enable/disable submit button
    each(compose(listenTo, dot('$el')), elems.items);

    // Toggle button from the beginning
    toggleBtn();

    return {
        add: listenTo
    };
}

function Elem (element) {

    this.el = element;

    this.$el = $(this.el);

    this.group = this.$el.parents(".form-group");

    this.textHolder = $('<span/>', {'class':'help-block nod-text'}).hide();

    this.checks = [];

    this.validText = '';

    this.isValid = null;

    this.validates = [];

    this.getValue = this.makeGetValue();


    // Add the text holder into the dom
    this.addTextHolderToDom();

    //this.attachListeners();
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
    this.isValid = this.validate() || null;
};

Elem.prototype.setValidText = function (validText) {
    this.validText = validText;
};

// String from user metrics such as 'exact-length:2'
Elem.prototype.addValidate = function (validate) {
    this.validates = this.validates.concat(validate);
};




Elem.prototype.attachListeners = function () {
    this.listenTo(this.$el);

    // Prepare special case(s)
    var validates_list = map(function(validateText) {
            return validateText.split(":");
        }, this.validates);

    each( // Listen to the selector in "same-as" validates
        compose(this.listenTo.bind(this), $, last),
        filter(compose(eq("same-as"), head), validates_list)
    );
};

Elem.prototype.listenTo = function ($el) {
    $el .off()  // We only want to listen to it once
        .on('keyup', debounce(this.runCheck.bind(this), 700))
        .on('change blur', this.runCheck.bind(this));
};

Elem.prototype.runCheck = function () {
    var isValid = this.validate(),

        // The text displayed will be either the first item in the results
        // that aren't `true` (errorText), or the item's single `validText`
        nodText = head(filter(neq(true), this.getResults())) || this.validText;

    // Set text in textHolder, and update the class of its group
    if (nodText !== undefined) {
        this.textHolder.html(nodText).fadeIn();
    } else {
        this.textHolder.hide();
    }
    this.group
        .toggleClass("has-success", isValid)
        .toggleClass("has-error", !isValid);

    if (this.isValid !== isValid) {
        this.isValid = isValid;
        this.$el.trigger('toggle:isValid');
    }
};

function Elems (metrics) {

    var $els = $(pluck('selector', metrics).join());

    this.items = [];

    this.metrics = metrics;

    each(this.addElement.bind(this), $els);

    this.attachCheckersFromExpandedMetrics();

}

Elems.prototype.add = function (element) {
    var elem = this.addElement(element);
    if (elem) {
        this.attachCheckersFromExpandedMetrics([elem]);
        return elem;
    }
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

Elems.prototype.removeElement = function (el) {
    // find the element in the items list
    var item = find(compose(eq(el), dot('el')), this.items);
    if (!item) return;
    // remove any (in)valid text
    item.textHolder.remove();
    // make sure everything in nod considers the field valid
    item.checks = [function() {return true;}];
    item.$el.trigger('change');
    item.group.removeClass('has-success');
    // remove it from the list of items
    var index = findIndex(item, this.items);
    if (index > -1) this.items.splice(index, 1);
    return el;
};

Elems.prototype.expandMetrics = map(function (metric) {
    if (typeof metric.validate === 'string') {
        metric.validate = [metric.validate];
        metric.errorText = [metric.errorText];
    }
    return {
        $els: $(metric.selector),
        checks: map(Checker, metric.validate),
        validate: metric.validate,
        validText: metric.validText,
        errorTexts: metric.errorText
    };
});

Elems.prototype.attachCheckersFromExpandedMetrics = function (newItems) {
    var attachChecker = this.attachChecker,
        items = newItems || this.items;

    each(function (expandedMetric) {
        expandedMetric.$els.each(function () {
            var item = find(compose(eq(this), dot('el')), items);
            if (item) {
                attachChecker(expandedMetric, item);
                item.attachListeners();
            }
        });
    }, this.expandMetrics(this.metrics));
};

Elems.prototype.attachChecker = function (expandedMetric, item) {
    for (var i = 0; i < expandedMetric.checks.length; i++) {
        item.addCheck(expandedMetric.checks[i], expandedMetric.errorTexts[i]);
    }
    item.setValidText(expandedMetric.validText);
    item.addValidate(expandedMetric.validate);
};


// untested
Elems.prototype.allAreValid = function () {
    return all(compose(eq(true), dot('isValid')), this.items);
};

// Main function called by user
function nod (metrics, options) {

    var elems = new Elems(metrics);

    var submit = SubmitButton(elems, options.submitBtn);

    function addElement (el) {
        $(el).each(function () {
            var item = elems.add.call(elems, this);
            if (!item) return;
            each(attachListener, [item]);
            submit.add(el);
        });
    }

    function removeElement (el) {
        el = $(el);
        el.each(function () { elems.removeElement(this); });
        el.off();
    }

    return {
        add         : addElement,
        remove      : removeElement,
        checkers    : checkers,
        allValid    : elems.allAreValid.bind(elems)
    };

}

nod.checkers = checkers;


window.nod = nod;
}(window));