"use strict";


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


function id(x){ return x }


function isType(type, x){
  var type = type.toLowerCase();
  function main(x_) {
    var t = typeof x_;
    if (type === 'object')
      return (t === 'object') && (x_.length !=  +x_.length);
    if (type === 'array' )
      return (t === 'object') && (x_.length === +x_.length);
    return (type === t);
  }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function replicate(n, x){
  function main(x_){
    var result = [];
    while (n--) result.push(x_);
    return result;
  }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function dot(prop, obj){
  function main(obj_){
    return obj_[prop];
  }
  if (arguments.length >= 2) return main(obj);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function pluck(prop, arr){
  function main(arr_){
    var result = [], i = -1;
    while (++i < arr_.length) {
      if (arr_[i][prop])
        result.push(arr_[i][prop]);
    }
    return result;
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function each(fn, items){
  function main(items_){
    if (items_.forEach) return items_.forEach(fn);
    if (items_.length === +items_.length) {
      var i = -1;
      while (++i < items_.length)
        fn(items_[i]);
    } else {
      for (var key in items_)
        items_.hasOwnProperty(key) && fn(items_[key]);
    }
    return items_;
  }
  if (arguments.length >= 2) return main(items);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}



function map(fn, items){
  function main(items_){
    if (items_.map) return items_.map(fn);
    if (items_.length === +items_.length) {
      var result = [], i = -1;
      while (++i < items_.length)
        result.push(fn(items_[i]));
      return result;
    } else {
      var result = {};
      for (var key in items_)
        if (items_.hasOwnProperty(k)) result[key] = fn(items_[key]);
      return result;
    }
  }
  if (arguments.length >= 2) return main(items);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function filter(fn, items){
  function main(items_){
    if (items_.filter) return items_.filter(fn);
    if (items_.length === +items_.length) {
      var result = [], i = -1;
      while (++i < items_.length)
        fn(items_[i]) && result.push(items_[i]);
      return result;
    } else {
      var result = {};
      for (var key in items_) {
        if (items_.hasOwnProperty(key) && fn(items_[key]))
          result[key] = items_[key];
      }
      return result;
    }
  }
  if (arguments.length >= 2) return main(items);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function reject(fn, items){
  function main(items_){
    if (items_.reject) return items_.reject(fn);
    if (items_.length === +items_.length) {
      var result = [], i = -1;
      while (++i < items_.length)
        !fn(items_[i]) && result.push(items_[i]);
      return result;
    } else {
      var result = {};
      for (var key in items_) {
        if (items_.hasOwnProperty(key) && !fn(items_[key]))
          result[key] = items_[key];
      }
      return result;
    }
  }
  if (arguments.length >= 2) return main(items);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function partition(fn, items){
  function main(items_){
    if (items_.length === +items_.length) {
      var a = [], b = [], i = -1;
      while (++i < items_.length)
        fn(items_[i]) ? a.push(items_[i]) : b.push(items_[i]);
      return [a, b];
    } else {
      var a = {}, b = {};
      for (var k in items_) {
        if (items_.hasOwnProperty(key))
          fn(items_[key]) ? a[key] = items_[key] : b[key] = items_[key];
      }
      return [a, b];
    }
  }
  if (arguments.length >= 2) return main(items);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function find(fn, items){
  function main(items_){
    var len = items_.length;
    if (len === +len) {
      var i = -1;
      while (++i < len)
        if (fn(items_[i])) return items_[i];
    } else {
      for (var key in items_) {
        if (items_.hasOwnProperty(key) && fn(items_[key])) 
          return items_[key];
      }
    }
  }
  if (arguments.length >= 2) return main(items);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function compact(items){
  if (items.length === +items.length) {
    var result = [], i = -1;
    while (++i < items.length) {
      items[i] && result.push(items[i]);
    }
    return result;
  } else {
    result = {};
    for (var key in items){
      if (items[key]) result[key] = items[key];
    }
    return result;
  }
}


function remove(x, arr){
  function main(arr_){
    var result = [], i = -1, found = false;
    while(++i < arr_.length){
      arr_[i] === x && !found
        ? found = true
        : result.push(arr_[i])
    }
    return result;
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function removeBy(fn, arr){
  function main(arr_){
    var result = [], i = -1, found = false;
    while(++i < arr_.length){
      fn(arr_[i]) && !found
        ? found = true
        : result.push(arr_[i])
    }
    return result;
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function head(arr){ return arr[0]; }
function tail(arr){ return arr.slice(1); }
function last(arr){ return arr[arr.length-1]; }
function initial(arr){ return arr.slice(0,arr.length-1); }



function take(n, arr){
  function main(arr_){
    var result = [], i = -1;
    while (++i < n)
      arr_[i] && result.push(arr_[i]);
    return result;
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function slice(n, m, arr){
  function main(n_, m_, arr_){
    var result = [], i = n_-1;
    while (i++ < m_)
      arr_[i] && result.push(arr_[i]);
    return result;
  }
  var args = arguments;
  function collectArgs() {
    Array.prototype.push.apply(args, arguments);
    return args.length >= main.length
      ? main.apply(null, args)
      : collectArgs
  }
  return collectArgs();
}



function drop(n, arr){
  function main(arr_){
    var result = [], i = n-1;
    while (++i < arr_.length)
      result.push(arr_[i]);
    return result;
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}



function takeWhile(fn, arr){
  function main(arr_){
    var result = [], i = -1;
    while (++i < arr_.length) {
      if (fn(arr_[i]))
        result.push(arr_[i]);
      else
        break;
    }
    return result;
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function dropWhile(fn, arr){
  function main(arr_){
    var result = [], i = -1, drop = true;
    while (++i < arr_.length) {
      if (drop) {
        if (!fn(arr_[i])) drop = false, i--;
      } else {
        result.push(arr_[i]);
      }
    }
    return result;
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function span(fn, arr){
  function main(arr_){
    var a = [], b = [], i = -1,  drop = true;
    while (++i < arr_.length) {
      if (drop) {
        if (fn(arr_[i]))
          a.push(arr_[i]);
        else
          drop = false, i--;
      } else {
        b.push(arr_[i]);
      }
    }
    return [a, b];
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function breakList(fn, arr){
  function main(arr_){
    var a = [], b = [], i = -1, drop = true;
    while (++i < arr_.length) {
      if (drop) {
        if (fn(arr_[i]))
          drop = false, i--;
        else
          a.push(arr_[i]);
      } else {
        b.push(arr_[i]);
      }
    }
    return [a, b];
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}



function empty(items){
  if (items.length === +items.length)
    return items.length === 0;
  for (var key in items)
    if (items.hasOwnProperty(key)) return false;
  return true;
}


function reverse(arr){
  var result = [], i = arr.length;
  while (i--)
    result.push(arr[i]);
  return result;
}


function foldl(fn, memo, arr){
  function main(fn_, memo_, arr_){
    var i = -1;
    while (++i < arr_.length)
      memo_ = fn_(memo_, arr_[i]);
    return memo_;
  }
  var args = arguments;
  function collectArgs() {
    Array.prototype.push.apply(args, arguments);
    return args.length >= main.length
      ? main.apply(null, args)
      : collectArgs
  }
  return collectArgs();
}

function foldr(fn, memo, arr){
  function main(fn_, memo_, arr_){
    var i = arr_.length;
    while (i--)
      memo_ = fn_(memo_, arr_[i]);
    return memo_;
  }
  var args = arguments;
  function collectArgs() {
    Array.prototype.push.apply(args, arguments);
    return args.length >= main.length
      ? main.apply(null, args)
      : collectArgs
  }
  return collectArgs();
}


function concat(arr){
  var result = [], i = -1;
  while (++i < arr.length)
    Array.prototype.push.apply(result, arr[i]);
  return result;
}


// Notice: recursive
function flatten(arr){
  var result = [], i = -1;
  while (++i < arr.length) {
    result = result.concat(
      typeof arr[i] === 'object' && arr[i].length === +arr[i].length
      ? flatten(arr[i])
      : arr[i]
    );
  }
  return result;
}


function any(fn, arr){
  function main(arr_){
    var i = -1;
    while (++i < arr_.length)
      if (fn(arr_[i])) return true;
    return false;
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function all(fn, arr){
  function main(arr_){
    var i = -1;
    while (++i < arr_.length)
      if (!fn(arr_[i])) return false;
    return true;
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function sort(arr){
  return arr.slice(0).sort(function(x,y){return x-y});
}


function sortWith(fn, arr){
  function main(arr_){
    return arr_.slice(0).sort(fn);
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function sortBy(fn, arr){
  function main(arr_){
    return arr_.slice(0).sort(function(x,y){ return fn(x)-fn(y) });
  }
  if (arguments.length >= 2) return main(arr);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function unique(arr){
  var result = [], i = -1;
  while (++i < arr.length) {
    if (result.indexOf(arr[i]) === -1)
      result.push(arr[i]);
  }
  return result;
}


function difference(arr, arr2){
  function main(arr2_){
    var result = [], i = -1;
    while (++i < arr.length) {
      if (arr2_.indexOf(arr[i]) === -1)
        result.push(arr[i]);
    }
    return result;
  }
  if (arguments.length >= 2) return main(arr2);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function intersection(arr, arr2){
  function main(arr2_){
    var result = [], i = -1;
    while (++i < arr.length) {
      if (arr2_.indexOf(arr[i]) !== -1)
        result.push(arr[i]);
    }
    return result;
  }
  if (arguments.length >= 2) return main(arr2);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function union(arr, arr2){
  function main(arr2_){
    var result = Array.prototype.slice.call(arr,0),
        i = -1, diff = [], j = -1;
    while (++j < arr2_.length) {
      if (result.indexOf(arr2_[j]) === -1)
        result.push(arr2_[j]);
    }
    return result;
  }
  if (arguments.length >= 2) return main(arr2);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function length(x) { return x.length }


function sum(arr){
  var result = 0, i = -1;
  while (++i < arr.length)
    result += arr[i];
  return result;
}


function product(arr){
  if (arr.length === 0) return 0;
  var result = 1, i = -1;
  while (++i < arr.length)
    result = result * arr[i];
  return result;
}


function even(x) { return x%2 === 0 }
function odd (x) { return x%2 === 1 }


function negate(x) { return -x }
function abs(x) { return x >= 0 ? x : -x; }


function signum(x){
  if (x === 0) return 0;
  return x > 0 ? 1 : -1;
}


function quot(y, x){
  function main(x_){
    var result = y/x_
    return result > 0
      ? Math.floor(result)
      : Math.ceil(result)
  }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function rem(y, x){
  function main(x_){
    return y%x_;
  }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function div(y, x){
  function main(x_){
    return Math.floor(y/x_);
  }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function pow(x, y){
  function main(y_){
    if (y_ < 0) throw new Error('Cannot use negative exponent: ' + y_);
    var result = 1, i = -1;
    while (++i < y_) {
      result *= x;
    }
    return result;
  }
  if (arguments.length >= 2) return main(y);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function lt(n, x) {
  function main(x_){ return x_ < n; }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}
function gt(n, x) {
  function main(x_){ return x_ > n; }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}
function eq(n, x) {
  function main(x_){ return x_ === n; }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}
function neq(n, x) {
  function main(x_){ return x_ !== n; }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}
function lteq(n, x) {
  function main(x_){ return x_ <= n; }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}
function gteq(n, x) {
  function main(x_){ return x_ >= n; }
  if (arguments.length >= 2) return main(x);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function mean(arr){
  var result = 0, i = -1;
  while (++i < arr.length)
    result += arr[i];
  return result/len;
}


function maximum(arr) {
  var result = arr[0], i = -1;
  while (++i < arr.length)
    if (arr[i] > result) result = arr[i];
  return result;
}


function minimum(arr) {
  var result = arr[0], i = -1;
  while (++i < arr.length)
    if (arr[i] < result) result = arr[i];
  return result;
}


function zip(arr, arr2){
  function main(arr2_){
    var result = [], i = -1, len = Math.min(arr.length, arr2_.length);
    while (++i < len)
      result.push([arr[i], arr2_[i]]);
    return result;
  }
  if (arguments.length >= 2) return main(arr2);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function zip3(arr, arr2, arr3){
  function main(arr1_,arr2_,arr3_){
    var result = [], i = -1,
        len = Math.min(arr1_.length
                      ,arr2_.length
                      ,arr3_.length);
    while (++i < len)
      result.push([arr1_[i]
                  ,arr2_[i]
                  ,arr3_[i]]);
    return result;
  }
  var args = arguments;
  function collectArgs() {
    Array.prototype.push.apply(args, arguments);
    return args.length >= main.length
      ? main.apply(null, args)
      : collectArgs
  }
  return collectArgs();
}


function zip4(arr, arr2, arr3, arr4){
  function main(arr1_,arr2_,arr3_,arr4_){
    var result = [], i = -1,
        len = Math.min(arr1_.length
                      ,arr2_.length
                      ,arr3_.length
                      ,arr4_.length);
    while (++i < len)
      result.push([arr1_[i]
                  ,arr2_[i]
                  ,arr3_[i]
                  ,arr4_[i]]);
    return result;
  }
  var args = arguments;
  function collectArgs() {
    Array.prototype.push.apply(args, arguments);
    return args.length >= main.length
      ? main.apply(null, args)
      : collectArgs
  }
  return collectArgs();
}


function zipWith(fn, arr, arr2){
  function main(fn_, arr_, arr2_){
    var result = [], i = -1, len = Math.min(arr_.length, arr2_.length);
    while (++i < len)
      result.push( fn_(arr_[i], arr2_[i]) );
    return result;
  }
  var args = arguments;
  function collectArgs() {
    Array.prototype.push.apply(args, arguments);
    return args.length >= main.length
      ? main.apply(null, args)
      : collectArgs
  }
  return collectArgs();
}


function zipWith3(fn, arr, arr2, arr3){
  function main(fn_, arr1_, arr2_, arr3_){
    var result = [], i = -1,
        len = Math.min(arr1_.length
                      ,arr2_.length
                      ,arr3_.length);
    while (++i < len)
      result.push( fn_(arr1_[i]
                      ,arr2_[i]
                      ,arr3_[i]) );
    return result;
  }
  var args = arguments;
  function collectArgs() {
    Array.prototype.push.apply(args, arguments);
    return args.length >= main.length
      ? main.apply(null, args)
      : collectArgs
  }
  return collectArgs();
}


function zipWith4(fn, arr, arr2, arr3, arr4){
  function main(fn_, arr1_, arr2_, arr3_, arr4_){
    var result = [], i = -1,
        len = Math.min(arr1_.length
                      ,arr2_.length
                      ,arr3_.length
                      ,arr4_.length);
    while (++i < len)
      result.push( fn_(arr1_[i]
                      ,arr2_[i]
                      ,arr3_[i]
                      ,arr4_[i]) );
    return result;
  }
  var args = arguments;
  function collectArgs() {
    Array.prototype.push.apply(args, arguments);
    return args.length >= main.length
      ? main.apply(null, args)
      : collectArgs
  }
  return collectArgs();
}


function keys(obj){
  var result = [];
  for (var key in obj)
    obj.hasOwnProperty(key) && result.push(key);
  return result;
}


function values(obj){
  var result = [];
  for (var key in obj)
    obj.hasOwnProperty(key) && result.push(obj[key]);
  return result;
}


function pairsToObj(arr){
  var result = {}, i = -1;
  while (++i < arr.length)
    result[arr[i][0]] = arr[i][1];
  return result;
}


function objToPairs(obj){
  var result = [];
  for (var key in obj)
    obj.hasOwnProperty(key) && result.push([key,obj[key]]);
  return result;
}


function listsToObj(arr, arr2){
  function main(arr2_){
    var result = {}, i = -1, len = Math.min(arr.length, arr2_.length);
    while (++i < len)
      result[arr[i]] = arr2_[i];
    return result;
  }
  if (arguments.length >= 2) return main(arr2);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function objToLists(obj){
  var a = [], b = [];
  for (var key in obj)
    obj.hasOwnProperty(key) && a.push(key) && b.push(obj[key]);
  return [a, b];
}


function extend(obj, obj2){
  function main(obj2_){
    var result = {}, i = -1, objs = [obj, obj2_];
    while (++i < 2) {
      for (var key in objs[i]) {
        if (objs[i].hasOwnProperty(key))
          result[key] = objs[i][key];
      }
    }
    return result;
  }
  if (arguments.length >= 2) return main(obj2);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function extendAll( /* n objects */ ){
  var objs = Array.prototype.slice.call(arguments,0),
      result = {}, i = -1;
  while (++i < arr.length) {
    for (var key in objs[i]) {
      if (objs[i].hasOwnProperty(key))
        result[key] = objs[i][key];
    }
  }
  return result;
}


function pick(arr, obj){
  function main(obj_){
    var result = {}, i = -1;
    while (++i < arr.length) {
      if (obj_.hasOwnProperty(arr[i]))
        result[arr[i]] = obj_[arr[i]];
    }
    return result;
  }
  if (arguments.length >= 2) return main(obj);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function omit(arr, obj){
  function main(obj_){
    var result = {};
    for (var key in obj_) {
      if (obj_.hasOwnProperty(key)) {
        var i = -1, found = false;
        while (++i < arr.length) {
          if (arr[i] === key) {
            found = true;
            break;
          }
        }
        if (!found) result[key] = obj_[key];
      }
    }
    return result;
  }
  if (arguments.length >= 2) return main(obj);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}




// args must be an array of the arguments (allows currying)
function applyl(fn, args) {
  function main(args_){
    return function() {
      return fn.apply(this, args_.concat(Array.prototype.slice.call(arguments)));
    };
  }
  if (arguments.length >= 2) return main(args);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}


function applyr(fn, args) {
  function main(args_){
    return function() {
      return fn.apply(this, Array.prototype.slice.call(arguments).concat(args_));
    };
  }
  if (arguments.length >= 2) return main(args);
  if (arguments.length == 1) return main;
  throw new Error('missing arguments');
}




