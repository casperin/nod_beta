function Form (elems, form) {
    var $form = $(form);

    $form.on('submit.nod', function (event) {
        if(!elems.allAreValid()) {
            event.preventDefault();
            elems.firstInputWithError().trigger('change').focus();
        }
    });

    function dispose () {
        $form.off('submit.nod');
    }

    return {
        dispose: dispose
    };
}

