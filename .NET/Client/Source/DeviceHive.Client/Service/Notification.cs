﻿using System;
using System.Collections.Generic;

namespace DeviceHive.Client
{
    /// <summary>
    /// Represents a DeviceHive notification.
    /// Notifications are sent by devices to clients.
    /// </summary>
    public class Notification
    {
        #region Public Properties

        /// <summary>
        /// Gets or sets notification identifier (server-assigned).
        /// </summary>
        public int? Id { get; set; }

        /// <summary>
        /// Gets or sets notification timestamp (server-assigned).
        /// </summary>
        public DateTime? Timestamp { get; set; }

        /// <summary>
        /// Gets or sets notification name.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets notification parameters.
        /// </summary>
        public Dictionary<string, string> Parameters { get; set; }

        #endregion

        #region Public Methods

        /// <summary>
        /// Gets a value of notification parameter with specified name.
        /// </summary>
        /// <param name="name">Parameter name.</param>
        /// <returns>Parameter value.</returns>
        public string GetParameter(string name)
        {
            if (name == null)
                throw new ArgumentNullException("name");

            if (Parameters == null)
                return null;

            string value = null;
            Parameters.TryGetValue(name, out value);
            return value;
        }

        /// <summary>
        /// Gets a value of notification parameter with specified name.
        /// </summary>
        /// <typeparam name="TValue">Type of the value.</typeparam>
        /// <param name="name">Parameter name.</param>
        /// <returns>Parameter value.</returns>
        public TValue GetParameter<TValue>(string name)
        {
            string stringValue = GetParameter(name);
            if (stringValue == null)
            {
                return default(TValue);
            }
            if (typeof(TValue) == typeof(byte[]))
            {
                return (TValue)(object)Convert.FromBase64String(stringValue);
            }
            return TypeConverter.Parse<TValue>(stringValue);
        }
        #endregion
    }
}
