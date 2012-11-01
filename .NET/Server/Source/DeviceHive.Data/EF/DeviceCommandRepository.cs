﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using DeviceHive.Data.Model;
using DeviceHive.Data.Repositories;

namespace DeviceHive.Data.EF
{
    public class DeviceCommandRepository : IDeviceCommandRepository
    {
        public List<DeviceCommand> GetByDevice(int deviceId, DateTime? start, DateTime? end)
        {
            using (var context = new DeviceHiveContext())
            {
                var query = context.DeviceCommands.Where(e => e.Device.ID == deviceId);
                if (start != null)
                    query = query.Where(e => e.Timestamp >= start.Value);
                if (end != null)
                    query = query.Where(e => e.Timestamp <= end.Value);
                return query.ToList();
            }
        }

        public DeviceCommand Get(int id)
        {
            using (var context = new DeviceHiveContext())
            {
                return context.DeviceCommands.Find(id);
            }
        }

        public void Save(DeviceCommand command)
        {
            if (command == null)
                throw new ArgumentNullException("command");

            using (var context = new DeviceHiveContext())
            {
                context.Devices.Attach(command.Device);
                context.DeviceCommands.Add(command);
                if (command.ID > 0)
                {
                    context.Entry(command).State = EntityState.Modified;
                }
                context.SaveChanges();
            }
        }

        public void Delete(int id)
        {
            using (var context = new DeviceHiveContext())
            {
                var command = context.DeviceCommands.Find(id);
                if (command != null)
                {
                    context.DeviceCommands.Remove(command);
                    context.SaveChanges();
                }
            }
        }
    }
}
