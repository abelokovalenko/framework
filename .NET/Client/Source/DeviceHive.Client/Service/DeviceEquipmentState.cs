﻿using System;
using System.Collections.Generic;

namespace DeviceHive.Client
{
	/// <summary>
	/// Represents information about the current state of particular device equipment.
    /// The DeviceHive service tracks the state of device equipment if device sends "equipment" notifications.
	/// </summary>
	public class DeviceEquipmentState
    {
        #region Public Properties

        /// <summary>
        /// Gets or sets equipment code.
        /// </summary>
        public string Id { get; set; }

		/// <summary>
		/// Gets equipment state timestamp
		/// </summary>
		public DateTime? Timestamp { get; set; }

		/// <summary>
		/// Gets equipment state parameters
		/// </summary>
		public Dictionary<string, string> Parameters { get; set; }

        #endregion

        #region Public Methods

        /// <summary>
        /// Gets a value of equipment state parameter with specified name.
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
        /// Gets a value of equipment state parameter with specified name.
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
