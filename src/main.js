var expandMetrics = map(function (metric) { return {
    elems: $(metric.selector),
    check: Checker(metric.validate),
    validText: metric.validText,
    errorText: metric.errorText
}});

// Main function called by user
function nod (metrics, options) {

    elems = Elems(pluck('selector', metrics));

    each(elems.attachCheck, expandMetrics(metrics));

    each(attachListener, elems.items);

    SubmitButton(options.submitBtn);

}





window.nod = nod;
