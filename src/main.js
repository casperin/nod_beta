// Main function called by user
function nod (metrics, options) {

    elems = Elems(metrics);

    each(attachListener, elems.items);

    var submit = SubmitButton(options.submitBtn);

    function addElement (el) {
        $(el).each(function () {
            var items = elems.addElement(this);
            if (!items) return;
            each(attachListener, items);
            submit.add(el);
        });
    }

    function removeElement (el) {
        el = $(el);
        el.each(function () { elems.removeElement(this); });
        el.off();
    }

    return {
        add         : addElement,
        remove      : removeElement,
        allValid    : elems.allAreValid
    };

}

nod.checkers = checkers;


window.nod = nod;
