"use strict";
(function(){


/*
  args in an array that looks like
  [ $el, ['#foo', 'presence', 'error messae'], options ]
*/
function listener (args) {

  var status      = null,             // Flag, but only used in `changeStatus`
      $el         = args[0],
      options     = args[2],
      type        = args[1][1],
      check       = makeChecker(type),
      msg         = makeMsg($el, args[1][2], options),
      getVal      = makeGetVal($el, args[1]),
      delayId     = "",               // So we're able to cancel delayed checks
      l           = {};               // The return value for `listener`


  // Events
  $el.on('keyup', delayedCheck);
  $el.on('blur change nodCheck', checkValue);
  sameAsEvent(type, delayedCheck);
  oneOfEvent(type, checkValue);


  // Calls `checkValue`
  function delayedCheck () {
    clearTimeout(delayId);
    delayId = setTimeout(checkValue, options.delay);
  }


  // Calls `check` then `changeStatus`
  function checkValue (event, clear) {
    if (clear === 'clear') {
      changeStatus(true);
    } else {
      $.when(check(getVal()))
       .done(changeStatus);
    }
  }


  // Triggers global event(s) and shows/hides msg
  function changeStatus (isCorrect) {

    try { isCorrect = eval(isCorrect); } catch (e) {}
    var isCorrect = !!isCorrect;

    if (status === isCorrect) return;
    status = isCorrect;

    msg( status );
    $(l).trigger('nodToggle', $el);
    if (type === 'one-of' && status) {
      $(window).trigger('nod-run-one-of');
    }

  }


  l.$el = $el;
  return l;

}


function makeGetVal ($el, metric) {

  switch ($el.attr('type')) {   // type of el

    case 'checkbox':
    return function () {
      return $el.is(':checked');
    }
    
    case 'radio':
    var name = $el.attr('name');
    return function () {
      return $('[name="'+name+'"]').filter(':checked').val();
    }

    default:
    if (metric[1] !== 'one-of') {
      return function () {
        return $.trim($el.val());
      };
    } else {
      var inputs = $(metric[0]);
      return function () {
        return inputs
                .map(function () { return $.trim(this.value) })
                .get()
                .join('');
      }
    }

  }
}


function sameAsEvent (m, fn) {
  if (!!(m && m.constructor && m.call && m.apply)) return
  var m = m.split(':');     // e.g., m = "same-as:#foo"
  if (m[0] === 'same-as')
    $(m[1]).on('keyup', fn)
}

function oneOfEvent (type, fn) {
  if (type === 'one-of')
    $(window).on('nod-run-one-of', fn);
}



window.listener = listener;
})();
