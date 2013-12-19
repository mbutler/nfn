nfn.ui.model.GOD = Backbone.Model.extend({ });

nfn.ui.collection.Tooltips = Backbone.Collection.extend({
  model: nfn.ui.model.Tooltip
});

nfn.ui.view.GOD = nfn.core.View.extend({

  /*hideTooltips: function() {

    var that = this;

    this.tooltips.each(function(tooltip) {

      tooltip.set("hidden", true);
      that.tooltips.remove(tooltip);

    });

  },*/

  triggerCallbacks: function() {

    for (var i = 0; i<= this.items.length - 1; i++) {

      var item = this.items[i];

      try {

        item.callback && item.callback();

      } catch (e) { }

    }

    this.items = [];

  },

  add: function(item, callback) {

    this.items.push({ item: item, callback: callback });

  },

  initialize: function() {

    var that = this;

    $(document).on("click", function(e) {

      that.triggerCallbacks();

    });

    this.items = [];

  }

});

