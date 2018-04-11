import notEmpty from "./_helpers/notEmpty";
import formatDate from "./_helpers/formatDate";
import pymod from "./_helpers/pymod";
import isLeapYear from "./_helpers/isLeapYear";

/**
 * Implementation of RRULE as defined by RFC 5545 (iCalendar).
 * Based on rlanvin/php-rrule
 *
 * Some useful terms to understand the algorithms and variables naming:
 *
 * - "yearday" = day of the year, from 0 to 365 (on leap years) - `date('z')`
 * - "weekday" = day of the week (ISO-8601), from 1 (MO) to 7 (SU) - `date('N')`
 * - "monthday" = day of the month, from 1 to 31
 * - "wkst" = week start, the weekday (1 to 7) which is the first day of week.
 *          Default is Monday (1). In some countries it's Sunday (7).
 * - "weekno" = number of the week in the year (ISO-8601)
 *
 *
 * @link https://tools.ietf.org/html/rfc5545
 * @link https://labix.org/python-dateutil
 * @link https://github.com/rlanvin/php-rrule/blob/master/src/RRule.php
 */
export default class RRule {
	
	// Properties
	// =========================================================================
	
	static get SECONDLY () { return 7; }
	static get MINUTELY () { return 6; }
	static get HOURLY () { return 5; }
	static get DAILY () { return 4; }
	static get WEEKLY () { return 3; }
	static get MONTHLY () { return 2; }
	static get YEARLY () { return 1; }
	
	/**
	 * Frequency names.
	 * Used internally for conversion but public if a reference list is needed.
	 *
	 * @type {Object} The name as the key
	 */
	static get frequencies () {
		return {
			SECONDLY: this.SECONDLY,
			MINUTELY: this.MINUTELY,
			HOURLY:   this.HOURLY,
			DAILY:    this.DAILY,
			WEEKLY:   this.WEEKLY,
			MONTHLY:  this.MONTHLY,
			YEARLY:   this.YEARLY,
		};
	};
	
	/**
	 * Weekdays numbered from 1 (ISO-8601).
	 * Used internally but public if a reference list is needed.
	 *
	 * @type {Object} The name as the key
	 */
	static get weekDays () {
		return {
			MO: 1,
			TU: 2,
			WE: 3,
			TH: 4,
			FR: 5,
			SA: 6,
			SU: 7,
		};
	};
	
	/**
	 * @type {Object} Original rule
	 * @private
	 */
	_rule = {
		DTSTART:    null,
		FREQ:       null,
		UNTIL:      null,
		COUNT:      null,
		INTERVAL:   1,
		BYSECOND:   null,
		BYMINUTE:   null,
		BYHOUR:     null,
		BYDAY:      null,
		BYMONTHDAY: null,
		BYYEARDAY:  null,
		BYWEEKNO:   null,
		BYMONTH:    null,
		BYSETPOS:   null,
		WKST:       "MO",
	};
	
	// Parsed and validated values
	_dtstart = null;
	_freq = null;
	_until = null;
	_count = null;
	_interval = null;
	_bysecond = null;
	_byminute = null;
	_byhour = null;
	_byweekday = null;
	_byweekdayNth = null;
	_bymonthday = null;
	_bymonthdayNegative = null;
	_byyearday = null;
	_byweekno = null;
	_bymonth = null;
	_bysetpos = null;
	_wkst = null;
	_timeset = null;
	
	// Cache variables
	_total = null;
	_cache = {};
	
	// Public Functions
	// =========================================================================
	
