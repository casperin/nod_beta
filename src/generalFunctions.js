var log = console.log.bind(console);


var SPECIAL_NEEDS = ['one-of', 'all-or-none'];


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
