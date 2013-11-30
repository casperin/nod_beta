function Elems (selectors) {
    var items = [],
        initItemsFromSelectors = compose(each(initItem), $, invoke('join'));

    function initItem (elem) {
        items.push({
            el: elem,
            isValid: null,
            checks: [],
            validText: '',
            textHolder: $("<span/>", {'class':'help-block nodText'}).hide(),
            group: null,
            getValue: makeGetValue(elem),
            validate: null,
            getResults: null
        });
    }

    function attach (metrics, item) {
        // Checker
        item.checks.push(function (value) {
            return metrics.check(value) ? true : metrics.errorText;
        });

        // Valid text
        item.validText = metrics.validText;

        // Group
        item.group = $(item.el).parents(".form-group");

        // Text holder
        insertEmptyTextHolder(item, item.group, item.textHolder);

        // Create a function to validate the item
        item.validate = validate.bind(null, item);

        item.getResults = getResults.bind(null, item);

        // Settings it's initial state (`null` if it's not valid, as if it was
        // untested)
        item.isValid = item.validate() || null;

    }

    function attachCheck (metrics) {
        metrics.elems.each(function () {
            each(   attach.bind(this, metrics),
                    filter(compose(eq(this), dot('el')), items)
                );
        });
    }

    function insertEmptyTextHolder(item, group, textHolder) {
        // First check if it's a radio button, and if we already have a
        // textHolder we can use
        var previousTextHolder  = $(group).find('.nodText'),
            type                = $(item.el).attr('type');
        if (type === 'radio' && previousTextHolder.length) {
            item.textHolder = previousTextHolder;
            return;
        }

        if (type === 'checkbox' || type === 'radio') {
            $(group).append(textHolder);
        } else {
            $(item.el).after(textHolder);
        }
    }

    function validate (item) {
        return all(eq(true), map(fnOf(item.getValue()), item.checks));
    }

    function getResults (item) {
        return map(fnOf(item.getValue()), item.checks);
    }

    function makeGetValue (elem) {
        var $el = $(elem);
        if ($el.attr('type') === 'checkbox') {
            return function() { return $el.is(':checked'); };
        } else {
            return function() { return $.trim($el.val()); };
        }
    }


    // Checks if all elements are valid
    function allAreValid () {
        return all(compose(eq(true), dot('isValid')), items);
    }


    // Initialize items
    initItemsFromSelectors(selectors);

    return {
        items       : items,
        attachCheck : attachCheck,
        allAreValid : allAreValid,
    };
}
