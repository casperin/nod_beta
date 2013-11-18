// TODO: Show valid text

// Main function that is returned
function Msg ($el, metrics, opt) {

    var posClass        = opt.errorPosClasses,
        $msg            = new $Msg(metrics.errorText, opt.helpSpanDisplay, opt.nodClass),
        showMsg         = new ShowMsg(posClass, $el),
        showValidText   = newShowValidText(opt);

    $el.showValidText   = showValidText;


    function toggle (status) {
        if (status)
            $msg.remove();
        else
            showMsg($msg);
    }

    return toggle;

}



function $Msg (text, display, cls) {
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


function ShowMsg (posClass, $el) {
    var type = $el.attr('type');
    if (type === 'checkbox' || type === 'radio') {
        return function (msg) {
            $el.parent().append(msg);
        };
    } else {
        var pos = findPosition(posClass, $el);
        return function (msg) {
            pos.after(msg);
        };
    }
}


function newShowValidText (opt) {
    return function () {
        console.log(opt);
    };
}

