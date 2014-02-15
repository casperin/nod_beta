// Main function called by user
function nod (metrics, options) {

    elems = Elems(metrics);

    each(attachListener, elems.items);

    var submit = SubmitButton(options.submitBtn);


    return {
        checkers: checkers, // so users can extend as they please

        add: function (el) {
            var items = elems.addElement(el);
            each(attachListener, items);
            submit.add(el);
            return items;
        }
    };

}





window.nod = nod;
