function SubmitButton (elems, selector) {
    var btn = $(selector);

    function listenTo ($el) {
        $el.on('toggle:isValid', toggleBtn);
    }

    function toggleBtn () {
        var errors = !elems.allAreValid();
        //log(errors);
        btn.prop('disabled', errors).toggleClass('disabled', errors);
    }

    // Listen to each element and enable/disable submit button
    each(compose(listenTo, dot('$el')), elems.items);

    // Toggle button from the beginning
    toggleBtn();

    return {
        add: listenTo
    };
}
