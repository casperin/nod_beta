
/**
 *
 * This is a short breakdown of the code to help you find your way around.
 *
 *
 * An `element` always refer to some input element defined by the user via the
 * `selector` key.
 *
 * A `metric` is the user created objects that is used to add checks to
 * nod.
 *
 * Each `element` will have at most one of a `listener`, a `checker`, and a
 * `checkHandler` "attached" to it. The `listener` listens for inputs or
 * changes to the `element` and passes the new value on to to the `checker`
 * which performs its checks and passes the the results on to the
 * `checkHandler` which calculates the new state of the `element` and asks
 * its "helper class" called a `domNode` to update the dom.
 *
 * The three main parts, the listener, the checker, and the checkHandler
 * all communicate through the `mediator` by firing events identified by a
 * unique id.
 *
 * All listeners, checkers, and handlers are grouped together in
 * `collections`, which are basically a glorified array that makes it easy
 * not to get duplicate items for each element (for instance two listeners
 * listening to the same element).
 *
 * The communication flow looks like this:
 * listener -> mediator -> checker -> mediator -> checkHandler -> domNode
 *
 * (the two mediators are actually the same object).
 *
 *
 * `Metrics` are added by the user, which sets up the system above. Notice
 * that a metric can target multiple elements at once, and that there can
 * be overlaps. One metric definitely does not equal one element or one
 * check.
 *
 */

function nod () {
    var form,
        configuration   = {},
        mediator        = nod.makeMediator(),

        // Creating (empty) collections
        listeners       = nod.makeCollection(nod.makeListener),
        checkers        = nod.makeCollection(nod.makeChecker),
        checkHandlers   = nod.makeCollection(nod.makeCheckHandler);



    /**
     * Entry point for the user. The user passes in an array of metrics (an
     * object containing a selector, a validate string/function, etc.) and it
     * gets processed from here.
     *
     * This function, is mostly about cleaning up what the user passed us.
     */
    function addMetrics (metrics) {
        // Make sure we are dealing with an array of metrics.
        var arrayMetrics = Array.isArray(metrics) ? metrics : [metrics];

        arrayMetrics.forEach(function (metric) {

            // If the 'validate' is not an array, then we're good to go.
            if (!Array.isArray(metric.validate)) {
                addMetric(metric);

            // If it is an array (e.g., validate: ['email', 'max-length:10']),
            // then we need to split them up into multiple metrics, and add
            // them individually.
            } else {
                if (!Array.isArray(metric.errorMessage)) {
                    throw 'If you pass in `validate:...` as an array, then `errorMessage:...` also needs to be an array. "' + metric.validate + '", and "' + metric.errorMessage + '"';
                }

                metric.validate.forEach(function (_, i) {
                    addMetric({
                        selector: metric.selector,
                        validate: metric.validate[i],
                        errorMessage: metric.errorMessage[i],
                        triggeredBy: metric.triggeredBy,
                        messageContainer: metric.messageContainer
                    });
                });
            }
        });
    }


    function addMetric (metric) {

        var checkfn     = nod.getCheckFn(metric),
            sameId      = nod.unique(),

            // A "set" here, refers to an obj with one listener, one checker,
            // and one checkHandler. It will only be used once (just below).
            metricSets  = nod.getElements(metric.selector).map(function (element) {
                return {
                    listener:        listeners.findOrMakeItem(element, mediator),
                    checker:         checkers.findOrMakeItem(element, mediator),
                    checkHandler:    checkHandlers.findOrMakeItem(element, mediator, configuration, metric.messageContainer)
                };
            });

        checkfn.validate = metric.validate;

        metricSets.forEach(function (metricSet) {
            // In special cases, all checkHandlers to listen to the same/ checks
            var id = (metric.validate === 'one-of' || metric.validate === 'only-one-of') ? sameId : nod.unique();

            // We want our checker to listen to the listener. A listener has an
            // id, which it uses when it fires events to the mediator.
            metricSet.checker.subscribeTo(metricSet.listener.id);

            // We add the check function as one to be checked when the user
            // inputs something. (There might be more than this one).
            metricSet.checker.addCheck(checkfn, id);

            // We want the check handler to listen for results from the checker
            metricSet.checkHandler.subscribeTo(id, metric.errorMessage);

            // If the user set a `triggeredBy`, the checker need to listen to
            // changes on this element as well.
            if (metric.triggeredBy) {
                nod.getElements(metric.triggeredBy).forEach(function (element) {
                    var listener = listeners.findOrMakeItem(element, mediator);

                    metricSet.checker.subscribeTo(listener.id);
                });
            }
        });
    }


    function addForm (selector) {
        function possiblePreventSubmit (event) {
            if (configuration.preventSubmit && !isAllValid()) {
                event.preventDefault();
            }
        }

        nod.getElements(selector)[0].addEventListener('submit', possiblePreventSubmit, false);
    }




    function removeElement (selector) {
        nod.getElements(selector).forEach(function (element) {
            listeners.removeItem(element);
            checkers.removeItem(element);
            checkHandlers.removeItem(element);
        });
    }



    function configure (attributes, value) {
        if (arguments.length > 1) {
            configuration[attributes] = value;
        }  else {
            for (var key in attributes) {
                configuration[key] = attributes[key];
            }
        }
    }



    /*
     * Listen to all checks, and if the user has set in the configuration to
     * enable/disabled the submit button, we do that.
     */
    mediator.subscribe('all', function () {
        if (configuration.submit && configuration.disableSubmit) {
            nod.getElements(configuration.submit)[0].disabled = !isAllValid();
        }
    });



    /**
     * Returns true if every element is considered valid.
     */
    function isAllValid () {
        return checkHandlers.collection.reduce(function (memo, checkHandler) {
            return memo && checkHandler.isValid();
        }, true);
    }


    /**
     * Listen to all checks and allow the user to listen in, if he set a `tap`
     * function in the configuration.
     */
    mediator.subscribe('all', function (argsObj) {
        if (typeof configuration.tap === 'function' && argsObj.type === 'check') {
            configuration.tap(argsObj.element, argsObj.validate, argsObj.result);
        }
    });



    /**
     * Internal functions that are exposed to the public.
     */
    return {
        add:                    addMetrics,
        addForm:                addForm,
        remove:                 removeElement,
        isAllValid:             isAllValid,
        configure:              configure
    };
}


