import notEmpty from "./_helpers/notEmpty";
import formatDate from "./_helpers/formatDate";
import pymod from "./_helpers/pymod";
import isLeapYear from "./_helpers/isLeapYear";
import RSet from "./RSet";
import dateDiff from "./_helpers/dateDiff";
import range from "./_helpers/range";

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
	_cache = [];
	
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
			
			for (const hour of this._byhour)
				for (const minute of this._byminute)
					for (const second of this._bysecond)
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
		let str = "";
		
		if (this._dtstart) {
			if (!includeTimezone) {
				str = `DTSTART:${formatDate(this._dtstart, "Ymd\THis")}\nRRULE:`;
			}
			
			else {
				str = `DTSTART:${formatDate(this._dtstart, "Ymd\THis\Z")}\nRRULE:`;
			}
		}
		
		const parts = [];
		
		for (const key in this._rule) {
			let value = this._rule[key];
			
			if (
				key === "DTSTART"
				|| (key === "INTERVAL" && value === 1)
				|| (key === "WKST" && value === "MO")
			) continue;
			
			if (key === "UNTIL" && value) {
				if (!includeTimezone) {
					parts.push(`UNTIL:${formatDate(this._until, "Ymd\THis")}`);
				}
				
				else {
					parts.push(`UNTIL:${formatDate(this._until, "Ymd\THis\Z")}`);
				}
				
				continue;
			}
			
			if (
				key === "FREQ"
				&& value
				&& !~Object.keys(RRule.frequencies).indexOf(value)
			) {
				const index = Object.values(RRule.frequencies).indexOf(value);
				
				if (index > -1)
					value = Object.keys(RRule)[index];
			}
			
			if (value !== null) {
				if (Array.isArray(value))
					value = value.join(",");
				
				parts.push(`${key}=${value}`.toUpperCase().replace(/ /g, ""));
			}
		}
		
		str += parts.join(";");
		
		return str;
	}
	
	/**
	 * Takes an RFC 5545 string and returns either an RRule or an RSet
	 *
	 * @param {string} string - The RFC string
	 * @param {boolean=} forceRSet - Force an RSet to be returned
	 * @return {RRule|RSet}
	 */
	static createFromRfcString (string, forceRSet = false) {
		let cls = RSet;
		
		if (!forceRSet) {
			// Try to detect if we have an RRule or a Set
			const upperCasedString = string.toUpperCase();
			const nbRRule = upperCasedString.split("RRULE").length - 1;
			
			if (nbRRule === 0)
				cls = RRule;
			
			else if (nbRRule > 1)
				cls = RSet;
			
			else {
				cls = RRule;
				
				if (
					!~upperCasedString.indexOf("EXDATE")
					|| !~upperCasedString.indexOf("RDATE")
					|| !~upperCasedString.indexOf("EXRULE")
				) {
					cls = RSet;
				}
			}
		}
		
		return new cls(string);
	}
	
	/**
	 * Clear the cache
	 *
	 * It isn't recommended to use this method while iterating!
	 *
	 * @return {RRule}
	 */
	clearCache () {
		this._total = null;
		this._cache = [];
		
		return this;
	}
	
	// RRule Interface (if JS had interfaces)
	// =========================================================================
	
	/**
	 * Returns true of the RRule has an end condition, false otherwise
	 *
	 * @return {boolean}
	 */
	isFinite = () => !!(this._count || this._until);
	
	/**
	 * Returns true if the RRule has no end condition (infinite)
	 *
	 * @return {boolean}
	 */
	isInfinite = () => !this._count && !this._until;
	
	/**
	 * Return all the occurrences in an array of Date()'s
	 *
	 * @param {number|null=} limit - Limit the result set to n occurrences
	 *      (0, null, or false === everything)
	 * @return {Date[]}
	 */
	getOccurrences (limit = null) {
		if (!limit && this.isInfinite())
			throw new Error(
				"Cannot get all occurrences of an infinite recurrence rule!"
			);
		
		let iterator = this;
		
		// Cached version already computed
		if (this._total !== null)
			iterator = this._cache;
		
		const res = [];
		let n = 0;
		
		for (const occurrence of iterator) {
			res.push(new Date(occurrence.toUTCString()));
			++n;
			if (limit && n >= limit)
				break;
		}
		
		return res;
	}
	
	/**
	 * Return all the occurrences after a date, before a date, or
	 * between two dates
	 *
	 * @param {Date|null} begin - Return all occurrences after
	 * @param {Date|null} end - Return all occurrences before
	 * @param {number|null=} limit - Limit the result set to n occurrences
	 *      (0, null, or false === everything)
	 * @return {Array}
	 */
	getOccurrencesBetween (begin, end, limit = null) {
		if (begin !== null)
			begin = RRule.parseDate(begin);
		
		if (end !== null)
			end = RRule.parseDate(end);
		
		else if (!limit && this.isInfinite())
			throw new Error(
				"Cannot get all occurrences of an infinite recurrence rule!"
			);
		
		let iterator = this;
		
		if (this._total === null)
			iterator = this._cache;
		
		const res = [];
		let n = 0;
		
		for (const occurrence of iterator) {
			if (begin !== null && occurrence.getTime() < begin.getTime())
				continue;
			
			if (end !== null && occurrence.getTime() > end.getTime())
				break;
			
			res.push(new Date(occurrence.toUTCString()));
			++n;
			if (limit && n >= limit)
				break;
		}
		
		return res;
	}
	
	/**
	 * Return true if the date is an occurrence
	 *
	 * This method will attempt to determine the result programmatically.
	 * However depending on the BYxxx rule parts that have been set, it might
	 * not always be possible. As a last resort, this method will loop
	 * through all occurrences until date. This will incur some performance
	 * penalty.
	 *
	 * @param {Date|string} date
	 * @return {boolean}
	 */
	occursAt (date) {
		date = RRule.parseDate(date);
		const timestamp = date.getTime();
		
		// Check whether the date is in the cache
		// (whether the cache is complete or not)
		if (~this._cache.indexOf(date))
			return true;
		
		// If the cache is complete and doesn't contain the date
		else if (this._total !== null)
			return false;
		
		// Check if date is within start and until
		if (
			timestamp < this._dtstart.getTime()
			|| (this._until && timestamp > this._until.getTime())
		) return false;
		
		// Check against the BYxxx rules (except BYSETPOS)
		if (this._byhour && !~this._byhour.indexOf(formatDate(date, "G")|0))
			return false;
		
		if (this._byminute && !~this._byminute.indexOf(formatDate(date, "i")|0))
			return false;
		
		if (this._bysecond && !~this._bysecond.indexOf(formatDate(date, "s")|0))
			return false;
		
		// Create mask variable
		const [year, month, day, yearDay, weekday] = formatDate(
			date,
			"Y n j z N"
		).split(" ").map(n => n|0);
		
		const masks = {};
		
		masks["weekdayOf1stYearDay"] = formatDate(
			new Date(`${year}-01-01 00:00:00`),
			"N"
		);
		
		masks["yearDayToWeekday"] = RRule.WEEKDAY_MASK.slice(
			masks["weekdayOf1stYearDay"] - 1
		);
		
		if (isLeapYear(year)) {
			masks["yearLen"] = 366;
			masks["lastDayOfMonth"] = RRule.LAST_DAY_OF_MONTH_366;
		}
		
		else {
			masks["yearLen"] = 365;
			masks["lastDayOfMonth"] = RRule.LAST_DAY_OF_MONTH;
		}
		
		const monthLen =
			masks["lastDayOfMonth"][month] - masks["lastDayOfMonth"][month - 1];
		
		if (this._bymonth && !~this._bymonth.indexOf(month))
			return false;
		
		if (this._bymonthday || this._bymonthdayNegative) {
			const monthDayNegative = -1 * (monthLen - day + 1);
			
			if (
				!~this._bymonthday.indexOf(day)
				&& !~this._bymonthdayNegative.indexOf(monthDayNegative)
			) return false;
		}
		
		if (this._byyearday) {
			// Caution here, yearDay starts from 0
			const yearDayNegative = -1 * (masks["yearLen"] - yearDay);
			
			if (
				!~this._byyearday.indexOf(yearDay + 1)
				&& !~this._byyearday.indexOf(yearDayNegative)
			) return false;
		}
		
		if (this._byweekday || this._byweekdayNth) {
			this._buildNthWeekdayMask(year, month, day, masks);
			
			if (
				!~this._byweekday.indexOf(weekday)
				&& !~masks["yearDayIsNthWeekday"].indexOf(yearDay)
			) return false;
		}
		
		if (this._byweekno) {
			this._buildWeekNoMask(year, month, day, masks);
			
			if (!~masks["yearDayIsInWeekNo"].indexOf(yearDay))
				return false;
		}
		
		// Now we've exhausted all the BYxxx rules (except BYSETPOS), we still
		// need to consider FREQUENCY and INTERVAL.
		const [startYear, startMonth/*, startDay*/] = formatDate(
			this._dtstart,
			"Y-m-d"
		).split("-").map(n => n|0);
		
		switch (this._freq) {
			case RRule.YEARLY:
				if ((year - startYear) % this._interval !== 0)
					return false;
				break;
			
			case RRule.MONTHLY: {
				// We need to count the number of months elapsed
				const diff = (12 - startMonth) + 12 * (year - startYear - 1) + month;
				
				if ((diff % this._interval) !== 0)
					return false;
				break;
			}
			
			case RRule.WEEKLY: {
				// Count the number of days and divide by 7 to get the number of
				// weeks. We add some days to align DTSTART with WKST.
				let diff = dateDiff(date, this._dtstart);
				diff = (
					(diff.days + pymod(
						(formatDate(this._dtstart, "N")|0) - this._wkst,
						7
					)) / 7
		        )|0;
				
				if (diff % this._interval !== 0)
					return false;
				break;
			}
			
			case RRule.DAILY: {
				// Count the number of days
				const diff = dateDiff(date, this._dtstart);
				if (diff.days % this._interval !== 0)
					return false;
				break;
			}
			
			case RRule.HOURLY: {
				let diff = dateDiff(date, this._dtstart);
				diff = diff.hours + diff.days * 24;
				if (diff % this._interval !== 0)
					return false;
				break;
			}
			
			case RRule.MINUTELY: {
				let diff = dateDiff(date, this._dtstart);
				diff = diff.minutes + diff.hours * 60 + diff.days * 1440;
				if (diff % this._interval !== 0)
					return false;
				break;
			}
			
			case RRule.SECONDLY: {
				let diff = dateDiff(date, this._dtstart);
				// XXX doesn't count for leap seconds (should it?)
				diff = diff.seconds + diff.minutes * 60 + diff.hours * 3600 + diff.days * 86400;
				if (diff % this._interval !== 0)
					return false;
				break;
			}
			
			default:
				throw new Error(`Invalid frequency: ${this._freq}`);
		}
		
		// Now we are left with 2 rules: BYSETPOS and COUNT
		//
		// - I think BYSETPOS *could* be determined without looping by
		// considering the current set, calculating all the occurrences of the
		// current set and determining the position of $date in the result set.
		// However I'm not convinced it's worth it.
		//
		// - I don't see any way to determine COUNT programmatically, because
		// occurrences might sometimes be dropped (e.g. a 29 Feb on a normal
		// year, or during the switch to DST) and not counted in the final set.
		
		if (!this._count && !this._bysetpos)
			return true;
		
		// As a fallback we have to loop :(
		for (const occurrence of this) {
			if (occurrence.getTime() === date.getTime())
				return true;
			
			if (occurrence.getTime() > date.getTime())
				break;
		}
		
		// If the loop came up short
		return false;
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
	
	/**
	 * Return an array of days of the year (numbered from 0 to 365) of the
	 * current timeframe (year, month, week, day) containing the current date.
	 *
	 * @param {number} year
	 * @param {number} month
	 * @param {number} day
	 * @param {Array} masks
	 * @return {Array}
	 * @private
	 */
	_getDaySet (year, month, day, masks) {
		switch (this._freq) {
			case RRule.YEARLY:
				return range(0, masks["yearLen"] - 1);
				
			case RRule.MONTHLY: {
				const start = masks["lastDayOfMonth"][month - 1]
					, stop  = masks["lastDayOfMonth"][month];
				
				return range(start, stop - 1);
			}
			
			case RRule.WEEKLY: {
				// On first iteration, the first week will not be complete.
				// We don't backtrack to the first day of the week, to avoid
				// crossing year boundary in reverse (i.e. if the week started
				// during the previous year), because that would generate
				// negative indexes (which would not work with the masks).
				const set = [];
				let i = formatDate(new Date(year, month - 1, day, 0, 0, 0), "z")|0;
				
				for (let j = 0; j < 7; ++j) {
					set.push(i);
					++i;
					if (masks["yearDayToWeekday"][i] === this._wkst)
						break;
				}
				
				return set;
			}
			
			case RRule.DAILY:
			case RRule.HOURLY:
			case RRule.MINUTELY:
			case RRule.SECONDLY:
				let i = formatDate(new Date(year, month - 1, day, 0, 0, 0), "z")|0;
				return [i];
		}
	}
	
	/**
	 * Calculate the year days corresponding to each Nth weekday (in BYDAY part)
	 *
	 * For example, in Jan 1998, in a MONTHLY interval, "1SU,-1SU" (first Sunday
	 * and last Sunday) would be transformed into [3=>true,24=>true] because
	 * the first Sunday of Jan 1998 is yearday 3 (counting from 0) and the
	 * last Sunday of Jan 1998 is yearday 24 (counting from 0).
	 *
	 * @param {number} year
	 * @param {number} month
	 * @param {number} day
	 * @param {Array} masks
	 * @private
	 */
	_buildNthWeekdayMask (year, month, day, masks)
	{
		masks["yearDayIsNthWeekday"] = [];
		
		if (this._byweekdayNth) {
			let ranges = [];
			
			if (this._freq === RRule.YEARLY) {
				if (this._bymonth) {
					for (const byMonth of this._bymonth) {
						ranges.push([
							masks["lastDayOfMonth"][byMonth - 1],
							masks["lastDayOfMonth"][byMonth] - 1,
						]);
					}
				}
				
				else {
					ranges = [[0, masks["yearLen"] - 1]];
				}
			}
			
			else if (this._freq === RRule.MONTHLY) {
				ranges.push([
					masks["lastDayOfMonth"][month - 1],
					masks["lastDayOfMonth"][month] - 1,
				]);
			}
			
			if (ranges.length) {
				// Weekly frequency won't get here, so we don't need to worry
				// about cross-year weekly periods.
				for (const [first, last] of ranges) {
					for (const [weekday, nth] of this._byweekdayNth) {
						let i;
						
						if (nth < 0) {
							i = last + (nth + 1) * 7;
							i = i - pymod(masks["yearDayToWeekday"][i] - weekday, 7);
						}
						
						else {
							i = first + (nth - 1) * 7;
							i = i + (7 - masks["yearDayToWeekDay"][i] + weekday) % 7;
						}
						
						if (i >= first && i <= last) {
							masks["yearDayIsNthWeekday"][i] = true;
						}
					}
				}
			}
		}
	}
	
	/**
	 * Calculate the year days corresponding to the week number (in the WEEKNO
	 * part)
	 *
	 * Because weeks can cross year boundaries (that is, week #1 can start the
	 * previous year, and week 52/53 can continue till the next year), the
	 * algorithm is quite long.
	 *
	 * @param {number} year
	 * @param {number} month
	 * @param {number} day
	 * @param {Array} masks
	 * @private
	 */
	_buildWeekNoMask (year, month, day, masks)
	{
		masks["yearDayIsInWeekNo"] = [];
		
		// Calculate the index of the first WKST day of the year.
		// 0 === the first day of the year in the WKST day
		// (e.g. WKST is Monday & Jan 1st is a Monday)
		// n === there is n days before the first WKST day of the year
		// If n >= 4, this is the first day of the year (even though it started
		// the year before)
		const firstWKST = (7 - masks["weekdayOf1stYearDay"] + this._wkst) % 7;
		let firstWKSTOffset, nbDays;
		
		if (firstWKST >= 4) {
			firstWKSTOffset = 0;
			
			// Number of days in the year, plus the days we got from last year
			nbDays = masks["yearLen"] + masks["weekdayOf1stYearDay"] - this._wkst;
		}
		
		else {
			firstWKSTOffset = firstWKST;
			
			// Number of days in the year, minus the days we left in last year
			nbDays = masks["yearLen"] - firstWKST;
		}
		
		const nbWeeks = ((nbDays / 7)|0) + (((nbDays % 7) / 4)|0);
		
		// Now we know when the first week starts and the number of weeks of the
		// year, we can generate a map of every year day that are in the weeks
		// specified in BYWEEKNO
		for (let n of this._byweekno) {
			if (n < 0)
				n = n + nbWeeks + 1;
			
			if (n <= 0 || n > nbWeeks)
				continue;
			
			let i;
			
			if (n > 1) {
				i = firstWKSTOffset + (n - 1) * 7;
				
				// If week #1 started the previous year, realign the start of
				// the week
				if (firstWKSTOffset !== firstWKST)
					i = i - (7 - firstWKST);
			}
			
			else {
				i = firstWKSTOffset;
			}
			
			// Now add 7 days into the result set, stopping either at 7 or if we
			// reach WKST before (in the case of a short first week of the year)
			for (let j = 0; j < 7; ++j) {
				masks["yearDayIsInWeekNo"][i] = true;
				++i;
				if (masks["yearDayToWeekday"][i] === this._wkst)
					break;
			}
		}
		
		// If we asked for week #1, it's possible that week #1 of the next year
		// already started this year. Therefore we need to return also matching
		// days of next year.
		if (~this._byweekno.indexOf(1)) {
			// Check week number 1 of next year as well
			// TODO: Check -numweeks for next year
			let i = firstWKSTOffset + nbWeeks * 7;
			
			if (firstWKSTOffset !== firstWKST)
				i = i - (7 - firstWKST);
			
			if (i < masks["yearLen"]) {
				// If the week starts in the next year, we don't care about it
				for (let j = 0; j < 7; ++j) {
					masks["yearDayIsInWeekNo"][i] = true;
					++i;
					if (masks["yearDayToWeekday"][i] === this._wkst)
						break;
				}
			}
		}
		
		if (firstWKSTOffset) {
			// Check the last week number of last year as well.
			// If firstWKSTOffset is 0, either the year start on week start or
			// week #1 got days from last year, so there are no days from last
			// years last week number in this year
			let nbWeeksLastYear;
			
			if (!~this._byweekno.indexOf(-1)) {
				const weekdayOf1stYearDay = formatDate(
					new Date(year - 1, 0, 1, 0, 0, 0),
					"N"
				);
				const lastYearLen = 365 + isLeapYear(year - 1)|0;
				
				let firstWKSTOffsetLastYear = (7 - weekdayOf1stYearDay + this._wkst) % 7;
				
				if (firstWKSTOffsetLastYear >= 4) {
					// firstWKSTOffsetLastYear = 0;
					nbWeeksLastYear =
						52 + (((lastYearLen + (weekdayOf1stYearDay - this._wkst) % 7) % 7) / 4)|0;
				}
				
				else {
					nbWeeksLastYear = 52 + (((masks["yearLen"] - firstWKSTOffset) % 7) / 4)|0;
				}
			}
			
			else {
				nbWeeksLastYear = -1;
			}
			
			if (~this._byweekno.indexOf(nbWeeksLastYear))
				for (let i = 0; i < firstWKSTOffset; ++i)
					masks["yearDayIsInWeekNo"][i] = true;
					
		}
	}
	
	/**
	 * Build an array of every time of the day that matches the BYxxx
	 * time criteria.
	 *
	 * It will only process this._freq at one time. So:
	 * - for HOURLY frequencies it builds the minutes and second of the given
	 * hour
	 * - for MINUTELY frequencies it builds the seconds of the given minute
	 * - for SECONDLY frequencies, it returns an array with one element
	 *
	 * This method is called every time an increment of at least one hour is
	 * made.
	 *
	 * @param {number} hour
	 * @param {number} minute
	 * @param {number} second
	 * @return {Array}
	 * @private
	 */
	_getTimeSet (hour, minute, second) {
		switch (this._freq) {
			case RRule.HOURLY: {
				const set = [];
				for (const minute of this._byminute)
					// Should we use another type?
					set.push([hour, minute, second]);
				// Sort?
				return set;
			}
			
			case RRule.MINUTELY: {
				const set = [];
				for (const second of this._bysecond)
					// Should we use another type?
					set.push([hour, second, second]);
				// Sort?
				return set;
			}
			
			case RRule.SECONDLY:
				return [[hour, minute, second]];
				
			default:
				throw new Error("getTimeSet called with an invalid FREQ");
		}
	}
	
	// Iterator
	// =========================================================================
	
	/**
	 * This is the main function; where all the magic happens!
	 *
	 * The main idea is brute force made fast by not relying on Date functions.
	 *
	 * There is on big loop that examines every interval of the given frequency
	 * (so every day, week, month, or year), constructs an array of all the
	 * year
	 * days of the interval (for daily frequencies, the array only has one
	 * element, for weekly 7, and so on), and then filters out any days that do
	 * not match the BYxxx parts.
	 *
	 * The algorithm does not try to be *smart* in calculating the increment of
	 * the loop. That is, for a rule like "every day in January for 10 years"
	 * the algorithm will loop through every day of the year, each year,
	 * generating some 3650 iterations (+ some to account for the leap years).
	 * This is a bit counter-intuitive, as it is obvious that the loop could
	 * skip all the days in February till December since they are never going
	 * to match.
	 *
	 * Fortunately, this approach is still super fast because it doesn't rely
	 * on
	 * Date functions, and instead does all the operations manually, either
	 * arithmetically or using arrays as converters.
	 *
	 * Another quirk of this approach is that because the granularity is by
	 * day,
	 * higher frequencies (hourly, minutely, and secondly) have to have their
	 * own special loops within the main loop, making the whole thing quite
	 * convoluted. Moreover, at such frequencies, the brute-force approach
	 * really starts to suck. For example, a rule like "Every minute, every Jan
	 * 1st between 10:00 and 10:59, for 10 years" requires a tremendous amount
	 * of useless iterations to jump from Jan 1st 10:59 at year 1 to Jan 1st
	 * 10:00 at year 2.
	 *
	 * In order to make a *smart jump*, we would have to have a way to
	 * determine
	 * the gap between the next occurrence arithmetically. I think that would
	 * require us to analyze each BYxxx rule part that limit the set (see the
	 * RFC, page 43) at the given frequency. For example, a YEARLY frequency
	 * doesn't need *smart jump* at all; MONTHLY and WEEKLY frequencies only
	 * need to check BYMONTH; a DAILY frequency needs to check BYMONTH,
	 * BYMONTHDAY, BYDAY, and so on. The check probably has to be done in
	 * reverse order, e.g. for DAILY frequencies attempt to jump to the next
	 * weekday (BYDAY) or next month day (BYMONTHDAY) (I don't know yet which
	 * one should be first), and then if that results in a change of month,
	 * attempt to jump to the next BYMONTH, and so on.
	 *
	 * TODO(Tam): See if this can be refactored to not rely on the outer while
	 * loop...
	 *
	 * @return {IterableIterator<*>}
	 */
	* [Symbol.iterator] () {
		let year = null,
			month = null,
			day = null,
			hour = null,
			minute = null,
			second = null,
			
			daySet = null,
			masks = null,
			timeSet = null,
			dtStart = null,
			useCache = true,
			total = 0;
		
		while (true) {
			
			// Go through the cache first
			if (useCache) {
				for (const occurrence in this._cache) {
					dtStart = occurrence;
					++total.total;
					yield new Date(occurrence.getTime());
				}
				
				useCache = false;
				
				// If the cache has been used up and we know there is nothing else...
				if (total.total === this._total)
					return;
				
				if (dtStart) {
					dtStart = new Date(dtStart.getTime());
					
					// Skip the last occurrence of the cache
					if (this._freq === RRule.SECONDLY) {
						dtStart.setSeconds(dtStart.getSeconds() + this._interval);
					}
					
					else {
						dtStart.setSeconds(dtStart.getSeconds() + 1);
					}
				}
			}
			
			if (this._count && total >= this._count)
				return;
			
			if (dtStart === null) {
				dtStart = new Date(this._dtstart.getTime());
			}
			
			// Populate times
			if (year === null) {
				if (this._freq === RRule.WEEKLY) {
					// We align the start date to WKST, so we can then simply loop
					// by adding +7 days. The Python lib does some calculation magic
					// at then end of the loop (when incrementing) to realign on
					// first pass.
					const tmp = new Date(dtStart.getTime());
					tmp.setDate(
						tmp.getDate() - pymod(
							formatDate(dtStart, "N") - this._wkst,
							7
						)
					);
					
					[year, month, day, hour, minute, second] =
						formatDate(tmp, "Y n j G i s").split(" ");
				}
				
				else {
					[year, month, day, hour, minute, second] =
						formatDate(dtStart, "Y n j G i s").split(" ");
				}
				
				// Force back to ints (& remove leading zeros)
				year = year|0;
				month = month|0;
				day = day|0;
				hour = hour|0;
				minute = minute|0;
				second = second|0;
			}
			
			// Initialize the time set
			if (timeSet === null) {
				if (this._freq < RRule.HOURLY) {
					// For daily, weekly, monthly, or yearly, we don't need to
					// calculate  a new time set.
					timeSet = this._timeset;
				}
				
				else {
					// Initialize empty if it's not going to occur on the
					// first iteration
					if (
						(this._freq >= RRule.HOURLY && this._byhour && !~this._byhour.indexOf(hour))
						|| (this._freq >= RRule.MINUTELY && this._byminute && !~this._byminute.indexOf(minute))
						|| (this._freq >= RRule.SECONDLY && this._bysecond && !~this._bysecond.indexOf(second))
					) {
						timeSet = [];
					}
					
					else {
						timeSet = this._getTimeSet(hour, minute, second);
					}
				}
			}
			
			const maxCycles = RRule.REPEAT_CYCLES[
				this._freq <= RRule.DAILY ? this._freq : RRule.DAILY
			];
			
			for (let i = 0; i < maxCycles; ++i) {
				// 1. Get an array of all days in the next interval (day, week,
				// month, etc.). We'll filter out from this array all days that
				// do not match the BYxxx conditions. To speed things up, we use
				// days of the year (day numbers) instead of date.
				if (daySet === null) {
					// Rebuild the various masks and converters. These arrays
					// will allow fast date operations without relying on
					// Date functions.
					if (
						!masks.length
						|| masks["year"] !== year
						|| masks["month"] !== month
					) {
						masks = {
							year: "",
							month: "",
						};
						
						// Only if year has changed
						// TODO(Tam): Won't this always be true?
						if (masks["year"] !== year) {
							masks["leapYear"] = isLeapYear(year);
							masks["yearLen"] = 365 + masks["leapYear"]|0;
							masks["nextYearLen"] = 365 + isLeapYear(year + 1)|0;
							masks["weekdayOf1stYearDay"] = formatDate(new Date(
								year, 0, 1, 0, 0, 0
							), "N");
							masks["yearDayToWeekday"] = RRule.WEEKDAY_MASK.slice(
								masks["weekdayOf1stYearDay"] - 1
							);
							
							if (masks["leapYear"]) {
								masks["yearDayToMonth"] = RRule.MONTH_MASK_366;
								masks["yearDayToMonthDay"] = RRule.MONTHDAY_MASK_366;
								masks["yearDayToMonthDayNegative"] = RRule.NEGATIVE_MONTHDAY_MASK_366;
								masks["lastDayOfMonth"] = RRule.LAST_DAY_OF_MONTH_366;
							}
							
							else {
								masks["yearDayToMonth"] = RRule.MONTH_MASK;
								masks["yearDayToMonthDay"] = RRule.MONTHDAY_MASK;
								masks["yearDayToMonthDayNegative"] = RRule.NEGATIVE_MONTHDAY_MASK;
								masks["lastDayOfMonth"] = RRule.LAST_DAY_OF_MONTH;
							}
							
							if (this._byweekno)
								this._buildWeekNoMask(year, month, day, masks);
						}
						
						// Every time month or year changes
						if (this._byweekdayNth)
							this._buildNthWeekdayMask(year, month, day, masks);
						
						masks["year"] = year;
						masks["month"] = month;
					}
					
					// Calculate the current set
					daySet = this._getDaySet(year, month, day, masks);
					
					const filteredSet = [];
					
					// Filter out the days based on the BYxxx rules
					for (let yearDay of daySet) {
						if (
							this._bymonth
							&& !~this._bymonth.indexOf(
								masks["yearDayToMonth"][yearDay]
							)
						) continue;
						
						if (
							this._byweekno
							&& masks["yearDayIsInWeekNo"][yearDay] === undefined
						) continue;
						
						if (this._byyearday) {
							if (yearDay <= masks["yearLen"]) {
								if (
									!~this._byyearday.indexOf(yearDay + 1)
									&& !~this._byyearday.indexOf(-masks["yearLen"] + yearDay)
								) continue;
							}
							
							else {
								if (
									!~this._byyearday.indexOf(yearDay + 1 - masks["yearLen"])
									&& !~this._byyearday.indexOf(-masks["nextYearLen"] + yearDay - masks["yearLen"])
								) continue;
							}
						}
						
						if (
							(this._bymonthday || this._bymonthdayNegative)
							&& !~this._bymonthday.indexOf(masks["yearDayToMonthDay"][yearDay])
							&& !~this._bymonthdayNegative.indexOf(masks["yearDayToMonthDayNegative"][yearDay])
						) continue;
						
						if (
							(this._byweekday || this._byweekdayNth)
							&& !~this._byweekday.indexOf(masks["yearDayToWeekday"][yearDay])
							&& masks["yearDayIsNthWeekday"][yearDay] === undefined
						) continue;
						
						filteredSet.push(yearDay);
					}
					
					daySet = filteredSet;
					
					// If BYSETPOS is set, we need to expand the time set to
					// filter by pos, so we'll make a special loop to return
					// while generating
					if (this._bysetpos && timeSet.length) {
						let filteredSet = {};
						
						for (let pos of this._bysetpos) {
							const n = timeSet.length;
							
							if (pos < 0) pos = n * daySet.length + pos;
							else pos = pos - 1;
							
							const div = (pos / n)|0 // dayPos
								, mod = pos % n; // timePos
							
							if (
								daySet[div] !== undefined
								&& timeSet[mod] !== undefined
							) {
								const yearDay = daySet[div]
									, time    = timeSet[mod];
								
								// Used as key to ensure uniqueness
								const tmp = `${year}:${yearDay}:${time[0]}:${time[1]}:${time[2]}`;
								if (filteredSet[tmp] === undefined) {
									filteredSet[tmp] = new Date(
										year,
										0,
										yearDay,
										time[0],
										time[1],
										time[2]
									);
								}
							}
						}
						
						filteredSet = Object.values(filteredSet);
						filteredSet.sort((a, b) => a - b);
						daySet = filteredSet;
					}
				}
				
				// 2. Loop, generate a vaild date, then yield the result.
				// At the same time, we check the end condition and return
				// null if we need to stop.
				if (this._bysetpos && timeSet.length) {
					for (const occurrence of daySet) {
						// Consider end conditions
						if (this._until && occurrence.getTime() > this._until.getTime()) {
							this._total = total;
							return;
						}
						
						// Ignore occurrences before DTSTART
						if (occurrence.getTime() >= dtStart.getTime()) {
							++total;
							this._cache.push(occurrence);
							yield new Date(occurrence.getTime());
						}
					}
				}
				
				// Normal loop, without BYSETPOS
				else {
					for (const yearDay of daySet) {
						const occurrence = new Date(
							year,
							0,
							yearDay,
							0,
							0,
							0
						);
						
						for (let time of timeSet) {
							occurrence.setHours(time[0]);
							occurrence.setMinutes(time[0]);
							occurrence.setSeconds(time[0]);
							
							// Consider end conditions
							if (this._until && occurrence.getTime() > this._until.getTime()) {
								this._total = total;
								return;
							}
							
							// Ignore occurrences before DTSTART
							if (occurrence.getTime() >= dtStart.getTime()) {
								++total;
								this._cache.push(occurrence);
								yield new Date(occurrence.getTime());
							}
						}
					}
				}
				
				// 3. Reset the loop to the next interval
				let daysIncrement = 0;
				
				switch (this._freq) {
					
					case RRule.YEARLY: {
						// We don't care about month or day not existing, they
						// are not used in the yearly frequency.
						year += this._interval;
						break;
					}
					
					case RRule.MONTHLY: {
						// We don't care about the day of the month not
						// existing, it isn't used in the monthly frequency.
						month += this._interval;
						
						if (month > 12) {
							const div = (month / 12)|0;
							month = month % 12;
							year += div;
							
							if (month === 0) {
								month = 12;
								year -= 1;
							}
						}
						break;
					}
					
					case RRule.WEEKLY: {
						daysIncrement = this._interval * 7;
						break;
					}
					
					case RRule.DAILY: {
						daysIncrement = this._interval;
						break;
					}
					
					// For the time frequencies, things are a little bit
					// different. We could just add this._interval hours,
					// minutes, or seconds, but since the frequencies are so
					// high and needs too much iteration it's actually a bit
					// faster to have custom loops only call the Date function
					// at the very end.
					
					case RRule.HOURLY: {
						if (!daySet || daySet.length === 0) {
							// An empty set means that this day has been
							// filtered out by one of the BYxxx rules. So there
							// is no need to examine it any further, we know
							// nothing is going to occur anyway. So we jump to
							// an iteration right before the next day.
							hour += (((23 - hour) / this._interval) * this._interval)|0;
						}
						
						let found = false;
						
						for (let j = 0; j < RRule.REPEAT_CYCLES[RRule.HOURLY]; ++j) {
							hour += this._interval;
							const div = (hour / 24)|0
								, mod = hour % 24;
							
							if (div) {
								hour = mod;
								daysIncrement += div;
							}
							
							if (!this._byhour || ~this._byhour.indexOf(hour)) {
								found = true;
								break;
							}
						}
						
						if (!found) {
							this._total = total;
							return;
						}
						
						timeSet = this._getTimeSet(hour, minute, second);
						break;
					}
					
					case RRule.MINUTELY: {
						if (!daySet || !daySet.length) {
							minute += (((1439 - (hour * 60 * minute)) / this._interval)|0) * this._interval;
						}
						
						let found = false;
						
						for (let j = 0; j < RRule.REPEAT_CYCLES[RRule.MINUTELY]; ++j) {
							minute += this._interval;
							let div = (minute / 60)|0,
								mod = minute % 60;
							
							if (div) {
								minute = mod;
								hour += div;
								
								div = (hour / 24)|0;
								mod = hour % 24;
								
								if (div) {
									hour = mod;
									daysIncrement += div;
								}
							}
							
							if (
								(!this._byhour || ~this._byhour.indexOf(hour))
								&& (!this._byminute || ~this._byminute.indexOf(minute))
							) {
								found = true;
								return;
							}
						}
						
						if (!found) {
							this._total = total;
							return;
						}
						
						timeSet = this._getTimeSet(hour, minute, second);
						break;
					}
					
					case RRule.SECONDLY: {
						if (!daySet || !daySet.length) {
							second += (((86399 - (hour * 3600 + minute * 60 + second)) / this._interval)|0);
						}
						
						let found = false;
						for (let j = 0; j < RRule.REPEAT_CYCLES[RRule.SECONDLY]; ++j) {
							second += this._interval;
							
							let div = (second / 60)|0,
								mod = second % 60;
							
							if (div) {
								second = mod;
								minute += div;
								
								div = (minute / 60)|0;
								mod = minute % 60;
								
								if (div) {
									minute = mod;
									hour += div;
									
									div = (hour / 24)|0;
									mod = hour % 24;
									
									if (div) {
										hour = mod;
										daysIncrement += div;
									}
								}
							}
							
							if (
								(!this._byhour || ~this._byhour.indexOf(hour))
								|| (!this._byminute || ~this._byminute.indexOf(minute))
								|| (!this._bysecond || ~this._bysecond.indexOf(second))
							) {
								found = true;
								break;
							}
						}
						
						if (!found) {
							this._total = total;
							return;
						}
						
						timeSet = this._getTimeSet(hour, minute, second);
						break;
					}
				}
				
				// Here we take a little shortcut from the Python version by
				// using Date()
				if (daysIncrement) {
					const d = new Date(year, month - 1, day);
					d.setDate(d.getDate() + daysIncrement);
					[year, month, day] = formatDate(d, "Y-n-j").split("-");
				}
				
				// Reset the loop
				daySet = null;
			}
			
			this._total = total;
			return;
		}
	}
	
	// Constants
	// =========================================================================
	
	// Every mask is 7 days longer to handle cross-year weekly periods
	
	static get MONTH_MASK () {
		return [
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
			3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
			4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
			5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
			6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
			7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
			8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
			9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,
			10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,
			11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,
			12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,
			1,1,1,1,1,1,1
		];
	}
	
	static get MONTH_MASK_366 () {
		return [
			1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
			2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
			3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
			4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
			5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
			6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
			7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
			8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
			9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,
			10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,
			11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,
			12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,
			1,1,1,1,1,1,1
		];
	}
	
	static get MONTHDAY_MASK () {
		return [
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7
		];
	}
	
	static get MONTHDAY_MASK_366 () {
		return [
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,
			1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,
			1,2,3,4,5,6,7
		];
	}
	
	static get NEGATIVE_MONTHDAY_MASK () {
		return [
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25
		];
	}
	
	static get NEGATIVE_MONTHDAY_MASK_366 () {
		return [
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25,-24,-23,-22,-21,-20,-19,-18,-17,-16,-15,-14,-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,
			-31,-30,-29,-28,-27,-26,-25
		];
	}
	
	static get WEEKDAY_MASK () {
		return [
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,
			1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7,1,2,3,4,5,6,7
		];
	}
	
	static get LAST_DAY_OF_MONTH () {
		return [
			0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365
		];
	}
	
	static get LAST_DAY_OF_MONTH_366 () {
		return [
			0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366
		];
	}
	
	/**
	 * Maximum number of cycles after which a calendar repeats itself. This
	 * is used to detect infinite loop: if no occurrence has been found
	 * after this numbers of cycles, we can abort.
	 *
	 * The Gregorian calendar cycle repeat completely every 400 years
	 * (146,097 days or 20,871 weeks).
	 * A smaller cycle would be 28 years (1,461 weeks), but it only works
	 * if there is no dropped leap year in between.
	 * 2100 will be a dropped leap year, but I'm going to assume it's not
	 * going to be a problem anytime soon, so at the moment I use the 28 years
	 * cycle.
	 *
	 * @type {Object}
	 */
	static get REPEAT_CYCLES () {
		return {
			[RRule.YEARLY]: 28,
			[RRule.MONTHLY]: 336,
			[RRule.WEEKLY]: 1461,
			[RRule.DAILY]: 10227,
			
			[RRule.HOURLY]: 24,
			[RRule.MINUTELY]: 1440,
			[RRule.SECONDLY]: 86400,
		};
	}
	
}
