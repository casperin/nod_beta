// Main function called by user
function nod (metrics, options) {

    var elems = new Elems(metrics);

    var submit = SubmitButton(elems, options.submitBtn);

    var form = Form(elems, options.form);

    function addElement (el) {
        $(el).each(function () {
            var item = elems.add.call(elems, this);
            if (!item) return;
            each(attachListener, [item]);
            submit.add(el);
        });
    }

    function dispose () {
        elems.dispose();
        submit.dispose();
        form.dispose();
    }

    return {
        add         : addElement,
        remove      : elems.remove.bind(elems),
        checkers    : checkers,
        allValid    : elems.allAreValid.bind(elems),
        dispose     : dispose
    };

}

nod.checkers = checkers;


window.nod = nod;
