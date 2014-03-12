function Form (opt) {

    this.$form = $(config.form);

    this.$submit = $(config.submitBtn);

    this.$els = [];

    this.formListener();

    // Listen to each element and enable/disable submit button
    each(compose(this.add, dot('$el')).bind(this), elems.items);

    // Toggle button from the beginning
    this.toggleBtn();
}

Form.prototype.add = function ($el) {
    this.$els.push( $el.on('toggle:isValid', this.toggleBtn.bind(this)) );
};

Form.prototype.toggleBtn = function () {
    var errors = !elems.allAreValid();
    this.$submit.prop('disabled', errors).toggleClass('disabled', errors);
};


Form.prototype.formListener = function () {
    this.$form.on('submit.nod', function (event) {
        if(!elems.allAreValid()) {
            event.preventDefault();
            elems.firstInputWithError().trigger('change').focus();
        }
    });
};


// Dispose everything (removes listeners)
Form.prototype.dispose = function () {
    this.$form.off('submit.nod');

    each(function ($el) { $el.off('toggle:isValid'); }, this.$els);

    this.$submit
        .prop('disabled', false)
        .toggleClass('disabled', false);
};
