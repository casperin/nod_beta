function SubmitButton (elems, selector) {
    var btn = $(selector),
        $els = [];

    function listenTo ($el) {
        $els.push( $el.on('toggle:isValid', toggleBtn) );
    }

    function toggleBtn () {
        var errors = !elems.allAreValid();
        //log(errors);
        btn.prop('disabled', errors).toggleClass('disabled', errors);
    }

    function dispose () {
        each(function ($el) { $el.off('toggle:isValid'); }, $els);
        btn.prop('disabled', false).toggleClass('disabled', false);
    }

    // Listen to each element and enable/disable submit button
    each(compose(listenTo, dot('$el')), elems.items);

    // Toggle button from the beginning
    toggleBtn();

    return {
        add: listenTo,
        dispose: dispose
    };
}
