//+ fnOf :: a -> fn -> b
var fnOf = autoCurry(function (x, fn) { return fn(x); });


//+ runCheck :: item -> event -> dom side effects
function runCheck (item) {
    return function (ev) {
        var results = map(fnOf(ev.target.value), item.checks),
            isValid = all(eq(true), results),
            nodText = head(filter(neq(true), results)) || item.validText;

        item.textHolder.html(nodText).fadeIn();
        item.group
            .toggleClass("has-success", isValid)
            .toggleClass("has-error", !isValid);
    }
}

function attachListener (item) {
    $(item.el).on('keyup', runCheck(item));
}


