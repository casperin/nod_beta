// Main function called by user
function nod (metrics, options) {

    var elems = new Elems(metrics);

    var submit = SubmitButton(elems, options.submitBtn);

    function addElement (el) {
        $(el).each(function () {
            var item = elems.add.call(elems, this);
            if (!item) return;
            each(attachListener, [item]);
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
        checkers    : checkers,
        allValid    : elems.allAreValid.bind(elems)
    };

}

nod.checkers = checkers;


window.nod = nod;
