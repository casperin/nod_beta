function Form (elems, form) {
    $(form).on('submit', function (event) {
        if(!elems.allAreValid()) {
            event.preventDefault();
            elems.firstInputWithError().trigger('change').focus();
        }
    });
}

