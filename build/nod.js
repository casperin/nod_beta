;(function(window, undefined){
'use strict';function log () {
    console.log(arguments);
    return (arguments[0]);
}

var invoke = autoCurry(function (method, obj) {
        return obj[method]();
    }),

    pluck = autoCurry(function (prop, arr) {
        var result = [], i = -1;
        while (++i < arr.length) {
            if (arr[i][prop])
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
    });

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

    var tmp  = m.split(':'),
        type = tmp[0],
        arg  = tmp[1],
        sec  = tmp[2];


    if (type === 'same-as' && $(arg).length !== 1) {
        throw new Error('same-as selector must target one and only one element');
    }


    switch( type ){

        case 'presence':
        case 'one-of':
            return function (value) {
                return !!value;
            };

        case 'empty':
            return function (value) {
                return value.length === 0 || !!(void 0);
            };

        case 'exact':
            return function (value) {
                return value === arg;
            };

        case 'not':
            return function (value) {
                return value !== arg;
            };

        case 'same-as':
            return function (value) {
                return value === $(arg).val();
            };

        case 'min-length':
            return function (value) {
                return value.length >= +arg;
            };

        case 'max-length':
            return function (value) {
                return value.length <= +arg;
            };

        case 'exact-length':
            return function (value) {
                return value.length === +arg;
            };

        case 'between':
            return function (value) {
                return value.length >= +arg && value.length <= +sec;
            };

        case 'integer':
            return function (value) {
                return (/^\s*\d+\s*$/).test(value);
            };

        case 'min-num':
            return function (value) {
                return +value >= +arg;
            };

        case 'max-num':
            return function (value) {
                return +value <= +arg;
            };

        case 'between-num':
            return function (value) {
                return +value >= +arg && +value <= +sec;
            };

        case 'float':
            return function (value) {
                return (/^[-+]?[0-9]+(\.[0-9]+)?$/).test(value);
            };

        case 'email':
            return function (value) {
                var RFC822 = (/^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/);
                return RFC822.test(value);
            };

        default:
            throw new Error('I don\'t know how to check for: ' + type);

    }

}


//+ fnOf :: a -> fn -> b
var fnOf = autoCurry(function (x, fn) { return fn(x); });


//+ runCheck :: item -> event -> dom side effects
function runCheck (item) {
    return function (ev) {
        var results = map(fnOf(ev.target.value), item.checks),
            isValid = all(eq(true), results),
            nodText = head(filter(neq(true), results)) || item.validText;

        item.textHolder.html(nodText).fadeIn();
        item.group
            .toggleClass("has-success", isValid)
            .toggleClass("has-error", !isValid);
    }
}

function attachListener (item) {
    $(item.el).on('keyup', runCheck(item));
}



function Elems (selectors) {
    var items = [],
        initItemsFromSelectors = compose(each(initItem), $, invoke('join'));

    function initItem (elem) {
        items.push({
            el: elem,
            checks: [],
            validText: '',
            textHolder: null,
            group: null
        });
    }

    function attach (metrics, item) {
        // Checker
        item.checks.push(function (value) {
            return metrics.check(value) ? true : metrics.errorText;
        });

        // Valid text
        item.validText = metrics.validText;

        // Text holder
        var textHolder = $("<span/>", {'class':'help-block nodText'}).hide();
        $(item.el).after(textHolder);
        item.textHolder = textHolder;

        // Group
        item.group = $(item.el).parents(".form-group");
    }

    function attachCheck (metrics) {
        metrics.elems.each(function () {
            each(   attach.bind(this, metrics),
                    filter(compose(eq(this), dot('el')), items)
                );
        });
    }




    // Action!
    initItemsFromSelectors(selectors);

    return {
        items       : items,
        attachCheck : attachCheck
    };
}

var expandMetrics = map(function (metric) { return {
    elems: $(metric.selector),
    check: Checker(metric.validate),
    validText: metric.validText,
    errorText: metric.errorText
}});

// Main function called by user
function nod (metrics) {

    elems = Elems(pluck('selector', metrics));

    metrics = expandMetrics(metrics);

    each(elems.attachCheck, metrics);

    each(attachListener, elems.items);

}





window.nod = nod;
}(window));