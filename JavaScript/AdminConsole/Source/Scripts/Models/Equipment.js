﻿app.Models.Equipment = Backbone.Model.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "deviceClass")) {
            this.deviceClass = attributes.deviceClass;
        } else if (!_.isUndefined(options) && _.has(options, "deviceClass")) {
            this.deviceClass = options.deviceClass;
        } else if (!_.isUndefined(this.collection) && _.has(this.collection, "deviceClass")) {
            this.deviceClass = this.collection.deviceClass;
        } else {
            var err = new Error("Device class should be specified to define equipment endpoint");
            err.name = "Equipment without device error";
            throw err;
        }
    },
    urlRoot: function () {
        return app.restEndpoint + '/device/class/' + this.deviceClass.get("id") + "/equipment";
    }
});

app.Models.EquipmentsCollection = Backbone.Collection.extend({
    initialize: function (attributes, options) {
        if (!_.isUndefined(attributes) && _.has(attributes, "deviceClass")) {
            this.deviceClass = attributes.deviceClass;
        } else if (!_.isUndefined(options) && _.has(options, "deviceClass")) {
            this.deviceClass = options.deviceClass;
        } else {
            var err = new Error("Device class should be specified to define equipments endpoint");
            err.name = "Equipment collection without device error";
            throw err;
        }
    },
    url: function () {
        return app.restEndpoint + '/device/class/' + this.deviceClass.get("id") + "/equipment";
    },
    //override fetch to make got the list of equipment throught the DeviceClass endpoint
    fetch: function (options) {
        options = options ? _.clone(options) : {};
        if (options.parse === undefined) options.parse = true;
        var collection = this;
        var success = options.success;
        

        var model = new app.Models.DeviceClass({ id: this.deviceClass.get("id") });
        
        options.success = function(resp, status, xhr) {
            if (!model.set(model.parse(resp, xhr), options)) return false;
            collection.reset();

            var addIt = collection.parse(model.get("equipment"));
            if (!_.isUndefined(addIt))
                collection.add(addIt);

            if (success) success(collection, resp);
        };

        options.error = Backbone.wrapError(options.error, collection, options);
        return (this.sync || Backbone.sync).call(this, 'read', model, options);
    },
    model: app.Models.Equipment
});