nod.constants = {
    VALID: 'valid',
    INVALID: 'invalid',
    UNCHECKED: 'unchecked'
};


nod.classes = {
    successClass: 'nod-success',
    successMessageClass: 'nod-success-message',
    errorClass: 'nod-error',
    errorMessageClass: 'nod-error-message'
};



// Helper function to create unique id's
nod.unique = (function () {
    var uniqueCounter = 0;

    return function () {
        return uniqueCounter++;
    };
})();




/**
 * makeMediator
 *
 * Minimal implementation of a mediator pattern, used for communication
 * between checkers and checkHandlers (checkers fires events which
 * handlers can subscribe to). Unique ID's are used to tell events apart.
 *
 * Subscribing to 'all' will give you all results from all checks.
 */
nod.makeMediator = function () {
    var subscribers = [],
        all = [];

    function subscribeId (id, fn) {
        if (!subscribers[id]) {
            subscribers[id] = [];
        }

        if (subscribers[id].indexOf(fn) === -1) {
            subscribers[id].push(fn);
        }
    }

    return {
        subscribe: function subscribe (id, fn) {
            if (id === 'all') {
                all.push(fn);
            } else {
                subscribeId(id, fn);
            }
        },

        fire: function fire (argsObj) {
            subscribers[argsObj.id].concat(all).forEach(function (fn) {
                fn(argsObj);
            });
        }
    };
};




/**
 * makeCollection
 *
 * A minimal implementation of a "collection", inspired by collections from
 * BackboneJS. Used by listeners, checkers, and checkHandlers.
 */
nod.makeCollection = function (maker) {
    var collection = [];

    function findIndex (el) {
        for (var i in collection) {
            if (collection[i].element === el) {
                return i;
            }
        }

        return -1;
    }

    function findOrMakeItem (el, mediator) {
        var index = findIndex(el);

        if (index !== -1) {
            return collection[index];
        }

        // None found, let's make one then.
        var item = maker.apply(null, arguments);
        collection.push(item);
        return item;
    }

    function removeItem (element) {
        var index = findIndex(element),
            item = collection[index];

        if (index === -1) {
            return;
        }

        // Call .dispose() if it exists
        if (typeof item.dispose === 'function') {
            item.dispose();
        }

        // Remove item
        collection.splice(index, 1);
    }

    return {
        findOrMakeItem: findOrMakeItem,
        removeItem:     removeItem,
        collection:     collection
    };
};



