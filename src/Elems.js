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
            validate: validate
        });
    }

    function attach (metrics, item) {
        // Checker
        item.checks.push(function (value) {
            return metrics.check(value) ? true : metrics.errorText;
        });

        // Settings it's initial state (`null` if it's not valid, as if it was
        // untested)
        item.isValid = validate(item) || null;

        // Valid text
        item.validText = metrics.validText;

        // Group
        item.group = $(item.el).parents(".form-group");

        // Text holder
        insertEmptyTextHolder(item, item.group, item.textHolder);
    }

    function attachCheck (metrics) {
        metrics.elems.each(function () {
            each(   attach.bind(this, metrics),
                    filter(compose(eq(this), dot('el')), items)
                );
        });
    }

    function insertEmptyTextHolder(item, group, textHolder) {
        var type = $(item.el).attr('type');
        if (type === 'checkbox' || type === 'radio') {
            // Check for other textHolders in the same position.
            // Radio buttons share textHolders
            var previousTextHolder = $(group).find('.nodText');
            if (previousTextHolder.length) {
                item.textHolder = previousTextHolder;
            } else {
                $(group).append(textHolder);
            }
        } else {
            $(item.el).after(textHolder);
        }
    }

    function allAreValid () {
        return all(compose(eq(true), dot('isValid')), items);
    }

    function validate (item) {
        return all(eq(true), map(fnOf(item.getValue()), item.checks));
    }

    function makeGetValue (elem) {
        var $el = $(elem);
        if ($el.attr('type') === 'checkbox') {
            return function() {
                return $el.is(':checked');
            };
        } else {
            return function() {
                return $.trim($el.val());
            };
        }
    }



    // Initialize items
    initItemsFromSelectors(selectors);

    return {
        items       : items,
        attachCheck : attachCheck,
        allAreValid : allAreValid
    };
}
