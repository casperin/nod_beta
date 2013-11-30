function SubmitButton (selector) {
    if (!selector) return;

    var btn = $(selector);

    function listenTo (item) {
        $(item.el).on('toggle:isValid', toggleBtn);
    }

    function toggleBtn () {
        var errors = !elems.allAreValid();
        btn.prop('disabled', errors).toggleClass('disabled', errors);
    }

    // Listen to each element and enable/disable submit button
    each(listenTo, elems.items);

    // Toggle button from the beginning
    toggleBtn();
}
