//+ runCheck :: item -> event -> dom side effects
function runCheck (item) {
    return function (ev) {

            // We loop through each function that checks the field
        var results = map(fnOf(item.getValue()), item.checks),

            // If all returns `true`, then it is valid
            //isValid = all(eq(true), results),
            isValid = item.validate(),

            // The text displayed will be either the first item in the results
            // that aren't `true` (errorText), or the item's single `validText`
            nodText = head(filter(neq(true), results)) || item.validText;

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

function attachListener (item) {
    $(item.el)
        .on('keyup', debounce(runCheck(item), 700))
        .on('change blur', runCheck(item));
}