/**
 * makeListener
 *
 * Takes care of listening to changes to its element and fire them off as
 * events on the mediator for checkers to listen to.
 */
nod.makeListener = function (element, mediator) {
    var id = nod.unique();

    function changed () {
        mediator.fire({
            id:     id,
            type:   'change'
        });
    }

    element.addEventListener('input', changed, false);
    element.addEventListener('change', changed, false);
    element.addEventListener('blur', changed, false);

    function dispose () {
        element.removeEventListener('input', changed, false);
        element.removeEventListener('change', changed, false);
        element.removeEventListener('blur', changed, false);
    }

    return {
        element:    element,
        dispose:    dispose,
        id:         id
    };
};




/**
 * makeChecker
 *
 * An "checker" communicates primarily with the mediator. It listens
 * for input changes (coming from listeners), performs its checks
 * and fires off results back to the mediator for checkHandlers to
 * handle.
 *
 * The checker has a 1 to 1 relationship with an element, an
 * listeners, and an checkHandler; although they may
 * communicate with other "sets" of listeners, checkers and handlers.
 *
 * Checks are added, from the outside, and consists of a checkfn (see
 * nod.checkfns) and a unique id.
 */
nod.makeChecker = function (element, mediator) {
    var checks = [];

    function subscribeTo (id) {
        mediator.subscribe(id, performCheck);
    }

    // Run every check function against the value of the element.
    function performCheck () {
        checks.forEach(function (check) {
            check(nod.getValue(element));
        });
    }

    // Add a check function to the element. The result will be handed off
    // to the mediator (for checkHandlers to evaluate).
    function addCheck (checkfn, id) {
        function callback (result) {
            mediator.fire({
                id: id,
                type: 'check',
                result: result,
                element: element,
                validate: checkfn.validate
            });
        }

        checks.push(function (value) {
            checkfn(callback, value);
        });
    }


    return {
        subscribeTo:    subscribeTo,
        addCheck:       addCheck,
        element:        element
    };
};



/**
 * makeCheckHandler
 *
 * Handles checks coming in from the mediator and takes care of calculating
 * the state and error messages.
 *
 * The checkHandlers lives in one to one with the element parsed in,
 * and listens for (usually) multiple error checks.
 */
nod.makeCheckHandler = function (element, mediator, configuration, messageContainer) {
    var results     = {},
        domNode     = nod.makeDomNode(element.parentNode, configuration, messageContainer);

    function subscribeTo (id, errorMsg) {
        // Create a representation of the type of error in the results
        // object.
        if (!results[id]) {
            results[id] = {
                status: nod.constants.UNCHECKED,
                errorMsg: errorMsg
            };
        }

        // Subscribe to error id.
        mediator.subscribe(id, checkHandler);
    }

    function checkHandler (result) {
        results[result.id].status = result.result ? nod.constants.VALID : nod.constants.INVALID;

        updateDom();
    }

    // Runs through all results to see what kind of feedback to show the
    // user.
    function updateDom () {
        var result = nod.constants.VALID, // We assume it's valid
            errorMsg;

        // Check all results to see if we need to show the error message.
        for (var id in results) {
            if (results[id].status === nod.constants.INVALID) {
                result = nod.constants.INVALID;
                errorMsg = results[id].errorMsg;
                break; // Break out of the loop. No reason to check more
            }
        }

        // Event if might be valid we pass along an undefined errorMsg. It
        // will just be ignored by the domNode.
        domNode.set(result, errorMsg);
    }

    function isValid () {
        for (var key in results) {
            if (results[key].status !== nod.constants.VALID) {
                return false;
            }
        }

        return true;
    }


    function dispose () {
        // Update the class and remove the dom node.
        domNode.dispose();
    }

    return {
        subscribeTo:    subscribeTo,
        checkHandler:   checkHandler,
        isValid:        isValid,
        dispose:        dispose,
        element:        element     // Used by the collection to make sure
                                    // we only have one checkHandler
                                    // per element.
    };
};




