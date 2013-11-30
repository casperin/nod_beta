function SubmitButton (selector) {
    if (!selector) return;

    var btn = $(selector);

    function listenTo (item) {
        $(item.el).on('toggle:isValid', toggleBtn);
    }

    function toggleBtn () {
        var bool = !elems.allAreValid();
        btn.prop('disabled', bool).toggleClass('disabled', bool);
    }

    // Listen to each element and enable/disable submit button
    each(listenTo, elems.items);

    // Toggle button from the beginning
    toggleBtn();
}
