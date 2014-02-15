;(function(window, undefined){
'use strict';function log () {
    console.log(arguments);
    return (arguments[0]);
}


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
            items.hasOwnProperty(key) && fn(items[key]);
        }
        return items;
    }),

    map = autoCurry(function (fn, items) {
        if (items.map) return items.map(fn);
        if (items.length === +items.length) {
          var result = [], i = -1;
          while (++i < items.length)
            result.push(fn(items[i]));
          return result;
        } else {
          var result = {};
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

    eq = autoCurry(function (x, y) {
        return y === x;
    }),

    neq = autoCurry(function (x, y) {
        return y !== x;
    }),

    filter = autoCurry(function (fn, items) {
        if (items.filter) return items.filter(fn);
        if (items.length === +items.length) {
          var result = [], i = -1;
          while (++i < items.length)
            fn(items[i]) && result.push(items[i]);
          return result;
        } else {
          var result = {};
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
  },
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
            return regexps["int"].test(value);
        };
    },

    'float': function () {
        return function (value) {
            return regexps["float"].test(value);
        };
    },

    'email': function () {
        return function (value) {
            return regexps["email"].test(value);
        };
    }
};

// These checkers share their checking functions
checkers["one-of"] = checkers["presence"];
checkers["all-or-none"] = checkers["presence"];

// Backwards compatability
checkers["min-length"] = checkers["min-num"] = checkers["min"];
checkers["max-length"] = checkers["max-num"] = checkers["max"];
checkers["between-length"] = checkers["between-num"] = checkers["between"];

var regexps = {
    "int" : /^\s*\d+\s*$/,
    "float" : /^\s*[-+]?[0-9]+(\.[0-9]+)\s*?$/,
    // email regexp follows RFC822
    "email" : /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/
}

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

        var isValid = item.validateElement(),

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
    }
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



function Elems (metrics) {
    var items = [],

        initItemsFromSelectors = compose(each(initItem), $, invoke('join')),

        expandMetrics = map(function (metric) { return {
            elems: $(metric.selector),
            check: Checker(metric.validate),
            validate: metric.validate,
            validText: metric.validText,
            errorText: metric.errorText
        }});

    function initItem (elem) {
        var item = {
            el: elem,                       // Original element
            isValid: null,                  // Boolean flag
            checks: [],                     // List of functions to check value
            validText: '',                  // Only one valid text per element
            // Empty container to put (in)valid texts into
            textHolder: $("<span/>", {'class':'help-block nodText'}).hide(),
            group: null,                    // Parent group of the element
            getValue: makeGetValue(elem),   // Function that gets the value
            validates: [],                  // List of original texts from user
            validateElement: null,       // Function that runs each fn in checks
            getResults: null                // Gets the (in)valid text msg
        };
        items.push(item);
        return item;
    }

    // "Copies" over attributes from extended metrics to the item
    function attach (metrics, item) {
        // Checker (the function to check vaues)
        item.checks.push(function (value) {
            return metrics.check(value) ? true : metrics.errorText;
        });

        // Valid text
        item.validText = metrics.validText;

        // Group
        item.group = $(item.el).parents(".form-group");

        // Text holder
        // (The empty element we used to insert (in)valid texts)
        insertEmptyTextHolder(item, item.group, item.textHolder);

        // Original text from the user (used by listeners to determine if this
        // elements needs to listen to other elements for instance)
        item.validates.push(metrics.validate);

        // Create a function to validate the item
        item.validateElement = validateElement.bind(null, item);

        item.getResults = getResults.bind(null, item);

        // Settings it's initial state (`null` if it's not valid, as if it was
        // untested)
        item.isValid = item.validateElement() || null;

    }

    function attachCheck (items, metrics) {
        // For each $el in the expanded metrics...
        metrics.elems.each(function () {
            // Find its correspondent element(s) in items here
            var sameItems = filter(compose(eq(this), dot('el')), items);
            // Attach the attributes from the metrics to the element(s)
            each(attach.bind(this, metrics), sameItems);
        });
        return items;
    }

    function insertEmptyTextHolder(item, group, textHolder) {
        // First check if it's a radio button, and if we already have a
        // textHolder we can use
        var previousTextHolder  = $(group).find('.nodText'),
            type                = $(item.el).attr('type');
        if (type === 'radio' && previousTextHolder.length) {
            item.textHolder = previousTextHolder;
            return;
        }

        if (type === 'checkbox' || type === 'radio') {
            $(group).append(textHolder);
        } else {
            $(item.el).after(textHolder);   // normal input fields
        }
    }

    // Fetches the elments' value and returns `true` if it passes all its
    // checkers
    function validateElement (item) {
        return all(eq(true), map(fnOf(item.getValue()), item.checks));
    }

    function getResults (item) {
        return map(fnOf(item.getValue()), item.checks);
    }

    function makeGetValue (elem) {
        var $el = $(elem);
        if ($el.attr('type') === 'checkbox') {
            return function() { return $el.is(':checked'); };
        } else {
            return function() { return $.trim($el.val()); };
        }
    }


    // Checks if all elements are valid
    function allAreValid () {
        return all(compose(eq(true), dot('isValid')), items);
    }


    // Initialize items
    initItemsFromSelectors(pluck('selector', metrics));
    each(attachCheck.bind(this, items), expandMetrics(metrics));


    function addElement (el) {
        var items = [initItem($(el)[0])];
        each(attachCheck.bind(this, items), expandMetrics(metrics));
        return items;
    }


    return {
        items       : items,
        allAreValid : allAreValid,
        addElement  : addElement
    };
}

// Main function called by user
function nod (metrics, options) {

    elems = Elems(metrics);

    each(attachListener, elems.items);

    var submit = SubmitButton(options.submitBtn);


    return {
        checkers: checkers, // so users can extend as they please

        add: function (el) {
            var items = elems.addElement(el);
            each(attachListener, items);
            submit.add(el);
            return items;
        }
    };

}





window.nod = nod;
}(window));