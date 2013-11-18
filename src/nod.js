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
