;(function(window, undefined){
'use strict';// args is an object containing the element, the metric and the options
function newListener (args) {

    var status      = null,             // Flag, but only used in `changeStatus`
        $el         = args.$el,
        validate    = args.metric.validate,
        check       = new Checker(validate),
        msg         = new Msg($el, args.metric, args.options),
        getVal      = new GetVal($el, args.metric),
        delayId     = "",               // So we're able to cancel delayed checks
        l           = {$el:$el};        // The return value for `listener`


    // Events
    $el.on('keyup', delayedCheck);
    $el.on('blur change nodCheck', checkValue);
    sameAsEvent(validate, delayedCheck);
    oneOfEvent(validate, checkValue);


    // Calls `checkValue`
    function delayedCheck () {
        clearTimeout(delayId);
        delayId = setTimeout(checkValue, args.options.delay);
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
        isCorrect = !!isCorrect;

        if (status === isCorrect) return;
        status = isCorrect;

        msg( status );
        $(l).trigger('nodToggle', [$el, $el.showValidText]);
        if (validate === 'one-of' && status) {
            $(window).trigger('nod-run-one-of');
        }

    }

    return l;

}


function GetVal ($el, metric) {

    switch ($el.attr('type')) {   // type of el

        case 'checkbox':
            return function () {
                return $el.is(':checked');
            };

        case 'radio':
            var name = $el.attr('name');
            return function () {
                return $('[name="'+name+'"]').filter(':checked').val();
            };

        default:
            if (metric[1] !== 'one-of') {
                return function () {
                    return $.trim($el.val());
                };
            } else {
                var inputs = $(metric[0]);
                return function () {
                    return inputs
                        .map(function () { return $.trim(this.value); })
                        .get()
                        .join('');
                };
            }

    }
}


function sameAsEvent (m, fn) {
    if (!!(m && m.constructor && m.call && m.apply)) return;
        m = m.split(':');     // e.g., m = "same-as:#foo"
    if (m[0] === 'same-as')
        $(m[1]).on('keyup', fn);
}

function oneOfEvent (validate, fn) {
    if (validate === 'one-of')
        $(window).on('nod-run-one-of', fn);
}



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


// Once created (when nod() is called), these should be consdered immutable
var metrics,
    options,
    $els,
    listeners,
    defaultOptions = {
        'form'              : null,
        'submitBtn'         : null,
        'delay'             : 700,
        'helpSpanDisplay'   : 'help-inline',
        'errorClass'        : 'error',
        'errorPosClasses'   : [
            '.help-inline',
            '.add-on',
            'button',
            '.input-append'
        ],
        'silentSubmit'      : false,
        'broadcastError'    : false,
        'nodClass'          : 'nodMsg',
        'successClass'      : '',
        'groupSelector'     : '.control-group'
    };


// This fn prepares everything to create a listener.
// Returns a list of objects. The length of the list
// determines the number of listeners
var getListenerArgs = foldl(function (result, metric) {
    $(metric.selector).each(function(){
        result.push({
            $el     : $(this),
            metric  : metric,
            options : options
        });
    });
    return result;
}, []);


var get$Els = compose($, unique, map(dot('selector')));


function elsHaveErrors (els) {
    els = els ? $(els) : $els;
    var err = false;
    els.each(function () {
        if (elHasErrors(this)) err = true;
    });
    return err;
}


function getGroup (el) {
    return $(el).parents(options.groupSelector);
}


function groupHasErrors (group) {
    return !empty(group.find('.' + options.nodClass));
}


var elHasErrors = compose(groupHasErrors, getGroup);


var toggleSubmit;
function ToggleSubmit (sel) {
    if (!sel) return function(){};
    var $btn = $(sel);

    return function (onoff) {
        switch (onoff) {
            case 'on' : return disableSubmit($btn, false);
            case 'off': return disableSubmit($btn, true);
            default   : return disableSubmit($btn, elsHaveErrors());
        }
    };
}

function disableSubmit ($btn, bool) {
    $btn.toggleClass('disabled', bool).prop('disabled', bool);
}


function toggleGroupClass (event, args) {
    var el            = args[0],
        valid         = args[1],
        group         = getGroup(el),
        hasErr        = groupHasErrors(group);
    group.toggleClass(options.errorClass,    hasErr)
         .toggleClass(options.successClass, !hasErr);
    if (!hasErr) args.showValidText();
}


function attachEvents (ev, fns) {
    return function(el) {
        each(function(fn){ $(el).on(ev, fn); }, fns);
    };
}


// main function called by the user
function nod (met, opt) {
    if (!met || empty(met)) return;

    metrics           = met;
    options           = extend(defaultOptions, opt);
    $els              = get$Els(metrics);
    listeners         = map(newListener, getListenerArgs(metrics));
    toggleSubmit      = new ToggleSubmit(options.submitBtn);

    each(attachEvents('nodToggle', [toggleSubmit, toggleGroupClass]), listeners);

    return {
        toggleSubmit  : toggleSubmit
    };
}


window.nod = nod;
}(window));