function Elems (metrics) {

    var $els = $(pluck('selector', metrics).join());

    this.items = [];

    this.expandedMetrics = this.expandMetrics(metrics);

    each(this.addElement.bind(this), $els);

    this.attachCheckersFromExpandedMetrics();

}

// Entirely untested
Elems.prototype.add = function (element) {
    var elem = this.addElement(element);
    this.attachCheckersFromExpandedMetrics(elem);
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

Elems.prototype.expandMetrics = map(function (metric) {
    if (typeof metric.validate === 'string') {
        metric.validate = [metric.validate];
        metric.errorText = [metric.errorText];
    }
    return {
        $els: $(metric.selector),
        checks: map(Checker, metric.validate),
        validate: metric.validate,
        validText: metric.validText,
        errorTexts: metric.errorText
    };
});

Elems.prototype.attachCheckersFromExpandedMetrics = function (newItem) {
    var attachChecker = this.attachChecker,
        items = newItem ? [newItem] : this.items;

    each(function (expandedMetric) {
        expandedMetric.$els.each(function () {
            var item = find(compose(eq(this), dot('el')), items);
            attachChecker(expandedMetric, item);
        });
    }, this.expandedMetrics);
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
