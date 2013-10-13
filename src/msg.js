"use strict";
(function(){


function make$Msg (text, opt) {
  return $('<span/>', {
    'html'  : text,
    'class' : opt.helpSpanDisplay + " " + opt.nodClass
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


function makeShowValidText () {
  return function () {
    console.log(1);
  }
}


function msg ($el, metrics, opt) {

  var posClass    = opt.errorPosClasses,
      $msg        = make$Msg(metrics.errorText, opt),
      showMsg     = makeShowMsg(posClass, $el),
      showValidText = makeShowValidText();

  $el.showValidText = showValidText;


  function toggle (status) { status ? $msg.remove()
                                    : showMsg($msg)
  }

  return toggle;

}

window.makeMsg = msg;
})();
