//model is an app.Models.DeviceClass
app.Views.DeviceClassesListItem = Backbone.Marionette.ItemView.extend({
    triggers: {
        "click .show-equipments": "showEquipments"
    },
    events: {
        "click .delete": "deleteClass",
        "click .edit": "editClass",
        "click .save": "saveClass",
        "click .close": "closeEdition",
        "click .copy": "copyClass"
    },
    initialize: function () {
        this.model.bind("change", function () { this.render(); }, this);
    },
    onRender: function () {
        if (this.model.isNew())
            this.showEditableAreas();
        else
            this.showValuesAreas();
    },
    template: "device-class-list-item-template",
    tagName: "tr",
    editClass: function () {
        this.showEditableAreas();
    },
    closeEdition: function () {
        if (this.model.isNew())
            this.model.destroy();
        else
            this.showValuesAreas();
    },
    showEditableAreas: function () {
        this.$el.find(".value-field").hide();
        this.$el.find(".new-value").show();
        this.$el.find(".isPermanent").removeAttr("disabled");

    },
    showValuesAreas: function () {
        //fields
        this.$el.find(".value-field").show();
        this.$el.find(".new-value").hide();
        this.$el.find(".isPermanent").attr("disabled", "disabled");

    },
    saveClass: function () {
        var name = this.$el.find(".new-name").val();
        var version = this.$el.find(".new-version").val();
        var isPermanent = this.$el.find(".isPermanent").is(":checked");

        var options = {
            name: name,
            version: version,
            isPermanent: isPermanent
        };

        this.model.save(options, {
            error: function (model, response) {
                app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
            },
            wait: true
        });
    },
    deleteClass: function () {
        if (confirm("are you realy want to delete this device class? This changes can not be undone."))
            this.model.destroy({
                error: function (model, response) {
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                }
            });
    },
    copyClass: function () {
        var that = this;
        var oldProps = this.model.toJSON();
        oldProps.version = oldProps.version + "(copy)";
        delete oldProps.id;

        //fetch equipments and copy everything after it
        this.model.getEquipments(function (equipColl) {
            //copy device class
            var newDc = new app.Models.DeviceClass(oldProps);
            newDc.save(null, {
                success: function () {
                    var len = equipColl.length;

                    //all stuff below can be simplified. 
                    //It is possible to don't track the equipments creating before adding device class to collection

                    //render device class for edition if there is no equimpents attached
                    if (len == 0) {
                        that.model.collection.add(newDc);
                    }
                    else {
                        //copy all equipments, then render device class for edition
                        _.each(equipColl.models, function (curEquip) {
                            var newattrs = _.clone(curEquip);
                            delete newattrs.id;
                            newattrs.deviceClass = newDc;
                            var newEquipment = new app.Models.Equipment(newattrs);
                            newEquipment.save(null,
                                    {
                                        error: function (notMod, notResp) {
                                            app.vent.trigger("notification", app.Enums.NotificationType.Error, notResp);
                                        },
                                        success: function () {
                                            len--;
                                            if (len == 0) {
                                                that.model.collection.add(newDc);
                                            }
                                        }
                                    });
                        });
                    }
                },
                error: function (model, response) {
                    app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
                }
            });
        });
    }
});

//collection is an app.Models.DeviceClassesCollection
app.Views.DeviceClasses = Backbone.Marionette.CompositeView.extend({
    events: {
        "click .add": "addNewClass"
    },
    itemView: app.Views.DeviceClassesListItem,
    template: "device-class-template",
    emptyView: Backbone.Marionette.ItemView.extend(
        {
            render: function () {
                this.$el.html("<td colspan='4'>there are no device classes has been registered yet. Create first one!</td>");
                return this;
            },
            tagName: "tr"
        }),
    itemViewContainer: "tbody",
    addNewClass: function() {
        this.collection.add(new app.Models.DeviceClass());    
    }
});

