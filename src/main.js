var expandMetrics = map(function (metric) { return {
    elems: $(metric.selector),
    check: Checker(metric.validate),
    validText: metric.validText,
    errorText: metric.errorText
}});

// Main function called by user
function nod (metrics) {

    elems = Elems(pluck('selector', metrics));

    metrics = expandMetrics(metrics);

    each(elems.attachCheck, metrics);

    each(attachListener, elems.items);

}





window.nod = nod;
