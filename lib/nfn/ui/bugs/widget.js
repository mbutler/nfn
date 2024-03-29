// BugsWidget --------------------------------------

nfn.ui.model.BugsWidget = Backbone.Model.extend({ });

nfn.ui.view.BugsWidget = nfn.ui.view.Widget.extend({
  className: 'sernac-widget bugs-widget bar',

  events: {
    'click .btn.ok': 'ok',
    'click .btn.error': 'error',
    'keypress': "onEnter",
    'click .step': 'showStepTooltip',
    'click .allmodal': 'showAllModal',
    'click .btn.finish': 'showFinishTooltip',
    'click .skip': 'skip',
    'click .back': 'back'
  },

  initialize: function() {
    _.bindAll( this, "toggle", "createAllModal", "toggleOk", "onEnter", "updatePlaceholder", "updateValue", "updateType", "createStepTooltip", "closeTooltip", "closeErrorTooltip", "closeFinishTooltip", "closeStepTooltip", "gotoStep" );

    this.template = new nfn.core.Template({
      template: this.options.template
    });

    this.templates = [];

    this.templates["text"] = new nfn.core.Template({
      template: '<input type="text" placeholder="" />',
      type: 'mustache'
    });

    this.templates['country'] = new nfn.core.Template({
      template: $("#country-input-template").html(),
      type: 'mustache'
    });

    this.templates['us-states'] = new nfn.core.Template({
      template: $("#state-input-template").html(),
      type: 'mustache'
    });

    this.templates['canadian-provinces'] = new nfn.core.Template({
      template: $("#canadian-input-template").html(),
      type: 'mustache'
    });

    this.templates['mexican-provinces'] = new nfn.core.Template({
      template: $("#mexican-input-template").html(),
      type: 'mustache'
    });

    this.templates['county'] = new nfn.core.Template({
      template: $("#county-input-template").html(),
      type: 'mustache'
    });

    this.templates["latlng"] = new nfn.core.Template({
      template: $("#latlng-input-template").html(),
      type: 'mustache'
    });


    this.templates["date"] = new nfn.core.Template({
      template: $("#date-input-template").html(),
      type: 'mustache'
    });

    this.add_related_model(this.model);

    this.model.bind("change:hidden",      this.toggle);
    this.model.bind("change:placeholder", this.updatePlaceholder);
    this.model.bind("change:type",        this.updateType);
    this.model.bind("change:value",       this.updateValue);

    this.model.bind("change:draggable",     this.toggleDraggable);
    this.model.bind("change:resizable",     this.toggleResizable);
    this.model.bind("change:ok_enabled",  this.toggleOk);

    this.parent = this.options.parent;
  },

  back: function(e) {
    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    this.clearInput();
    this.parent.previousStep();
  },

  skip: function(e) {
    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    // this.closeTooltip();               // TODO: add test
    // this.parent.helper.closeTooltip(); // TODO: add test

    this.clearInput();
    this.parent.nextStep();
  },

  onEnter: function(e) {
    if (e.keyCode != 13) return;
    this.ok();
  },

  error: function(e) {
    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    // this.ok();
  },

  ok: function(e) {
    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    GOD.triggerCallbacks(); // this close the tooltips (TODO: add test)

    if (this.model.get('required')) {
      if (this.$input.val() && this.$input.val() != 'placeholder') {
        this.parent.saveCurrentStep();
        this.clearInput();

        // Shall we go to the next record or the next step?
        if (this.parent.getPendingFieldCount() == 0) {
          this.parent.finish();
        } else {
          this.parent.nextStep();
        }
      } else {
        this.showErrorTooltip("Empty field", "Please write a value or use the skip field option below!");
      }
    } else {
      this.parent.saveCurrentStep();
      this.clearInput();

      // Shall we go to the next record or the next step?
      if (this.parent.getPendingFieldCount() == 0) {
        this.parent.finish();
      } else {
        this.parent.nextStep();
      }
    }
  },

  toggleOk: function() {
    if (this.model.get("ok_enabled")) {
      this.$okButton.removeClass("disabled");
    } else {
      this.$okButton.addClass("disabled");
    }
  },

  enableOk: function(callback) {
    this.model.set("ok_enabled", true);

    callback && callback();

    return this;
  },

  disableOk: function(callback) {
    this.model.set("ok_enabled", false);

    callback && callback();

    return this;
  },

  gotoStep: function(e, i) {
    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    this.clearInput();
    this.closeStepTooltip();

    this.parent.model.set("currentStep", i);
    this.focus();
  },

  showErrorTooltip: function(title, description) {

    this.closeTooltips();

    if (!this.errorTooltip) this.createErrorTooltip(title, description);

  },

  closeErrorTooltip: function(callback) {

    var that = this;

    if (!this.errorTooltip) return;

    this.errorTooltip.hide();
    this.errorTooltip.clean();
    delete this.errorTooltip;

    this.$errorIndicator.fadeOut(100, function() {
      that.$okButton.fadeIn(100);
    });

    callback && callback();

  },

  createErrorTooltip: function(title, description) {

    var
    main        = "Finish",
    secondary   = "Cancel";

    this.errorTooltip = new nfn.ui.view.Tooltip({

      className: "tooltip error",

      model: new nfn.ui.model.Tooltip({
        template: $("#tooltip-error-template").html(),
        title: title,
        description: description
      })

    });

    this.addView(this.errorTooltip);

    var that = this;

    this.errorTooltip.bind("onEscKey",         this.closeErrorTooltip);
    this.errorTooltip.bind("onSecondaryClick", this.closeErrorTooltip);
    this.errorTooltip.bind("onMainClick",      function() {

      that.closeErrorTooltip(function() {
        //that.finish();
      })

    });

    this.$okButton.fadeOut(100, function() {
      that.$errorIndicator.fadeIn(100);
    });

    this.$el.append(this.errorTooltip.render());

    this.errorTooltip.show();

    var
    $element    = this.$okButton,
    targetWidth = $element.width()/2,
    marginRight = 8,
    x           = Math.abs(this.$el.offset().left - $element.offset().left) - this.errorTooltip.width() / 2 + targetWidth - marginRight,
    y           = Math.abs(this.$el.offset().top  - $element.offset().top)  - this.errorTooltip.height() - 40

    this.errorTooltip.setPosition(x, y);
    GOD.add(this.errorTooltip, this.closeErrorTooltip);

  },

  showAllModal: function(e) {
    this.createAllModal(e);
  },

  createAllModal: function(e) {
    //$target     = this.$allButton;
    this.popup = new nfn.ui.view.Popup({
          model: new nfn.ui.model.Popup(),
          template: $('#allmodal-template').html(),
          
        });

        this.addView(this.popup);
       
        this.$el.append(this.popup.render());
    
  },

  showSkipTooltip: function(e) {

    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    this.closeTooltips();

    if (!this.tooltip) this.createTooltip(e);

  },

  createTooltip: function(e) {

    var
    title       = "Are you sure?",
    description = "If you can’t find the value, you can see <a href='#'>examples</a> that surely will help you",
    main        = "Skip field",
    secondary   = "Cancel";

    this.tooltip = new nfn.ui.view.Tooltip({
      model: new nfn.ui.model.Tooltip({ title: title, description: description, main: main, secondary: secondary })
    });

    this.addView(this.tooltip);

    var that = this;

    this.tooltip.bind("onEscKey",         this.closeTooltip);
    this.tooltip.bind("onSecondaryClick", this.closeTooltip);
    this.tooltip.bind("onMainClick",      function() {

      that.closeTooltip(function() {
        that.skip();
      })

    });

    this.$el.append(this.tooltip.render());
    this.tooltip.show();

    var
    targetWidth   = $(e.target).width()/2,
    marginRight = parseInt($(e.target).css("margin-right").replace("px", ""), 10),
    x           = Math.abs(this.$el.offset().left - $(e.target).offset().left) - this.tooltip.width() / 2 + targetWidth - marginRight,
    y           = Math.abs(this.$el.offset().top  - $(e.target).offset().top)  - this.tooltip.height() - 40

    this.tooltip.setPosition(x, y);
    GOD.add(this.tooltip, this.closeTooltip);

  },

  closeTooltip: function(callback) {

    if (!this.tooltip) return;

    this.tooltip.hide();
    this.tooltip.clean();
    delete this.tooltip;

    callback && callback();

  },

  showStepTooltip: function(e) {

    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    this.closeTooltips();

    if (!this.stepTooltip) this.createStepTooltip(e);

  },

  createStepTooltip: function(e) {
    this.stepTooltip = new nfn.ui.view.Tooltip({
      className: "tooltip step",
      model: new nfn.ui.model.Tooltip({
        template: $("#tooltip-step-template").html(),
        links: this.parent.guide
      })
    });

    this.addView(this.stepTooltip);

    var that = this;

    this.stepTooltip.bind("onEscKey", this.closeStepTooltip);

    this.$el.append(this.stepTooltip.render());
    this.stepTooltip.show();

    var
    $target     = this.$step,
    targetWidth = $target.width()/2,
    marginRight = parseInt($target.css("margin-right").replace("px", ""), 10);


    this.parent.transcriptions.each(function(transcription) {
      if (transcription.get("value")) {
        that.stepTooltip.$el.find("li:nth-child(" + (transcription.get("stepNumber") + 1) + ")").addClass("completed");
        that.stepTooltip.$el.find("li:nth-child(" + (transcription.get("stepNumber") + 1) + ") span").text(transcription.get('value'));
      }
    });

    var x = Math.abs(this.$el.offset().left - $target.offset().left) - this.stepTooltip.width() + 30,
        y = Math.abs(this.$el.offset().top  - $target.offset().top)  - this.stepTooltip.$el.outerHeight() - 17;
    this.stepTooltip.setPosition(x, y);

    var currentStep = this.parent.model.get("currentStep");

    this.stepTooltip.$el.find("a").on("click", function(e) {
      var i = $(this).parent().index();
      that.gotoStep(e, i);
    });

    GOD.add(this.stepTooltip, this.closeStepTooltip);
  },

  closeStepTooltip: function(callback) {

    if (!this.stepTooltip) return;

    this.stepTooltip.hide();
    this.stepTooltip.clean();
    delete this.stepTooltip;

    this.focus();

    callback && callback();

  },

  showFinishTooltip: function(e) {
    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    this.closeTooltips();

    if (!this.finishTooltip) this.createFinishTooltip(e);
  },

  closeTooltips: function() {
    GOD.triggerCallbacks();
  },

  createFinishTooltip: function(e) {
    if (this.parent.getPendingFieldCount() == 0) {
      var title = 'Thank you!',
        description = 'Onto the next record.',
        main = 'Next',
        secondary = 'Cancel';
    } else {
      var title = 'Are you sure?',
        description = '',
        main = 'Finish',
        secondary = 'Cancel';

      if (this.parent.getPendingFieldCount() == 1) {
        description = "There is still <a href='#'>1 empty field</a> for this record that should be completed before finishing.";
      } else {
        description = "There are still <a href='#'> " + this.parent.getPendingFieldCount() + " empty fields</a> for this record that should be completed before finishing.";
      }
    }

    this.finishTooltip = new nfn.ui.view.Tooltip({
      model: new nfn.ui.model.Tooltip({
        title: title,
        description: description,
        main: main,
        secondary: secondary
      })
    });

    this.addView(this.finishTooltip);

    var that = this;

    this.finishTooltip.bind("onEscKey",         this.closeFinishTooltip);
    this.finishTooltip.bind("onSecondaryClick", this.closeFinishTooltip);
    this.finishTooltip.bind("onMainClick",      function() {

      that.closeFinishTooltip(function() {
        that.finish();
      })
    });

    this.$el.append(this.finishTooltip.render());
    this.finishTooltip.show();

    this.finishTooltip.$el.find(".description > a").on("click", function(e) {
      e.preventDefault();
      e.stopPropagation();

      that.showStepTooltip();
    });

    var
    $target     = this.$finishButton,
    targetWidth = $target.width()/2,
    marginRight = parseInt($target.css("margin-right").replace("px", ""), 10),
    x           = Math.abs(this.$el.offset().left - $target.offset().left) - this.finishTooltip.width() / 2 + targetWidth - marginRight,
    y           = Math.abs(this.$el.offset().top  - $target.offset().top)  - this.finishTooltip.height() - 40

    this.finishTooltip.setPosition(x, y);
    GOD.add(this.finishTooltip, this.closeFinishTooltip);
  },

  closeFinishTooltip: function(callback) {
    if (!this.finishTooltip) return;

    this.finishTooltip.hide();
    this.finishTooltip.clean();
    delete this.finishTooltip;

    callback && callback();
  },

  finish: function(e) {
    e && e.preventDefault();
    e && e.stopImmediatePropagation();

    this.clearInput();
    this.parent.finish();
  },

  clearInput: function() {
    this.$input.val("");
  },

  resize: function() {
    var that = this
      , type = this.model.get("type")
      , width = this.model.get("inputWidth");

    // Centers the widget horizontally and resizes the input field
    if (type == 'date') {
      if ($(".input_field.date").width() > width - 290) {
        this.animate({width: width}, true, function() {
          $(".input_field.date").delay(50).animate({ width: width - 290  }, 150);
        });
      } else {
        this.animate({width: width}, true);
        $(".input_field.date").delay(50).animate({ width: width - 290  }, 150);
      }
    } else if (type == 'latlng') {
      if ($(".input_field.latlng").width() > width - 290) {
        this.animate({width: width}, true, function() {
          $(".input_field.latlng").delay(50).animate({ width: width - 290  }, 150);
        });
      } else {
        this.animate({width: width}, true);
        $(".input_field.latlng").delay(50).animate({ width: width - 290  }, 150);
      }
    } else {
      if (this.$el.find('.input_field').width() > width - 300) {
        this.$el.find('.input_field').animate({width: width - 300}, 200, function() {
          that.$input.width(width - 300 - 40);
          that.animate({width: width}, true);
        });
      } else {
        this.animate({ width: width}, true);
        this.$el.find('.input_field').delay(50).animate({ width: width - 300  }, 200);
        this.$input.width(width - 300 - 40);
      }
    }
  },

  getValue: function() {
    var type = this.model.get("type");

    if (type == 'date') {
      this.$input.each(function(i){
        switch ($(this).attr('class')) {
          case 'month':
            if ($(this).val() == 'placeholder') {
              month = false;
              break;
            }
            month = $(this).val(); break;
          case 'day':
            if ($(this).val() == 'placeholder') {
              day = false;
              break;
            }
            day = $(this).val(); break;
          case 'year':
            if ($(this).val() == 'placeholder') {
              year = false;
              break;
            }
            year = $(this).val(); break;
        }
      });

      if (month && day && year) {
        return month + "/" + day + "/" + year;
      } else {
        return "";
      }
    } else if (type == 'latlng') {
      this.$input.each(function(i) {
        switch ($(this).attr('class')) {
          case 'lat':
            lat = $(this).val(); break;
          case 'lng':
            lng = $(this).val(); break;
        }
      });

      if (lat && lng) {
        return lat + ', ' + lng
      } else {
        return '';
      }
    } else {
      return this.$input.val();
    }
  },

  updatePlaceholder: function() {
    var type = this.model.get("type")
      , placeholders = this.model.get("placeholder");

    if (type == 'date') {
      this.$input.find(".day").attr("placeholder", placeholders[0]);
      this.$input.find(".month").attr("placeholder", placeholders[1]);
      this.$input.find(".year").attr("placeholder", placeholders[2]);
    } else if (type == 'latlng') {
      this.$input.find('.lat').attr('placeholder', placeholders[0]);
      this.$input.find('.lng').attr('placeholder', placeholders[1]);
    } else {
      this.$input.attr("placeholder", this.model.get("placeholder"));
    }

    this.resize();
  },

  focus: function() {
    this.$el.find('input, select').first().focus();
  },

  updateValue: function() {
    this.$input.val("");

    var value = this.model.get("value"),
        type = this.model.get("type");

   if (type == 'date') {
      var date = value.split("/");

      var month = date[0];
      var day   = date[1];
      var year  = date[2];

      this.$el.find(".month").val(month);
      this.$el.find(".day").val(day);
      this.$el.find(".year").val(year);
    } else if (type == 'latlng') {
      var latlng = value.split(',');

      var lat = latlng[0]
        , lng = latlng[1];

      this.$el.find('.lat').val(lat);
      this.$el.find('.lng').val(lng);
    } else {
      this.$input.val(value);
    }
  },

  updateType: function() {
    var type = this.model.get('type')
      , types = Object.keys(this.templates)
      , provinceTemplate = false
      , provinceFieldType = 'input';

    this.$el.find(".input_field").removeClass(types.join(' ')).addClass(type);
    this.$el.find(".input_field input, .input_field .country_field, .input_field .state_field, .input_field .county_field, .input_field .latlng_field, .input_field .date_field").remove();

    if (type == 'state') {
      // Country is the first piece of data collected, hence step 0.
      var country = false;
      if (this.parent.getStepData(0)) {
        country = this.parent.getStepData(0).get('value');
      }

      // If it's US/Canada/Mexico, have state be a pre-defined list of states/counties. Otherwise, display text input.
      if (country) {
        switch (country) {
          case 'United States':
            provinceTemplate = 'us-states'; break;
          case 'Canada':
            provinceTemplate = 'canadian-provinces'; break;
          case 'Mexico':
            provinceTemplate = 'mexican-provinces'; break;
        }

        if (!provinceTemplate) {
          provinceTemplate = 'text'
        } else {
          provinceFieldType = 'select'
        }

        this.$el.find(".input_field").append(this.templates[provinceTemplate].render());
        this.$input = this.$el.find('.input_field ' + provinceFieldType);
      }

    } else if (type == 'county') {
      var country = false
        , state = false;

      if (this.parent.getStepData(0)) {
        country = this.parent.getStepData(0).get('value');
      }

      if (this.parent.getStepData(1)) {
        state = this.parent.getStepData(1).get('value')
      }

      // Country is the first piece of data collected, hence step 0.
      var counties = window.counties[state];

      // If it's US, have state/county be a pre-defined list of states/counties. Otherwise, display text input.
      if (country && state && this._isCountryUs(country)) {
        this.$el.find(".input_field").append(this.templates[type].render({state: state, counties: counties}));
        this.$input = this.$el.find('.input_field select');
      } else {
        this.$el.find(".input_field").append(this.templates['text'].render());
        this.$input = this.$el.find('.input_field input');
      }

    } else if (type == 'date' || type == 'country') {
      this.$el.find(".input_field").append(this.templates[type].render());
      this.$input = this.$el.find('.input_field select');

    } else {
      this.$el.find(".input_field").append(this.templates[type].render());
      this.$input = this.$el.find('.input_field input');
    }
  },

  render: function() {
    this.$el.append(this.template.render());

    this.$errorIndicator  = this.$el.find(".error");
    this.$okButton        = this.$el.find(".btn.ok");
    this.$skip            = this.$el.find(".skip");    
    this.$finishButton    = this.$el.find(".btn.finish");
    this.$step            = this.$el.find(".step");
    this.$input           = this.$el.find('.input_field input[type="text"]');

    return this.$el;
  }
});


