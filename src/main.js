// Main function called by user
function nod (metrics, options) {

    elems = Elems(metrics);

    each(attachListener, elems.items);

    var submit = SubmitButton(options.submitBtn);


    return {
        add: function (el) {
            var items = elems.addElement(el);
            each(attachListener, items);
            submit.add(el);
            return items;
        }
    };

}

nod.checkers = checkers;


window.nod = nod;
