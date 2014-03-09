function Elem (element) {

    this.el = element;

    this.$el = $(this.el);

    this.group = this.$el.parents(".form-group");

    this.textHolder = $('<span/>', {'class':'help-block nod-text'}).hide();

    this.checks = [];

    this.validText = '';

    this.isValid = null;

    this.validates = [];

    this.getValue = this.makeGetValue();


    // Add the text holder into the dom
    this.addTextHolderToDom();

    //this.attachListeners();
}

Elem.prototype.makeGetValue = function () {
    if (this.$el.attr('type') === 'checkbox') {
        return function() { return this.$el.is(':checked'); };
    } else {
        return function() { return $.trim(this.el.value); };
    }
};

Elem.prototype.validate = function () {
    return all(eq(true), this.getResults());
};

Elem.prototype.getResults = function () {
    return map(fnOf(this.getValue()), this.checks);
};

// Only run as part of the constructor
Elem.prototype.addTextHolderToDom = function () {
    var previousTextHolder = this.group.find('.nod-text'),
        type = this.$el.attr('type');

    if (type === 'radio' && previousTextHolder.length) {
        this.textHolder = previousTextHolder;
    } else if (type === 'radio' || type === 'checkbox') {
        this.group.append(this.textHolder);
    } else {
        this.$el.after(this.textHolder);
    }
};



/*
 * Run from collection
 */

Elem.prototype.addCheck = function (check, errorText) {
    this.checks.push(function (value) {
        return check(value) ? true : errorText;
    });
    this.isValid = this.validate() || null;
};

Elem.prototype.setValidText = function (validText) {
    this.validText = validText;
};

// String from user metrics such as 'exact-length:2'
Elem.prototype.addValidate = function (validate) {
    this.validates = this.validates.concat(validate);
};




Elem.prototype.attachListeners = function () {
    this.listenTo(this.$el);

    var contains_selectors = ['presence-if', 'same-as', 'one-of', 'all-or-none'],

        val_list = foldl(function (memo, validate) {
            var v_arr = validate.split(':');
            if (any(eq(v_arr[0]), contains_selectors)) {
                memo.push($(v_arr[1]));
            }
            return memo;
        }, [], this.validates);

    each(this.listenTo.bind(this), val_list);

};

Elem.prototype.listenTo = function ($el) {
    var runCheck = this.runCheck.bind(this);
    $el.each(function () {
        $(this)
            .on('keyup.nod', debounce(runCheck, 700))
            .on('change.nod blur.nod', runCheck);
    });
};

Elem.prototype.runCheck = function () {
    var isValid = this.validate(),

        // The text displayed will be either the first item in the results
        // that aren't `true` (errorText), or the item's single `validText`
        nodText = head(filter(neq(true), this.getResults())) || this.validText;

    // Set text in textHolder, and update the class of its group
    if (nodText !== undefined) {
        this.textHolder.html(nodText).fadeIn();
    } else {
        this.textHolder.hide();
    }
    this.group
        .toggleClass("has-success", isValid)
        .toggleClass("has-error", !isValid);

    if (this.isValid !== isValid) {
        this.isValid = isValid;
        this.$el.trigger('toggle:isValid');
    }
};
