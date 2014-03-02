function Elems (metrics) {

    var $els = compose($, invoke('join'), pluck('selector'))(metrics);

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
    return {
        $els: $(metric.selector),
        check: Checker(metric.validate),
        validate: metric.validate,
        validText: metric.validText,
        errorText: metric.errorText
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
    item.addCheck(expandedMetric.check, expandedMetric.errorText);
    item.setValidText(expandedMetric.validText);
    item.addValidate(expandedMetric.validate);
};


// untested
Elems.prototype.allAreValid = function () {
    return all(compose(eq(true), dot('isValid')), this.items);
};
