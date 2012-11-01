//model is an app.Models.Command
app.Views.CommandListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .refresh": "refreshAction",
        "click .push": "pushAction",
        "click .close": "closeAction"
    },
    initialize: function () {
        this.model.bind("change", function () { this.render(); }, this);
    },
    template: "command-list-item-template",
    tagName: "tr",
    onRender: function () {
        if (this.model.isNew())
            this.showEditableFields();
        else
            this.showInfoFields();
    },
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });

        if (!_.has(data, "result") || _.isNull(data.result))
            data.result = "";

        if (!_.has(data, "status") || _.isNull(data.status))
            data.status = "";

        if (_.has(data, "parameters") && !_.isNull(data.parameters))
            data["parameters"] = JSON.stringify(data.parameters);
        else
            data["parameters"] = "";

        if (_.has(data, "timestamp") && !_.isEmpty(data.timestamp))
            data["timestamp"] = app.f.parseUTCstring(data.timestamp).format("mm/dd/yyyy HH:MM:ss");
        else
            data["timestamp"] = "";

        if (!_.has(data, "command") || _.isNull(data.command))
            data["command"] = "";

        return data;
    },
    showEditableFields: function () {
        this.$el.find(".editable-zone").show();
        this.$el.find(".data-zone").hide();

        this.$el.find(".refresh").hide();
        this.$el.find(".push").show();
        this.$el.find(".close").show();
    },
    showInfoFields: function () {
        this.$el.find(".editable-zone").hide();
        this.$el.find(".push").hide();
        this.$el.find(".close").hide();
        this.$el.find(".data-zone").show();

        if (!(_.isEmpty(this.model.get("result"))))
            this.$el.find(".refresh").hide();
    },
    closeAction: function () {
        if (this.model.isNew())
            this.model.destroy();
    },
    refreshAction: function () {
        this.model.fetch({
            error: function (mod, response) {
                vent.trigger("notification", app.Enums.NotificationType.Error, response);
            }
        });
    },
    pushAction: function () {
        var fields = {};
        var name = this.$el.find(".new-command-name").val();
        var parameters = this.$el.find(".new-command-params").val();
        if (_.isEmpty(parameters))
            parameters = null;

        var that = this;

        this.model.save({ parameters: parameters, command: name }, {
            error: function (mod, response) {
                that.model.collection.remove(that.model);
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            success: function () {
                that.model.collection.remove(that.model);
                alert("Cammand was succesfully send to server");
            }
        });
    }
});

//collection is an app.Models.CommandsCollection
app.Views.Commands = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .add-command": "addCommand",
        "click .show-datetime-filter": "showDateTimeFilter"
    },
    itemView: app.Views.CommandListItem,
    template: "commands-list-template",
    emptyView: Backbone.Marionette.ItemView.extend({ template: "commands-empty-template", tagName: "tr" }),
    initialize: function (options) {
        this.collection = new app.Models.CommandsCollection({}, { device: this.model });

        if (!_.isUndefined(options) && _.has(options, "timeFilters"))
            this.timeFiltersModel = options.timeFilters;
        else
            this.timeFiltersModel = new app.Models.TimeFilters();
        
        this.bindTo(this, "composite:collection:rendered", this.StopLoading, this);
    },
    StopLoading: function () {
        this.$el.find(".loading-area").hide();
    },
    StartLoading: function () {
        this.$el.find(".loading-area").show();
    },
    onRender: function () {
        this.timeFiltersView = new app.Views.TimeFilters({ model: this.timeFiltersModel });
        var that = this;

        this.timeFiltersView.render().then(function () {
            that.$el.append(that.timeFiltersView.$el);
        });

        this.timeFiltersView.on("applyFilters", function () {
            that.applyDateTimeFilter();
        });
        this.timeFiltersView.on("closeFilters", function () {
            that.timeFiltersView.$el.hide();
        });
    },
    onClose: function () {
        this.collection.closePolling();
    },
    appendHtml: function (collectionView, itemView, index) {
        if (!("$_itemViewContainer" in collectionView))
            collectionView.$_itemViewContainer = collectionView.$el.find(".child-items-holder");

        collectionView.$_itemViewContainer.prepend(itemView.el);
    },
    refreshCollection: function () {
        this.collection.closePolling();

        var that = this;
        var params = {};

        var start = this.timeFiltersModel.get("startDateUTCString");
        var end = this.timeFiltersModel.get("endDateUTCString");

        if (!_.isEmpty(start))
            params["start"] = start;
        if (!_.isEmpty(end))
            params["end"] = end;
        this.StartLoading();
        this.collection.fetch({
            data: params,
            success: function () {
                if (_.isEmpty(end))
                    that.collection.pollUpdates();
            }
        });
    },
    addCommand: function () {
        this.collection.add(new app.Models.Command({}, { device: this.model }));
    },
    showDateTimeFilter: function () {
        var dtBox = this.timeFiltersView.$el;
        var pos = this.$el.find(".show-datetime-filter").offset();

        dtBox.css("top", pos.top);
        dtBox.css("left", pos.left);
        dtBox.show();
    },
    applyDateTimeFilter: function () {
        this.timeFiltersView.$el.hide();
        this.refreshCollection();
    }
});

