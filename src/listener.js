// args is an object containing the element, the metric and the options
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


