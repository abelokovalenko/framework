//model is an app.Models.Equipment
app.Views.EquipmentListItem = Backbone.Marionette.ItemView.extend({
    events: {
        "click .delete-equip": "deleteEquipment",
        "click .edit-equip": "editEquipment",
        "click .save-equip": "saveEquipment",
        "click .cancel-equip": "cancelAction"
    },
    initialize: function () {
        this.model.bind("change", function () { this.render(); }, this);
    },
    template: "equipment-list-item-template",
    tagName: "tr",
    onRender: function () {
        if (this.model.isNew())
            this.showEditableAreas();
        else
            this.showValuesAreas();
    },
    deleteEquipment: function () {
        if (this.model.deviceClass.get("isPermanent") == false)
            if (confirm("are you realy want to delete this equipment? This changes cannot be undone."))
                this.model.destroy({ error: function (model, response) {
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                }
                });
    },
    saveEquipment: function () {
        var name = this.$el.find(".name-equip").val();
        var code = this.$el.find(".code-equip").val();
        var type = this.$el.find(".type-equip").val();
        var that = this;

        this.model.save({ name: name, code: code, type: type }, {
            error: function (mod, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            success: function (mod, response) {
                that.showValuesAreas();
            }
        });
    },
    cancelAction: function () {
        if (this.model.isNew())
            this.model.destroy();
        else
            this.showValuesAreas();
    },
    editEquipment: function () {
        if (this.model.deviceClass.get("isPermanent") == false)
            this.showEditableAreas();
    },
    showValuesAreas: function () {
        this.$el.find(".current-value").show();
        this.$el.find(".new-value").hide();

        if (this.model.deviceClass.get("isPermanent") == true)
            this.$el.find(".button").hide();
    },
    showEditableAreas: function () {
        this.$el.find(".new-value").show();
        this.$el.find(".current-value").hide();

        if (this.model.deviceClass.get("isPermanent") == true)
            this.$el.find(".button").hide();
    },
    serializeData: function () {
        var data = this.model.toJSON({ escape: true });
        if (!_.has(data, "name"))
            data["name"] = "";
        if (!_.has(data, "code"))
            data["code"] = "";
        if (!_.has(data, "type"))
            data["type"] = "";

        return data;
    }
});