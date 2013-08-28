// Functions used from cherries.js: map dot each foldl extend (to be included
// manually later
"use strict";
(function(){

  // Once created (when nod() is called), these should be consdered immutable
  var metrics,
      options,
      $els,
      listeners,
      defaultOptions = {
        'form': '',
        'submitBtn': '',
        'delay': 700,
        'helpSpanDisplay': 'help-inline',
        'groupClass': 'error',
        'errorPosClasses': [ '.help-inline'
                           , '.add-on'
                           , 'button'
                           , '.input-append' ],
        //'silentSubmit': false,      // These do nothing at the moment
        //'broadcastError': false,
        'errorClass': 'nodMsg',
        'groupSelector': '.control-group'
      };



  // args: all the metrics passed in by the user
  // returns an array of [ $el, metric ]
  function getListenerArgs (metrics, options) {
    return foldl(function (memo, field) {
      $(field[0]).each(function(){
        memo.push( [$(this), field, options] );
      });
      return memo;
    }, [], metrics);
  }


  function toggleGroupClass (event, el) {
    var group = getGroup(el);
    groupHasErrors(group) ? group.addClass(options.groupClass)
                          : group.removeClass(options.groupClass)
  }


  function elsHaveErrors (els) {
    var els = els ? $(els) : $els,
        err = false;
    els.each(function () {
      if (groupHasErrors(getGroup(this))) err = true
    });
    return err;
  }


  function getGroup (el) {
    return $(el).parents(options.groupSelector)
  }


  function groupHasErrors (group) {
    return !! group.find('.' + options.errorClass).length
  }


  function get$Els (metrics) {
    return $( unique( map( dot(0), metrics ) ) );
  }



  var toggleSubmit;
  function makeToggleSubmit (sel) {
    if (!sel) return function(){};
    var $btn = $(sel);

    return function (onoff) {
      var err;
      if (onoff === 'on')       { err = false }
      else if (onoff === 'off') { err = true }
           else                 { err = elsHaveErrors() }

      err ? $btn.addClass('disabled').attr('disabled','disabled')
          : $btn.removeClass('disabled').removeAttr('disabled')
    }
  }

  // if clear === 'clear' then all errors will get cleared
  function runMassTriggerOfCheck (clear) {
    $els.each(function () {
      $(this).trigger('nodCheck', clear);
    });
  }

  
  var formSubmitEvents;
  function makeFormSubmitEvents (form) {
    if (!form) return;

    var $form = $(form);

    $form.on('submit', submitForm);

    function submitForm (event) {
      runMassTriggerOfCheck();

      if (elsHaveErrors()) {
        event.preventDefault();
      }
    }

  }


  // main function called by the user
  function nod (met, opt) {
    if (!met || met.length === 0) return;

    metrics           = met || [];
    options           = extend(defaultOptions, (opt || {}));
    $els              = get$Els(metrics);
    listeners         = map(listener, getListenerArgs(metrics, options));

    toggleSubmit      = makeToggleSubmit(options.submitBtn);
    formSubmitEvents  = makeFormSubmitEvents(options.form);


    function listenerEvents (listener) {
      $(listener).on('nodToggle', toggleGroupClass);
      $(listener).on('nodToggle', toggleSubmit);
    }

    each(listenerEvents, listeners);






    return {
      runMassTriggerOfCheck : runMassTriggerOfCheck,
      toggleSubmit  : toggleSubmit,
      elsHaveErrors : elsHaveErrors
    }
  }



  window.nod = nod;
})();
