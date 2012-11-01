﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DeviceHive.API.Business;
using DeviceHive.API.Filters;
using DeviceHive.API.Mapping;
using DeviceHive.Data.Model;
using Newtonsoft.Json.Linq;
using Ninject;

namespace DeviceHive.API.Controllers
{
    /// <resource cref="DeviceCommand" />
    public class DeviceCommandPollController : BaseController
    {
        private ObjectWaiter<DeviceCommand> _commandWaiter;
        private static readonly TimeSpan _timeout = TimeSpan.FromSeconds(30);

        public DeviceCommandPollController(ObjectWaiter<DeviceCommand> commandWaiter)
        {
            _commandWaiter = commandWaiter;
        }

        /// <name>poll</name>
        /// <summary>
        ///     <para>Polls new device commands.</para>
        ///     <para>This method returns all device commands that were created after specified timestamp.</para>
        ///     <para>In the case when no commands were found, the method blocks until new command is received.
        ///         The blocking period is limited (currently 30 seconds), and the server returns empty response if no commands are received.
        ///         In this case, to continue polling, the client should repeat the call with the same timestamp value.
        ///     </para>
        /// </summary>
        /// <param name="deviceGuid">Device unique identifier.</param>
        /// <param name="timestamp">Timestamp of the last received command (UTC). If not specified, the server's timestamp is taken instead.</param>
        /// <returns cref="DeviceCommand">If successful, this method returns array of <see cref="DeviceCommand"/> resources in the response body.</returns>
        [AuthorizeDeviceOrUser]
        public JArray Get(Guid deviceGuid, DateTime? timestamp = null) 
        {
            EnsureDeviceAccess(deviceGuid);

            var device = DataContext.Device.Get(deviceGuid);
            if (device == null || !IsNetworkAccessible(device.NetworkID))
                ThrowHttpResponse(HttpStatusCode.NotFound, "Device not found!");

            var start = timestamp != null ? timestamp.Value.AddTicks(10) : DateTime.UtcNow;

            var result = _commandWaiter.WaitForObjects(device.ID, () => DataContext.DeviceCommand.GetByDevice(device.ID, start, null), _timeout);
            return new JArray(result.Select(n => Mapper.Map(n)));
        }

        private IJsonMapper<DeviceCommand> Mapper
        {
            get { return GetMapper<DeviceCommand>(); }
        }
    }
}