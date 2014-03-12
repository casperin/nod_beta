var elems,
    form,
    config,
    defaultConfig = {
        groupSelector: '.form-group',
        groupValidClass: "has-success",
        groupErrorClass: "has-error",
        helpTextClass: 'help-block',
        helpTextClassId: 'nod-text',
        containsSelectors: ['presence-if', 'same-as', 'one-of', 'all-or-none'],
        needsToKnowSisters: ['one-of', 'all-or-none']
    };


// Main function called by user
function nod (metrics, opt) {

    config = extend(defaultConfig, opt);

    elems = new Elems(metrics);

    form = new Form();

    function addElement (el) {
        $(el).each(function () {
            var item = elems.add.call(elems, this);
            if (!item) return;
            each(attachListener, [item]);
            form.add(el);
        });
    }

    function dispose () {
        elems.dispose();
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
