﻿app.Models.Command = Backbone.Model.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "device")) {
            this.device = attributes.device;
        }
        else if (!_.isUndefined(options) && _.has(options, "device")) {
            this.device = options.device;
        } else if (!_.isUndefined(this.collection) && _.has(this.collection, "device")) {
            this.device = this.collection.device;
        } else {
            var err = new Error("Device should be specified to define device command endpoint");
            err.name = "Command without device error";
            throw err;
        }

        if (!_.has(attributes, "timestamp")) {
            this.set("timestamp", (new Date().getTime()));
        }
    },
    urlRoot: function () {
        return app.restEndpoint + '/device/' + this.device.get("id") + "/command";
    },
    defaults: { status: "", result: "" }
});

app.Models.CommandsCollection = Backbone.Collection.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "device")) {
            this.device = attributes.device;
        }
        else if (!_.isUndefined(options) && _.has(options, "device")) {
            this.device = options.device;
        } else {
            var err = new Error("Device should be specified to define device command endpoint");
            err.name = "Command without device error";
            throw err;
        }

    },
    url: function () {
        return app.restEndpoint + '/device/' + this.device.get("id") + "/command";
    },
    closePolling: function () {
        if (!_.isEmpty(this.jqXhr)) {
            this.deleted = true;
            this.jqXhr.abort("user initiated abort");
        }
    },
    //start polling updates from the server and add them to collection
    pollUpdates: function () {
        var pollUrl = app.restEndpoint + "/device/" + this.device.get("id") + "/command/poll";
        var that = this;
        this.deleted = false;

        var timestamp = app.f.getMaxTimeMicro(this.pluck("timestamp"));

        this.jqXhr = $.ajax({
            url: pollUrl,
            dataType: "json",
            data: { timestamp: timestamp },
            success: function (data) {
                _.each(data, function (incomingCommand) {
                    that.add(new app.Models.Command(incomingCommand, { device: that.device }));
                });
            },
            complete: function () {
                if (that.deleted == false)
                    that.pollUpdates();
            },
            timeout: 30000
        });
    },
    model: app.Models.Command
});
