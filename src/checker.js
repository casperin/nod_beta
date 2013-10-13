"use strict";
(function(){

  function checker (m) {

    // User defined function for checking the validity of the input
    if (!!(m && m.constructor && m.call && m.apply)) {
      return m;
    }


    if (m instanceof RegExp) {
      return function (value) {
        return m.test(value);
      }
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
      }

      case 'min-length':
      return function (value) {
        return value.length >= +arg;
      };

      case 'max-length':
      return function (value) {
        return value.length <= +arg;
      }

      case 'exact-length':
      return function (value) {
        return value.length === +arg;
      }

      case 'between':
      return function (value) {
        return value.length >= +arg && value.length <= +sec;
      }

      case 'integer':
      return function (value) {
        return /^\s*\d+\s*$/.test(value);
      }

      case 'min-num':
      return function (value) {
        return +value >= +arg;
      }

      case 'max-num':
      return function (value) {
        return +value <= +arg;
      }

      case 'between-num':
      return function (value) {
        return +value >= +arg && +value <= +sec;
      }

      case 'float':
      return function (value) {
        return /^[-+]?[0-9]+(\.[0-9]+)?$/.test(value);
      }

      case 'email':
      return function (value) {
        var RFC822 = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
        return RFC822.test(value);
      }

      default:
      throw new Error('I don\'t know how to check for: ' + type);

    }

  }

  window.makeChecker = checker;

})();
