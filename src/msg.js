"use strict";
(function(){

// TODO: Show valid text

// Main function that is returned
function msg ($el, metrics, opt) {

  var posClass    = opt.errorPosClasses,
      $msg        = make$Msg(metrics.errorText, opt.helpSpanDisplay, opt.nodClass),
      showMsg     = makeShowMsg(posClass, $el),
      showValidText = makeShowValidText(opt);

  $el.showValidText = showValidText;


  function toggle (status) { status ? $msg.remove()
                                    : showMsg($msg)
  }

  return toggle;

}



function make$Msg (text, display, cls) {
  return $('<span/>', {
    'html'  : text,
    'class' : display + " " + cls
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


function makeShowValidText (opt) {
    return function () {
        console.log(opt);
    }
}


window.makeMsg = msg;
})();