// Helper functions for `makeDomNode`.
nod.hasClass = function (className, el) {
    return !!el.className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'));
};

nod.removeClass = function (className, el) {
    if (nod.hasClass(className, el)) {
        el.className = el.className.replace(new RegExp('(\\s|^)'+className+'(\\s|$)'), '');
    }
};

nod.addClass = function (className, el) {
    if (!nod.hasClass(className, el)) {
        el.className += ' ' + className;
    }
};



/**
 * makeDomNode
 *
 * This creates the error/success message behind the input element, as well
 * as takes care of updating classes and taking care of its own state.
 *
 * The dom node is owned by checkHandler, and has a one to one
 * relationship with both the checkHandler and the input element
 * being checked.
 *
 */
nod.makeDomNode = function (parent, configuration, messageContainer) {
    // A 'domNode' consists of two elements: a 'parent', and a 'span'. The
    // parent is given as a paremeter, while the span is created and added
    // as a child to the parent.
    var _status             = nod.constants.UNCHECKED,
        pendingUpdate       = null,
        span                = nod.getElements(messageContainer)[0] || document.createElement('span');

    if (!messageContainer) {
        span.style.display = 'none';
        parent.appendChild(span);
    }

    // Updates the class of the parent to match the status of the element.
    function updateParent (status) {
        var successClass    = configuration.successClass || nod.classes.successClass,
            errorClass      = configuration.errorClass || nod.classes.errorClass;

        switch (status) {
        case nod.constants.VALID:
            nod.removeClass(errorClass, parent);
            nod.addClass(successClass, parent);
            break;
        case nod.constants.INVALID:
            nod.removeClass(successClass, parent);
            nod.addClass(errorClass, parent);
            break;
        }
    }

    // Updates the text and class according to the status.
    function updateSpan (status, errorMessage) {
        span.style.display = 'none';
        var successMessageClass = configuration.successMessageClass || nod.classes.successMessageClass,
            errorMessageClass   = configuration.errorMessageClass || nod.classes.errorMessageClass;

        switch (status) {
        case nod.constants.VALID:
            nod.removeClass(errorMessageClass, span);
            nod.addClass(successMessageClass, span);
            if (configuration.successMessage) {
                span.textContent = configuration.successMessage;
                span.style.display = '';
            }
            break;
        case nod.constants.INVALID:
            nod.removeClass(successMessageClass, span);
            nod.addClass(errorMessageClass, span);
            span.textContent = errorMessage;
            span.style.display = '';
            break;
        }
    }

    function set (status, errorMessage) {
        // If the dom is showing an invalid message, we want to update the
        // dom right away.
        if (_status === nod.constants.INVALID || configuration.delay === 0) {

            _status = status;
            updateParent(status);
            updateSpan(status, errorMessage);

        } else {

            // If the dom shows either an unchecked or a valid state
            // we won't rush to tell them they are wrong. Instead
            // we use a method similar to "debouncing" the update
            clearTimeout(pendingUpdate);

            pendingUpdate = setTimeout(function () {

                _status = status;
                updateParent(status);
                updateSpan(status, errorMessage);

                pendingUpdate = null;

            }, configuration.delay || 700);

        }
    }


    function dispose () {
        // First remove any classes
        nod.removeClass(configuration.errorClass || nod.classes.errorClass, parent);
        nod.removeClass(configuration.successClass || nod.classes.successClass, parent);

        // Then we remove the span
        parent.removeChild(span);
    }

    return {
        set:        set,
        dispose:    dispose
    };
};



/**
 * getElements
 *
 * Takes some sort of selector, and returns an array of element(s). The applied
 * selector can be one of:
 *
 * - Css type selector (e.g., ".foo")
 * - A jQuery element (e.g., $('.foo))
 * - A single raw dom element (e.g., document.getElementById('foo'))
 * - A list of raw dom element (e.g., $('.foo').get())
 */
