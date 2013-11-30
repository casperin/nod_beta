function log () {
    console.log(arguments);
    return (arguments[0]);
}

var invoke = autoCurry(function (method, obj) {
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
