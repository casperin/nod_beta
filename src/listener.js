//+ runCheck :: item -> event -> dom side effects
function runCheck (item) {
    return function (ev) {

        var isValid = item.validateElement(),

            // The text displayed will be either the first item in the results
            // that aren't `true` (errorText), or the item's single `validText`
            nodText = head(filter(neq(true), item.getResults())) || item.validText;

        // Set text in textHolder, and update the class of its group
        if (nodText !== undefined) {
            item.textHolder.html(nodText).fadeIn();
        } else {
            item.textHolder.hide();
        }
        item.group
            .toggleClass("has-success", isValid)
            .toggleClass("has-error", !isValid);

        if (item.isValid !== isValid) {
            item.isValid = isValid;
            $(item.el).trigger('toggle:isValid');
        }
    }
}

function listenTo (item, selector) {
    $(selector)
        .on('keyup', debounce(runCheck(item), 700))
        .on('change blur', runCheck(item));
}

function attachListener (item) {

    // Listen to changes of its own element
    listenTo(item, item.el);

    // Prepare special case(s)
    var validates_list = map(function(validateText) {
            return validateText.split(":");
        }, item.validates);

    // Listen to the selector in "same-as" validates
    each(   compose(listenTo.bind(null, item), last),
            filter(compose(eq("same-as"), head), validates_list));

}