nod.getElements = function (selector) {
    if (!selector) {
        return [];
    }

    // Normal css type selector is assumed
    if (typeof selector === 'string') {
        // If we have jQuery, then we use that to create a dom list for us.
        if (window.jQuery) {
            return window.jQuery(selector).get();
        }

        return [].map.call(document.querySelectorAll(selector), function (el) { return el; });
    }

    // jQuery elements
    if (selector.jquery) {
        return selector.get();
    }

    // Raw DOM element
    if (selector.nodeType === 1) {
        return [selector];
    }

    // array-like object of elements
    if (Array.isArray(selector) && selector[0].nodeType === 1) {
        // Possibly a NodeList
        if (!selector.forEach) {
            return [].map.call(selector, function (el) { return el; });
        }

        // Array of elements
        return selector;
    }

    throw 'Unknown type of elements in your `selector`: ' + selector;
};


/**
 * Returns the value of an element.
 */
nod.getValue = function (element) {
    switch (element.type) {
    case 'checkbox':    return element.checked;
    case 'radio':       return element.selected;
    default:            return element.value;
    }
};



nod.getCheckFn = function (metric) {
    if (typeof metric.validate === 'function') {
        return metric.validate;
    }

    if (metric.validate instanceof RegExp) {
        return nod.checkfns.regexp(metric.validate);
    }

    var args = metric.validate.split(':'),
        fnName = args.shift();

    if (fnName === 'one-of' || fnName === 'only-one-of' || fnName === 'same-as') {
        args.push(metric.selector);
    }

    if (typeof nod.checkfns[fnName] === 'function') {
        return nod.checkfns[fnName].apply(null, args);
    } else {
        throw 'Couldn\'t find your validator function "' + fnName + '" for "' + metric.selector + '"';
    }
};

// Collection of built-in check functions
nod.checkfns = {
    'presence': function () {
        return function presence (callback, value) {
            callback(value.length > 0);
        };
    },

    'exact': function (exactValue) {
        return function exact (callback, value) {
            callback(value === exactValue);
        };
    },

    'not': function (exactValue) {
        return function not (callback, value) {
            callback(value !== exactValue);
        };
    },

    'min-length': function (minimumLength) {
        return function minLength (callback, value) {
            callback(value.length >= minimumLength);
        };
    },

    'max-length': function (maximumLength) {
        return function maxLength (callback, value) {
            callback(value.length <= maximumLength);
        };
    },

    'exact-length': function (exactLen) {
        return function exactLength (callback, value) {
            callback(value.length === +exactLen);
        };
    },

    'between-length': function (minimumLength, maximumLength) {
        return function betweenLength (callback, value) {
            callback(value.length >= minimumLength && value.length <= maximumLength);
        };
    },

    'max-number': function (maximumNumber) {
        return function maxNumber (callback, value) {
            callback(+value <= maximumNumber);
        };
    },

    'min-number': function (minimumNumber) {
        return function minNumber (callback, value) {
            callback(+value <= minimumNumber);
        };
    },

    'between-number': function (minimumNumber, maximumNumber) {
        return function betweenNumber (callback, value) {
            callback(+value >= minimumNumber && +value <= maximumNumber);
        };
    },

    'integer': function () {
        return function (callback, value) {
            callback(/^\s*\d+\s*$/.test(value));
        };
    },

    'float': function () {
        return function (callback, value) {
            callback(/^[-+]?[0-9]+(\.[0-9]+)?$/.test(value));
        };
    },

    'same-as': function (selector) {
        var element = nod.getElements(selector)[0];

        return function sameAs (callback, value) {
            callback(value === nod.getValue(element));
        };
    },

    'one-of': function (selector) {
        var elements = nod.getElements(selector);

        function getValues () {
            return elements.reduce(function (memo, element) {
                return memo + "" + (element.value || "");
            }, "");
        }

        return function oneOf (callback) {
            callback(getValues().trim().length > 0);
        };
    },

    'only-one-of': function (selector) {
        var elements = nod.getElements(selector);

        return function onlyOneOf (callback, value) {
            var numOfValues = 0;

            elements.forEach(function (element) {
                if (element.value) {
                    numOfValues++;
                }
            });

            callback(numOfValues === 1);
        };
    },

    'checked': function () {
        return function checked (callback, value) {
            callback(value === true);
        };
    },

    'regexp': function (reg) {
        return function regExp (callback, value) {
            callback(reg.test(value));
        };
    },

    'email': function () {
        var RFC822 = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;

        return function email (callback, value) {
            callback(RFC822.test(value));
        };
    },
};