	/**
	 * The constructor needs the entire rule at once.
	 * There is no setter after the class has been instantiated,
	 * because in order to validate some BYxxx parts, we need to know
	 * the value of some other parts (FREQ or other BYxxx parts).
	 *
	 * @param {Object|string} parts - An object of the parts or an RFC string
	 * @param {Date=} dtstart - The start date
	 */
	constructor (parts, dtstart = null) {
		
		if (typeof parts === "string") {
			// TODO: Parse string -> RfcParser::parseRRule
		} else {
			if (dtstart)
				throw new Error(
					"dtstart param has no effect if not constructing from a string."
				);
			
			if (typeof parts !== "object" && parts.constructor === Object)
				throw new Error("parts param must be an object or a string.");
			
			// Ensure all keys are upper-case
			for (let key in parts) {
				const upper = key.toUpperCase();
				
				if (key === upper)
					continue;
				
				parts[upper] = parts[key];
				delete parts[key];
			}
		}
		
		// Validate extra parts
		// ---------------------------------------------------------------------
		
		const partKeys = Object.keys(parts);
		const invalidKeys = Object.keys(this._rule).filter(i => ~partKeys.indexOf(i));
		
		if (invalidKeys.length)
			throw new Error(
				"Unsupported parameter(s): "
				+ invalidKeys.join(", ")
			);
		
		// Merge with & save original rule
		// ---------------------------------------------------------------------
		
		parts = {
			...this._rule,
			...parts,
		};
		
		this._rule = parts;
		
		// WKST
		// ---------------------------------------------------------------------
		
		parts.WKST = parts.WKST.toUpperCase();
		
		if (!RRule.weekDays.hasOwnProperty(parts.WKST))
			throw new Error(
				"The WKST rule part must be one of the following: "
				+ Object.keys(RRule.weekDays).join(", ")
			);
		
		this._wkst = RRule.weekDays[parts.WKST];
		
		// FREQ
		// ---------------------------------------------------------------------
		
		if (typeof parts.FREQ === "number") {
			if (parts.FREQ > RRule.SECONDLY || parts.FREQ < RRule.YEARLY)
				throw new Error(
					"The FREQ rule part must be one of the following: "
					+ Object.keys(RRule.frequencies).join(", ")
				);
			
			this._freq = parts.FREQ;
		}
		
		else { // String
			parts.FREQ = parts.FREQ.toUpperCase();
			
			if (!RRule.frequencies.hasOwnProperty(parts.FREQ))
				throw new Error(
					"The FREQ rule part must be one of the following: "
					+ Object.keys(RRule.frequencies).join(", ")
				);
			
			this._freq = RRule.frequencies[parts.FREQ];
		}
		
		// INTERVAL
		// ---------------------------------------------------------------------
		
		if (!Number.isInteger(+parts.INTERVAL) || parts.INTERVAL|0 < 1)
			throw new Error(
				"The INTERVAL rule part must be a positive integer (> 0)"
			);
		
		this._interval = parts.INTERVAL|0;
		
		// DTSTART
		// ---------------------------------------------------------------------
		
		if (parts.DTSTART) {
			try {
				this._dtstart = RRule.parseDate(parts.DTSTART);
			} catch (e) {
				throw new Error(
					"Failed to parse DTSTART. It must be a valid date or timestamp."
				);
			}
		}
		
		else {
			this._dtstart = new Date();
		}
		
		// UNTIL (optional)
		// ---------------------------------------------------------------------
		
		if (parts.UNTIL) {
			try {
				this._until = RRule.parseDate(parts.UNTIL);
			} catch (e) {
				throw new Error(
					"Failed to parse UNTIL. It must be a valid date or timestamp."
				);
			}
		}
		
		// COUNT (optional)
		// ---------------------------------------------------------------------
		
		if (parts.COUNT) {
			if (!Number.isInteger(+parts.COUNT) || parts.COUNT|0 < 1)
				throw new Error("COUNT must be a positive integer (> 0)");
			
			this._count = parts.COUNT|0;
		}
		
		if (this._until && this._count)
			throw new Error(
				"The UNTIL or COUNT rule parts MUST NOT occur in the same rule"
			);
		
		// BYxxx
		// ---------------------------------------------------------------------
		
		// Infer necessary BYxxx rules from DTSTART, if not provided
		if (
			!(
				notEmpty(parts.BYWEEKNO)
				|| notEmpty(parts.BYYEARDAY)
				|| notEmpty(parts.BYMONTHDAY)
				|| notEmpty(parts.BYDAY)
			)
		) {
			switch (this._freq) {
				case RRule.YEARLY:
					if (!notEmpty(parts.BYMONTH))
						parts.BYMONTH = [formatDate(this._dtstart, "m")];
					
					parts.BYMONTHDAY = [formatDate(this._dtstart, "j")];
					break;
					
				case RRule.MONTHLY:
					parts.BYMONTHDAY = [formatDate(this._dtstart, "j")];
					break;
					
				case RRule.WEEKLY:
					const n = formatDate(this._dtstart, "N");
					parts.BYDAY = RRule.weekDays.hasOwnProperty(n)
					              ? [RRule.weekDays[n]]
					              : [];
					break;
			}
		}
		
		// BYDAY (translated to byweekday for convenience)
		// ---------------------------------------------------------------------
		
		if (notEmpty(parts.BYDAY)) {
			if (!Array.isArray(parts.BYDAY))
				parts.BYDAY = parts.BYDAY.split(",");
			
			this._byweekday = [];
			this._byweekdayNth = [];
			
			for (let i = 0, l = parts.BYDAY.length; i < l; ++i) {
				let value = parts.BYDAY[i];
				value = value.toUpperCase().trim();
				
				const matches = /^([+-]?[0-9]+)?([A-Z]{2})$/.exec(value);
				if (
					!matches
					|| (
						notEmpty(matches[1])
						&& (
							+matches[1] === 0
							|| +matches[1] > 53
							|| +matches[1] < -53
						)
					)
					|| RRule.weekDays.hasOwnProperty(matches[2])
				) {
					throw new Error("Invalid BYDAY value: " + value);
				}
				
				if (matches[1]) {
					this._byweekdayNth.push(
						[RRule.weekDays[matches[2]], +matches[1]]
					);
				}
				
				else {
					this._byweekday.push(RRule.weekDays[matches[2]]);
				}
			}
			
			if (this._byweekdayNth.length) {
				if (!(this._freq === RRule.MONTHLY || this._freq === RRule.YEARLY))
					throw new Error(
						"The BYDAY rule part MUST NOT be specified with a numeric value when the FREQ rule part is not set to MONTHLY or YEARLY."
					);
				
				if (this._freq === RRule.YEARLY && notEmpty(parts.BYWEEKNO))
					throw new Error(
						"The BYDAY rule part MUST NOT be specified with a numeric value with the FREQ rule part set to YEARLY when the BYWEEKNO rule part is specified."
					);
			}
		}
		
		// BYMONTHDAY
		// ---------------------------------------------------------------------
		
		// The BYMONTHDAY rule part specifies a COMMA-separated list of days
		// of the month. Valid values are 1 to 31 or -31 to -1. For example,
		// -10 represents the tenth to the last day of the month.
		// The BYMONTHDAY rule part MUST NOT be specified when the FREQ rule
		// part is set to WEEKLY.
		
		if (notEmpty(parts.BYMONTHDAY)) {
			if (this._freq === RRule.WEEKLY)
				throw new Error(
					"The BYMONTHDAY rule part MUST NOT be specified when the FREQ rule part is set to WEEKLY."
				);
			
			if (!Array.isArray(parts.BYMONTHDAY))
				parts.BYMONTHDAY = parts.BYMONTHDAY.split(",");
			
			this._bymonthday = [];
			this._bymonthdayNegative = [];
			
			for (let i = 0, l = parts.BYMONTHDAY.length; i < l; ++i) {
				let value = parts.BYMONTHDAY[i];
				
				if (
					!value
					|| !Number.isInteger(+value)
					|| value|0 < -31
					|| value|0 > 31
				) {
					throw new Error(
						`Invalid BYMONTHDAY value: ${value} (valid values are 1 to 31 or -31 to -1)`
					);
				}
				
				value = value|0;
				
				if (value < 0) {
					this._bymonthdayNegative.push(value);
				}
				
				else {
					this._bymonthday.push(value);
				}
			}
		}
		
		// BYYEARDAY
		// ---------------------------------------------------------------------
		
		if (notEmpty(parts.BYYEARDAY)) {
			if (
				this._freq === RRule.DAILY
				|| this._freq === RRule.WEEKLY
				|| this._freq === RRule.MONTHLY
			) {
				throw new Error(
					"The BYYEARDAY rule part MUST NOT be specified when the FREQ rule part is set to DAILY, WEEKLY, or MONTHLY."
				);
			}
			
			if (!Array.isArray(parts.BYYEARDAY))
				parts.BYYEARDAY = parts.BYYEARDAY.split(",");
			
			this._byyearday = [];
			
			for (let i = 0, l = parts.BYYEARDAY.length; i < l; ++i) {
				const value = parts.BYYEARDAY[i];
				
				if (
					!value
					|| !Number.isInteger(+value)
					|| value|0 < -366
					|| value|0 > 366
				) {
					throw new Error(
						`Invalid BYYEARDAY value: ${value} (valid values are 1 to 366 or -366 to -1)`
					);
				}
				
				this._byyearday.push(value|0);
			}
		}
		
		// BYWEEKNO
		// ---------------------------------------------------------------------
		
		if (notEmpty(parts.BYWEEKNO)) {
			if (this._freq !== RRule.YEARLY)
				throw new Error(
					"The BYWEEKNO rule part MUST NOT be used when the FREQ rule part is set to anything other than YEARLY."
				);
			
			if (!Array.isArray(parts.BYWEEKNO))
				parts.BYWEEKNO = parts.BYWEEKNO.split(",");
			
			this._byweekno = [];
			
			for (let i = 0, l = parts.BYWEEKNO.length; i < l; ++i) {
				const value = parts.BYWEEKNO[i];
				
				if (
					!value
					|| !Number.isInteger(+value)
					|| value|0 < -53
					|| value|0 > 53
				) {
					throw new Error(
						`Invalid BYWEEKNO value: ${value} (valid values are 1 to 53 or -53 to -1)`
					);
				}
				
				this._byweekno.push(value|0);
			}
		}
		
		// BYMONTH
		// ---------------------------------------------------------------------
		
		if (notEmpty(parts.BYMONTH)) {
			if (!Array.isArray(parts.BYMONTH))
				parts.BYMONTH = parts.BYMONTH.split(",");
			
			this._bymonth = [];
			
			for (let i = 0, l = parts.BYMONTH.length; i < l; ++i) {
				const value = parts.BYMONTH[i];
				
				if (
					!value
					|| !Number.isInteger(+value)
					|| value|0 < 1
					|| value|0 > 12
				) {
					throw new Error(`Invalid BYMONTH value: ${value}`);
				}
				
				this._bymonth.push(value|0);
			}
		}
		
		// BYSETPOS
		// ---------------------------------------------------------------------
		
		if (notEmpty(parts.BYSETPOS)) {
			if (
				!(
					notEmpty(parts.BYWEEKNO)
					|| notEmpty(parts.BYYEARDAY)
					|| notEmpty(parts.BYMONTHDAY)
					|| notEmpty(parts.BYDAY)
					|| notEmpty(parts.BYMONTH)
					|| notEmpty(parts.BYHOUR)
					|| notEmpty(parts.BYMINUTE)
					|| notEmpty(parts.BYSETPOS)
				)
			) {
				throw new Error(
					"The BYSETPOS rule part MUST only be used in conjunction with another BYxxx rule part."
				);
			}
			
			if (!Array.isArray(parts.BYSETPOS))
				parts.BYSETPOS = parts.BYSETPOS.split(",");
			
			this._bysetpos = [];
			
			for (let i = 0, l = parts.BYSETPOS.length; i < l; ++i) {
				const value = parts.BYSETPOS[i];
				
				if (
					!value
					|| !Number.isInteger(+value)
					|| value|0 < -366
					|| value|0 > 366
				) {
					throw new Error(
						`Invalid BYSETPOS value: ${value} (valid values are 1 to 366 or -366 to -1)`
					);
				}
				
				this._bysetpos.push(value|0);
			}
		}
		
		// BYHOUR
		// ---------------------------------------------------------------------
		
		if (notEmpty(parts.BYHOUR)) {
			if (!Array.isArray(parts.BYHOUR))
				parts.BYHOUR = parts.BYHOUR.split(",");
			
			this._byhour = [];
			
			for (let i = 0, l = parts.BYHOUR.length; i < l; ++i) {
				const value = parts.BYHOUR[i];
				
				if (
					!value
					|| !Number.isInteger(+value)
					|| value|0 < 0
					|| value|0 > 23
				) {
					throw new Error(
						`Invalid BYHOUR value: ${value}`
					);
				}
				
				this._byhour.push(value|0);
			}
			
			this._byhour.sort((a, b) => a - b);
		}
		
		else if (this._freq === RRule.HOURLY) {
			this._byhour = [formatDate(this._dtstart, "G")|0];
		}
		
		// BYMINUTE
		// ---------------------------------------------------------------------
		
		if (notEmpty(parts.BYMINUTE)) {
			if (!Array.isArray(parts.BYMINUTE))
				parts.BYMINUTE = parts.BYMINUTE.split(",");
			
			this._byminute = [];
			
			for (let i = 0, l = parts.BYMINUTE.length; i < l; ++i) {
				const value = parts.BYMINUTE[i];
				
				if (
					!value
					|| !Number.isInteger(+value)
					|| value|0 < 0
					|| value|0 > 59
				) {
					throw new Error(
						`Invalid BYMINUTE value: ${value}`
					);
				}
				
				this._byminute.push(value|0);
			}
			
			this._byminute.sort((a, b) => a - b);
		}
		
		else if (this._freq === RRule.MINUTELY) {
			this._byminute = [formatDate(this._dtstart, "i")|0];
		}
		
		// BYSECOND
		// ---------------------------------------------------------------------
		
		if (notEmpty(parts.BYSECOND)) {
			if (!Array.isArray(parts.BYSECOND))
				parts.BYSECOND = parts.BYSECOND.split(",");
			
			this._bysecond = [];
			
			for (let i = 0, l = parts.BYSECOND.length; i < l; ++i) {
				const value = parts.BYSECOND[i];
				
				// Yes, 60 is a valid value, in (very rare) cases on leap seconds
				// December 31, 2005 23:59:60 UTC is a valid date...
				// so is 2012-06-30T23:59:60UTC
				
				if (
					!value
					|| !Number.isInteger(+value)
					|| value|0 < 0
					|| value|0 > 60
				) {
					throw new Error(
						`Invalid BYSECOND value: ${value}`
					);
				}
				
				this._bysecond.push(value|0);
			}
			
			this._bysecond.sort((a, b) => a - b);
		}
		
		else if (this._freq === RRule.SECONDLY) {
			this._bysecond = [formatDate(this._dtstart, "s")|0];
		}
		
		// Frequencies DAILY and above
		// ---------------------------------------------------------------------
		
		if (this._freq < RRule.HOURLY) {
			// For frequencies DAILY, WEEKLY, MONTHLY AND YEARLY, we can build
			// an array of every time of the day at which there should be an
			// occurrence - default, if no BYHOUR / BYMINUTE / BYSECOND are
			// provided is only one time, and it's the DTSTART time. This is a
			// cached version if you will, since it'll never change at
			// these frequencies.
			
			this._timeset = [];
			
			for (const hour of this._byHour)
				for (const minute of this._byMinute)
					for (const second of this._bySecond)
						this._timeset.push([hour, minute, second]);
		}
		
	}
	
	/**
	 * Gets the internal rule object, as it was passed to the constructor.
	 *
	 * @return {Object}
	 */
	get rule () {
		return this._rule;
	}
	
	/**
	 * Magic string converter
	 *
	 * @see RRule.rfcString()
	 * @return {string}
	 */
	toString () {
		return this.rfcString();
	}
	
	/**
	 * Format a rule according to RFC 5545
	 *
	 * @param {boolean=} includeTimezone - Whether to generate a rule with
	 *      timezone identifier on DTSTART (and UNTIL) or not.
	 *
	 * @return {string}
	 */
	rfcString (includeTimezone = true) {
		// ...
	}
	
	// Internal Functions
	// =========================================================================
	
	/**
	 * Convert any date into a JS Date in UTC.
	 *
	 * @param {*} rawDate
	 * @return {Date}
	 */
	static parseDate (rawDate) {
		const date = new Date(rawDate);
		
		if (isNaN(date.getTime()))
			throw new Error("Unable to parse date: " + rawDate);
		
		return new Date(date.toUTCString());
	}
	
}
