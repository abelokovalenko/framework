﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using DeviceHive.API.Filters;
using DeviceHive.API.Mapping;
using DeviceHive.Data.Model;
using Newtonsoft.Json.Linq;

namespace DeviceHive.API.Controllers
{
    /// <resource cref="DeviceClass" />
    public class DeviceClassController : BaseController
    {
        /// <name>list</name>
        /// <summary>
        /// Gets list of device classes.
        /// </summary>
        /// <returns cref="DeviceClass">If successful, this method returns array of <see cref="DeviceClass"/> resources in the response body.</returns>
        [AuthorizeUser(Roles = "Administrator")]
        public JArray Get()
        {
            return new JArray(DataContext.DeviceClass.GetAll().Select(dc => Mapper.Map(dc)));
        }

        /// <name>get</name>
        /// <summary>
        /// Gets information about device class and its equipment.
        /// </summary>
        /// <param name="id">Device class identifier.</param>
        /// <returns cref="DeviceClass">If successful, this method returns a <see cref="DeviceClass"/> resource in the response body.</returns>
        /// <response>
        ///     <parameter name="equipment" type="array" cref="Equipment">Array of equipment included into devices of the current class.</parameter>
        /// </response>
        [AuthorizeUser]
        public JObject Get(int id)
        {
            var deviceClass = DataContext.DeviceClass.Get(id);
            if (deviceClass == null)
                ThrowHttpResponse(HttpStatusCode.NotFound, "Device class not found!");

            var jDeviceClass = Mapper.Map(deviceClass);

            var equipmentMapper = GetMapper<Equipment>();
            var equipment = DataContext.Equipment.GetByDeviceClass(id);
            jDeviceClass["equipment"] = new JArray(equipment.Select(e => equipmentMapper.Map(e)));
            return jDeviceClass;
        }

        /// <name>insert</name>
        /// <summary>
        /// Creates new device class.
        /// </summary>
        /// <param name="json" cref="DeviceClass">In the request body, supply a <see cref="DeviceClass"/> resource.</param>
        /// <returns cref="DeviceClass">If successful, this method returns a <see cref="DeviceClass"/> resource in the response body.</returns>
        [HttpCreatedResponse]
        [AuthorizeUser(Roles = "Administrator")]
        public JObject Post(JObject json)
        {
            var deviceClass = Mapper.Map(json);
            Validate(deviceClass);

            if (DataContext.DeviceClass.Get(deviceClass.Name, deviceClass.Version) != null)
                ThrowHttpResponse(HttpStatusCode.Forbidden, "Device class with such name and version already exists!");

            DataContext.DeviceClass.Save(deviceClass);
            return Mapper.Map(deviceClass);
        }

        /// <name>update</name>
        /// <summary>
        /// Updates an existing device class.
        /// </summary>
        /// <param name="id">Device class identifier.</param>
        /// <param name="json" cref="DeviceClass">In the request body, supply a <see cref="DeviceClass"/> resource.</param>
        /// <returns cref="DeviceClass">If successful, this method returns a <see cref="DeviceClass"/> resource in the response body.</returns>
        /// <request>
        ///     <parameter name="name" required="false" />
        ///     <parameter name="version" required="false" />
        ///     <parameter name="isPermanent" required="false" />
        /// </request>
        [AuthorizeUser(Roles = "Administrator")]
        public JObject Put(int id, JObject json)
        {
            var deviceClass = DataContext.DeviceClass.Get(id);
            if (deviceClass == null)
                ThrowHttpResponse(HttpStatusCode.NotFound, "Device class not found!");

            Mapper.Apply(deviceClass, json);
            Validate(deviceClass);

            var existing = DataContext.DeviceClass.Get(deviceClass.Name, deviceClass.Version);
            if (existing != null && existing.ID != deviceClass.ID)
                ThrowHttpResponse(HttpStatusCode.Forbidden, "Device class with such name and version already exists!");

            DataContext.DeviceClass.Save(deviceClass);
            return Mapper.Map(deviceClass);
        }

        /// <name>delete</name>
        /// <summary>
        /// Deletes an existing device class.
        /// </summary>
        /// <param name="id">Device class identifier.</param>
        [HttpNoContentResponse]
        [AuthorizeUser(Roles = "Administrator")]
        public void Delete(int id)
        {
            DataContext.DeviceClass.Delete(id);
        }

        private IJsonMapper<DeviceClass> Mapper
        {
            get { return GetMapper<DeviceClass>(); }
        }
    }
}