function Elems (metrics) {

    var $els = $(pluck('selector', metrics).join());

    this.items = [];

    this.metrics = metrics;

    each(this.addElement.bind(this), $els);

    this.attachCheckersFromExpandedMetrics();

}

Elems.prototype.add = function (element) {
    var elem = this.addElement(element);
    if (elem) {
        this.attachCheckersFromExpandedMetrics([elem]);
        return elem;
    }
};

Elems.prototype.addElement = function (element) {
    var elem;
    // Only add element if it is not already in the list of items
    if (all(compose(neq(element), dot('el')), this.items)) {
        elem = new Elem(element);
        this.items.push(elem);
    }
    return elem;
};

Elems.prototype.removeElement = function (el) {
    // find the element in the items list
    var item = find(compose(eq(el), dot('el')), this.items);
    if (!item) return;
    // remove any (in)valid text
    item.textHolder.remove();
    // make sure everything in nod considers the field valid
    item.checks = [function() {return true;}];
    item.$el.trigger('change');
    item.group.removeClass('has-success');
    // remove it from the list of items
    var index = findIndex(item, this.items);
    if (index > -1) this.items.splice(index, 1);
    return el;
};

Elems.prototype.expandMetrics = map(function (metric) {
    if (typeof metric.validate === 'string') {
        metric.validate = [metric.validate];
        metric.errorText = [metric.errorText];
    }

    var validates = map(function (valid) {
            return any(eq(valid), ['one-of', 'all-or-none']) ? valid + ":" + metric.selector : valid;
        }, metric.validate),

        checks = map(function (validate) {
            return Checker(validate, metric.selector);
        }, validates);


    return {
        $els: $(metric.selector),
        checks: checks,
        validate: validates,
        validText: metric.validText,
        errorTexts: metric.errorText
    };
});

Elems.prototype.attachCheckersFromExpandedMetrics = function (newItems) {
    var attachChecker = this.attachChecker,
        items = newItems || this.items;

    each(function (expandedMetric) {
        expandedMetric.$els.each(function () {
            var item = find(compose(eq(this), dot('el')), items);
            if (item) {
                attachChecker(expandedMetric, item);
                item.attachListeners();
            }
        });
    }, this.expandMetrics(this.metrics));
};

Elems.prototype.attachChecker = function (expandedMetric, item) {
    for (var i = 0; i < expandedMetric.checks.length; i++) {
        item.addCheck(expandedMetric.checks[i], expandedMetric.errorTexts[i]);
    }
    item.setValidText(expandedMetric.validText);
    item.addValidate(expandedMetric.validate);
};


// untested
Elems.prototype.allAreValid = function () {
    return all(compose(eq(true), dot('isValid')), this.items);
};
