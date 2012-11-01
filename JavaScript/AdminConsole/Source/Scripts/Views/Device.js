// model app.Models.Device
app.Views.Device = Backbone.Marionette.ItemView.extend({
    events: {
        "click .edit-device": "editDevice",
        "click .save-device": "saveDevice",
        "click .close-action": "closeAction"
    },
    initialize: function (options) {
        this.model.bind("change", function () { this.render(); }, this);

        //lists are necessary to render the select boxes throught editing
        this.networksList = options.networks;
        this.classesList = options.classes;
    },
    onRender: function () {
        this.closeAction();
        this.$el.addClass("device-detail-view panel");
    },
    template: "device-template",
    serializeData: function () {
        var base = this.model.toJSON({ escape: true });
        base.networks = this.networksList.toJSON({ escape: true }); ;
        base.classes = this.classesList.toJSON({ escape: true }); ;
        return base;
    },
    editDevice: function () {
        this.$el.find(".device-value").hide();
        this.$el.find(".edit-device").hide();

        this.$el.find(".save-device").show();
        this.$el.find(".new-value").show();
        this.$el.find(".close-action").show();
    },
    closeAction: function () {
        this.$el.find(".new-value").hide();
        this.$el.find(".save-device").hide();
        this.$el.find(".close-action").hide();

        this.$el.find(".device-value").show();
        this.$el.find(".edit-device").show();
    },
    saveDevice: function () {
        var name = this.$el.find(".new-value.name").val();
        var status = this.$el.find(".new-value.status").val();

        var netwId = this.$el.find(".new-value.network :selected").val();
        var classId = this.$el.find(".new-value.dclass :selected").val();
        var network = this.networksList.find(function (net) { return net.id == netwId; });
        var dclass = this.classesList.find(function (cls) { return cls.id == classId; });

        var that = this;
        this.model.save({ name: name, status: status, network: network, deviceClass: dclass }, {
            success: function () {

            }, error: function (model, response) {
                that.render();
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            wait: true
        });

    }
});




