"use strict";
(function(){


function make$Msg (msg, cls) {
  return $('<span/>',{
    'html'  : msg,
    'class' : cls
  });
}


function elHasClass (posClass, dir, $el) {
  var hasCls = false;
  each(function (sel) {
    if ($el[dir](sel).length) hasCls = true;
  }, posClass);
  return hasCls;
}


function findPosition (posClass, $el) {
  if (elHasClass(posClass, 'parent', $el))
    return findPosition(posClass, $el.parent());
  if (elHasClass(posClass, 'next',   $el))
    return findPosition(posClass, $el.next());
  return $el;
}


function makeShowMsg (posClass, $el) {
  var type = $el.attr('type');
  if (type === 'checkbox' || type === 'radio') {
    return function (msg) {
      $el.parent().append(msg);
    }
  } else {
    var pos = findPosition(posClass, $el);
    return function (msg) {
      pos.after(msg);
    }
  }
}


function msg ($el, metrics, options) {

  var msgClass    = options.helpSpanDisplay + " " + options.nodClass,
      posClass    = options.errorPosClasses,
      $msg        = make$Msg(metrics.errorText, msgClass),
      showMsg     = makeShowMsg(posClass, $el);


  function toggle (status) { status ? $msg.remove()     // hide msg
                                    : showMsg($msg)     // show msg
  }

  return toggle;

}

window.makeMsg = msg;
})();
