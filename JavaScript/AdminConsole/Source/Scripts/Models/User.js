﻿app.Models.User = Backbone.Model.extend({
    urlRoot: function () { return app.restEndpoint + "/user"; },
    defaults: { login: "", status: app.Enums.UserStatus.Active, role: app.Enums.UserRole.Administrator, networks: [] },
    getters: {
        networksCollection: function () {
            if (this.networksColl == null)
                this.networksColl = new Backbone.Collection(_.map(this.get("networks"), function (netObj) {
                    return new app.Models.Network(netObj.network);
                }));

            return this.networksColl;
        }
    },
    //put connector to server and add network record to appropriate collection(to just keep views in sync)
    //This and the next method is the result of many-to-many relationshipd, that isn't supported directly. 
    //Possible usage of backbone-relational.js, but services should be appropriately modified, which isn't acceptive.
    addNetwork: function (network) {
        var connector = new app.Models.UserInNetwork({ UserId: this.get("id"), NetworkId: network.get("id") });
        var that = this;
        connector.save(null, {
            success: function () {
                that.get("networksCollection").add(network);
            },
            error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            type: "PUT"
        }
        );
    },
    //remove connector from server and remove network record from appropriate collection(just to keep views in sync)
    removeNetwork: function (networkId) {
        var connector = new app.Models.UserInNetwork({ UserId: this.get("id"), NetworkId: networkId });
        var that = this;
        connector.fetch({ success: function (fetchedModel) {
            connector.destroy({
                success: function (model) {
                    that.get("networksCollection").remove(networkId);
                },
                error: function (model, response) {
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                }
            });
        } 
        });

    }
});

app.Models.UsersCollection = Backbone.Collection.extend({
    url: function () { return app.restEndpoint + "/user"; },
    model: app.Models.User
});

