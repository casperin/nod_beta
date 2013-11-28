function Elems (selectors) {
    var items = [],
        initItemsFromSelectors = compose(each(initItem), $, invoke('join'));

    function initItem (elem) {
        items.push({
            el: elem,
            checks: [],
            validText: '',
            textHolder: null,
            group: null
        });
    }

    function attach (metrics, item) {
        // Checker
        item.checks.push(function (value) {
            return metrics.check(value) ? true : metrics.errorText;
        });

        // Valid text
        item.validText = metrics.validText;

        // Text holder
        var textHolder = $("<span/>", {'class':'help-block nodText'}).hide();
        $(item.el).after(textHolder);
        item.textHolder = textHolder;

        // Group
        item.group = $(item.el).parents(".form-group");
    }

    function attachCheck (metrics) {
        metrics.elems.each(function () {
            each(   attach.bind(this, metrics),
                    filter(compose(eq(this), dot('el')), items)
                );
        });
    }




    // Action!
    initItemsFromSelectors(selectors);

    return {
        items       : items,
        attachCheck : attachCheck
    };
}
