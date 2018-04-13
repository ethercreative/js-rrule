(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.rrule = {})));
}(this, (function (exports) { 'use strict';

	/**
	 * Check that a variable is not empty.
	 * 0 and '0' are considered NOT empty.
	 *
	 * @param {*} value - Variable to be checked
	 * @return {boolean}
	 */
	function notEmpty(value) {
	  return value === 0 || value === "0" || !!value || Array.isArray(value) && value.length > 0;
	}

	var shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	    longMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	    shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	    longDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	// Defining patterns
	var replaceChars = {
		// Day
		// -------------------------------------------------------------------------

		/**
	  * @returns {string}
	  */
		d: function d() {
			var d = this.getDate();
			return (d < 10 ? '0' : '') + d;
		},

		/**
	  * @returns {string}
	  */
		D: function D() {
			return shortDays[this.getDay()];
		},

		/**
	  * @returns {number}
	  */
		j: function j() {
			return this.getDate();
		},

		/**
	  * @returns {string}
	  */
		l: function l() {
			return longDays[this.getDay()];
		},

		/**
	  * @returns {number}
	  */
		N: function N() {
			var N = this.getDay();
			return N === 0 ? 7 : N;
		},

		/**
	  * @returns {string}
	  */
		S: function S() {
			var S = this.getDate();
			return S % 10 === 1 && S !== 11 ? 'st' : S % 10 === 2 && S !== 12 ? 'nd' : S % 10 === 3 && S !== 13 ? 'rd' : 'th';
		},

		/**
	  * @returns {number}
	  */
		w: function w() {
			return this.getDay();
		},

		/**
	  * @returns {number}
	  */
		z: function z() {
			var d = new Date(this.getFullYear(), 0, 1);
			return Math.ceil((this - d) / 86400000);
		},

		// Week
		// -------------------------------------------------------------------------

		/**
	  * @returns {string}
	  */
		W: function W() {
			var target = new Date(this.valueOf()),
			    dayNr = (this.getDay() + 6) % 7;

			target.setDate(target.getDate() - dayNr + 3);

			var firstThursday = target.valueOf();

			target.setMonth(0, 1);

			if (target.getDay() !== 4) target.setMonth(0, 1 + (4 - target.getDay() + 7) % 7);

			var retVal = 1 + Math.ceil((firstThursday - target) / 604800000);

			return retVal < 10 ? '0' + retVal : retVal;
		},

		// Month
		// -------------------------------------------------------------------------

		/**
	  * @returns {string}
	  */
		F: function F() {
			return longMonths[this.getMonth()];
		},

		/**
	  * @returns {string}
	  */
		m: function m() {
			var m = this.getMonth();
			return (m < 9 ? '0' : '') + (m + 1);
		},

		/**
	  * @returns {string}
	  */
		M: function M() {
			return shortMonths[this.getMonth()];
		},

		/**
	  * @returns {number}
	  */
		n: function n() {
			return this.getMonth() + 1;
		},

		/**
	  * @returns {number}
	  */
		t: function t() {
			var year = this.getFullYear(),
			    nextMonth = this.getMonth() + 1;

			if (nextMonth === 12) {
				year++;
				nextMonth = 0;
			}

			return new Date(year, nextMonth, 0).getDate();
		},

		// Year
		// -------------------------------------------------------------------------

		/**
	  * @returns {boolean}
	  */
		L: function L() {
			var L = this.getFullYear();
			return L % 400 === 0 || L % 100 !== 0 && L % 4 === 0;
		},

		/**
	  * @returns {number}
	  */
		o: function o() {
			var d = new Date(this.valueOf());
			d.setDate(d.getDate() - (this.getDay() + 6) % 7 + 3);
			return d.getFullYear();
		},

		/**
	  * @returns {number}
	  */
		Y: function Y() {
			return this.getFullYear();
		},

		/**
	  * @returns {string}
	  */
		y: function y() {
			return ('' + this.getFullYear()).substr(2);
		},

		// Time
		// -------------------------------------------------------------------------

		/**
	  * @returns {string}
	  */
		a: function a() {
			return this.getHours() < 12 ? 'am' : 'pm';
		},

		/**
	  * @returns {string}
	  */
		A: function A() {
			return this.getHours() < 12 ? 'AM' : 'PM';
		},

		/**
	  * @returns {number}
	  */
		B: function B() {
			return Math.floor(((this.getUTCHours() + 1) % 24 + this.getUTCMinutes() / 60 + this.getUTCSeconds() / 3600) * 1000 / 24);
		},

		/**
	  * @returns {number}
	  */
		g: function g() {
			return this.getHours() % 12 || 12;
		},

		/**
	  * @returns {number}
	  */
		G: function G() {
			return this.getHours();
		},

		/**
	  * @returns {string}
	  */
		h: function h() {
			var h = this.getHours();
			return ((h % 12 || 12) < 10 ? '0' : '') + (h % 12 || 12);
		},

		/**
	  * @returns {string}
	  */
		H: function H() {
			var H = this.getHours();
			return (H < 10 ? '0' : '') + H;
		},

		/**
	  * @returns {string}
	  */
		i: function i() {
			var i = this.getMinutes();
			return (i < 10 ? '0' : '') + i;
		},

		/**
	  * @returns {string}
	  */
		s: function s() {
			var s = this.getSeconds();
			return (s < 10 ? '0' : '') + s;
		},

		/**
	  * @returns {string}
	  */
		v: function v() {
			var v = this.getMilliseconds();
			return (v < 10 ? '00' : v < 100 ? '0' : '') + v;
		},

		// Timezone
		// -------------------------------------------------------------------------

		/**
	  * @returns {string}
	  */
		e: function e() {
			return Intl.DateTimeFormat().resolvedOptions().timeZone;
		},

		/**
	  * @returns {number}
	  */
		I: function I() {
			var DST = null;
			for (var i = 0; i < 12; ++i) {
				var d = new Date(this.getFullYear(), i, 1);
				var offset = d.getTimezoneOffset();

				if (DST === null) DST = offset;else if (offset < DST) {
					DST = offset;
					break;
				} else if (offset > DST) break;
			}
			return this.getTimezoneOffset() === DST | 0;
		},

		/**
	  * @returns {string}
	  */
		O: function O() {
			var O = this.getTimezoneOffset();
			return (-O < 0 ? '-' : '+') + (Math.abs(O / 60) < 10 ? '0' : '') + Math.floor(Math.abs(O / 60)) + (Math.abs(O % 60) === 0 ? '00' : (Math.abs(O % 60) < 10 ? '0' : '') + Math.abs(O % 60));
		},

		/**
	  * @returns {string}
	  */
		P: function P() {
			var P = this.getTimezoneOffset();
			return (-P < 0 ? '-' : '+') + (Math.abs(P / 60) < 10 ? '0' : '') + Math.floor(Math.abs(P / 60)) + ':' + (Math.abs(P % 60) === 0 ? '00' : (Math.abs(P % 60) < 10 ? '0' : '') + Math.abs(P % 60));
		},

		/**
	  * @returns {string}
	  */
		T: function T() {
			var tz = this.toLocaleTimeString(navigator.language, { timeZoneName: 'short' }).split(' ');
			return tz[tz.length - 1];
		},

		/**
	  * @returns {number}
	  */
		Z: function Z() {
			return -this.getTimezoneOffset() * 60;
		},

		// Full Date / Time
		// -------------------------------------------------------------------------

		/**
	  * @returns {*|string}
	  */
		c: function c() {
			return this.format("Y-m-d\\TH:i:sP");
		},

		/**
	  * @returns {string}
	  */
		r: function r() {
			return this.toString();
		},

		/**
	  * @returns {number}
	  */
		U: function U() {
			return this.getTime() / 1000;
		}
	};

	/**
	 * Simulates PHP's date function
	 *
	 * @param {Date} date
	 * @param {string} format
	 */
	function format(date, format) {
		return format.replace(/(\\?)(.)/g, function (_, esc, chr) {
			return esc === '' && replaceChars[chr] ? replaceChars[chr].call(date) : chr;
		});
	}

	/**
	 * Python-like modulo.
	 *
	 * The % operator in PHP returns the remainder of a / b, but differs from
	 * some other languages in that the result will have the same sign as the
	 * dividend. For example, -1 % 8 == -1, whereas in some other languages
	 * (such as Python) the result would be 7. This function emulates the more
	 * correct modulo behavior, which is useful for certain applications such as
	 * calculating an offset index in a circular list.
	 *
	 * @param {number} a The dividend.
	 * @param {number} b The divisor.
	 *
	 * @return {number} a % b where the result is between 0 and b
	 *   (either 0 <= x < b or b < x <= 0, depending on the sign of b).
	 *
	 * @copyright 2006 The Closure Library Authors.
	 */
	function pymod(a, b) {
	  var x = a % b;

	  // If x and b differ in sign, add b to wrap the result to the correct sign.
	  return x * b < 0 ? x + b : x;
	}

	/**
	 * Check is a year is a leap year.
	 *
	 * @param {number} year The year to be checked.
	 * @return {boolean}
	 */
	function isLeapYear(year) {
	  if (year % 4 !== 0) return false;
	  if (year % 100 !== 0) return true;
	  return year % 400 === 0;
	}

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	var defineProperty = function (obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	};

	var _extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	var slicedToArray = function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;

	    try {
	      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);

	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }

	    return _arr;
	  }

	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if (Symbol.iterator in Object(arr)) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	}();

	var RSet = function RSet() {
		// TODO

		classCallCheck(this, RSet);
	};

	function dateDiff(a, b) {
		var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds()),
		    utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds());

		var diff = utc2 - utc1;

		return {
			weeks: Math.floor(diff / 6048e5),
			days: Math.floor(diff / 864e5),
			hours: Math.floor(diff / 36e5),
			minutes: Math.floor(diff / 6e4),
			seconds: Math.floor(diff / 1e3),
			milliseconds: diff
		};
	}

	function range(min, max) {
		var r = [];
		for (var i = min, l = max + 1; i < l; ++i) {
			r.push(i);
		}return r;
	}

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

	var RRule = function () {
		createClass(RRule, null, [{
			key: "SECONDLY",


			// Properties
			// =========================================================================

			get: function get$$1() {
				return 7;
			}
		}, {
			key: "MINUTELY",
			get: function get$$1() {
				return 6;
			}
		}, {
			key: "HOURLY",
			get: function get$$1() {
				return 5;
			}
		}, {
			key: "DAILY",
			get: function get$$1() {
				return 4;
			}
		}, {
			key: "WEEKLY",
			get: function get$$1() {
				return 3;
			}
		}, {
			key: "MONTHLY",
			get: function get$$1() {
				return 2;
			}
		}, {
			key: "YEARLY",
			get: function get$$1() {
				return 1;
			}

			/**
	   * Frequency names.
	   * Used internally for conversion but public if a reference list is needed.
	   *
	   * @type {Object} The name as the key
	   */

		}, {
			key: "frequencies",
			get: function get$$1() {
				return {
					SECONDLY: this.SECONDLY,
					MINUTELY: this.MINUTELY,
					HOURLY: this.HOURLY,
					DAILY: this.DAILY,
					WEEKLY: this.WEEKLY,
					MONTHLY: this.MONTHLY,
					YEARLY: this.YEARLY
				};
			}
		}, {
			key: "weekDays",


			/**
	   * Weekdays numbered from 1 (ISO-8601).
	   * Used internally but public if a reference list is needed.
	   *
	   * @type {Object} The name as the key
	   */
			get: function get$$1() {
				return {
					MO: 1,
					TU: 2,
					WE: 3,
					TH: 4,
					FR: 5,
					SA: 6,
					SU: 7
				};
			}

			/**
	   * @type {Object} Original rule
	   * @private
	   */


			// Parsed and validated values


			// Cache variables

		}]);

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
		function RRule(parts) {
			var _this = this;

			var dtstart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
			classCallCheck(this, RRule);
			this._rule = {
				DTSTART: null,
				FREQ: null,
				UNTIL: null,
				COUNT: null,
				INTERVAL: 1,
				BYSECOND: null,
				BYMINUTE: null,
				BYHOUR: null,
				BYDAY: null,
				BYMONTHDAY: null,
				BYYEARDAY: null,
				BYWEEKNO: null,
				BYMONTH: null,
				BYSETPOS: null,
				WKST: "MO"
			};
			this._dtstart = null;
			this._freq = null;
			this._until = null;
			this._count = null;
			this._interval = null;
			this._bysecond = null;
			this._byminute = null;
			this._byhour = null;
			this._byweekday = null;
			this._byweekdayNth = null;
			this._bymonthday = null;
			this._bymonthdayNegative = null;
			this._byyearday = null;
			this._byweekno = null;
			this._bymonth = null;
			this._bysetpos = null;
			this._wkst = null;
			this._timeset = null;
			this._total = null;
			this._cache = [];

			this.isFinite = function () {
				return !!(_this._count || _this._until);
			};

			this.isInfinite = function () {
				return !_this._count && !_this._until;
			};

			if (typeof parts === "string") {
				// TODO: Parse string -> RfcParser::parseRRule
			} else {
				if (dtstart) throw new Error("dtstart param has no effect if not constructing from a string.");

				if ((typeof parts === "undefined" ? "undefined" : _typeof(parts)) !== "object" && parts.constructor === Object) throw new Error("parts param must be an object or a string.");

				// Ensure all keys are upper-case
				for (var key in parts) {
					var upper = key.toUpperCase();

					if (key === upper) continue;

					parts[upper] = parts[key];
					delete parts[key];
				}
			}

			// Validate extra parts
			// ---------------------------------------------------------------------

			var partKeys = Object.keys(parts);
			var invalidKeys = Object.keys(this._rule).filter(function (i) {
				return ~partKeys.indexOf(i);
			});

			if (invalidKeys.length) throw new Error("Unsupported parameter(s): " + invalidKeys.join(", "));

			// Merge with & save original rule
			// ---------------------------------------------------------------------

			parts = _extends({}, this._rule, parts);

			this._rule = parts;

			// WKST
			// ---------------------------------------------------------------------

			parts.WKST = parts.WKST.toUpperCase();

			if (!RRule.weekDays.hasOwnProperty(parts.WKST)) throw new Error("The WKST rule part must be one of the following: " + Object.keys(RRule.weekDays).join(", "));

			this._wkst = RRule.weekDays[parts.WKST];

			// FREQ
			// ---------------------------------------------------------------------

			if (typeof parts.FREQ === "number") {
				if (parts.FREQ > RRule.SECONDLY || parts.FREQ < RRule.YEARLY) throw new Error("The FREQ rule part must be one of the following: " + Object.keys(RRule.frequencies).join(", "));

				this._freq = parts.FREQ;
			} else {
				// String
				parts.FREQ = parts.FREQ.toUpperCase();

				if (!RRule.frequencies.hasOwnProperty(parts.FREQ)) throw new Error("The FREQ rule part must be one of the following: " + Object.keys(RRule.frequencies).join(", "));

				this._freq = RRule.frequencies[parts.FREQ];
			}

			// INTERVAL
			// ---------------------------------------------------------------------

			if (!Number.isInteger(+parts.INTERVAL) || parts.INTERVAL | 0 < 1) throw new Error("The INTERVAL rule part must be a positive integer (> 0)");

			this._interval = parts.INTERVAL | 0;

			// DTSTART
			// ---------------------------------------------------------------------

			if (parts.DTSTART) {
				try {
					this._dtstart = RRule.parseDate(parts.DTSTART);
				} catch (e) {
					throw new Error("Failed to parse DTSTART. It must be a valid date or timestamp.");
				}
			} else {
				this._dtstart = new Date();
			}

			// UNTIL (optional)
			// ---------------------------------------------------------------------

			if (parts.UNTIL) {
				try {
					this._until = RRule.parseDate(parts.UNTIL);
				} catch (e) {
					throw new Error("Failed to parse UNTIL. It must be a valid date or timestamp.");
				}
			}

			// COUNT (optional)
			// ---------------------------------------------------------------------

			if (parts.COUNT) {
				if (!Number.isInteger(+parts.COUNT) || parts.COUNT | 0 < 1) throw new Error("COUNT must be a positive integer (> 0)");

				this._count = parts.COUNT | 0;
			}

			if (this._until && this._count) throw new Error("The UNTIL or COUNT rule parts MUST NOT occur in the same rule");

			// BYxxx
			// ---------------------------------------------------------------------

			// Infer necessary BYxxx rules from DTSTART, if not provided
			if (!(notEmpty(parts.BYWEEKNO) || notEmpty(parts.BYYEARDAY) || notEmpty(parts.BYMONTHDAY) || notEmpty(parts.BYDAY))) {
				switch (this._freq) {
					case RRule.YEARLY:
						if (!notEmpty(parts.BYMONTH)) parts.BYMONTH = [format(this._dtstart, "m")];

						parts.BYMONTHDAY = [format(this._dtstart, "j")];
						break;

					case RRule.MONTHLY:
						parts.BYMONTHDAY = [format(this._dtstart, "j")];
						break;

					case RRule.WEEKLY:
						var n = format(this._dtstart, "N");
						parts.BYDAY = RRule.weekDays.hasOwnProperty(n) ? [RRule.weekDays[n]] : [];
						break;
				}
			}

			// BYDAY (translated to byweekday for convenience)
			// ---------------------------------------------------------------------

			if (notEmpty(parts.BYDAY)) {
				if (!Array.isArray(parts.BYDAY)) parts.BYDAY = parts.BYDAY.split(",");

				this._byweekday = [];
				this._byweekdayNth = [];

				for (var i = 0, l = parts.BYDAY.length; i < l; ++i) {
					var value = parts.BYDAY[i];
					value = value.toUpperCase().trim();

					var matches = /^([+-]?[0-9]+)?([A-Z]{2})$/.exec(value);
					if (!matches || notEmpty(matches[1]) && (+matches[1] === 0 || +matches[1] > 53 || +matches[1] < -53) || RRule.weekDays.hasOwnProperty(matches[2])) {
						throw new Error("Invalid BYDAY value: " + value);
					}

					if (matches[1]) {
						this._byweekdayNth.push([RRule.weekDays[matches[2]], +matches[1]]);
					} else {
						this._byweekday.push(RRule.weekDays[matches[2]]);
					}
				}

				if (this._byweekdayNth.length) {
					if (!(this._freq === RRule.MONTHLY || this._freq === RRule.YEARLY)) throw new Error("The BYDAY rule part MUST NOT be specified with a numeric value when the FREQ rule part is not set to MONTHLY or YEARLY.");

					if (this._freq === RRule.YEARLY && notEmpty(parts.BYWEEKNO)) throw new Error("The BYDAY rule part MUST NOT be specified with a numeric value with the FREQ rule part set to YEARLY when the BYWEEKNO rule part is specified.");
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
				if (this._freq === RRule.WEEKLY) throw new Error("The BYMONTHDAY rule part MUST NOT be specified when the FREQ rule part is set to WEEKLY.");

				if (!Array.isArray(parts.BYMONTHDAY)) parts.BYMONTHDAY = parts.BYMONTHDAY.split(",");

				this._bymonthday = [];
				this._bymonthdayNegative = [];

				for (var _i = 0, _l = parts.BYMONTHDAY.length; _i < _l; ++_i) {
					var _value = parts.BYMONTHDAY[_i];

					if (!_value || !Number.isInteger(+_value) || _value | 0 < -31 || _value | 0 > 31) {
						throw new Error("Invalid BYMONTHDAY value: " + _value + " (valid values are 1 to 31 or -31 to -1)");
					}

					_value = _value | 0;

					if (_value < 0) {
						this._bymonthdayNegative.push(_value);
					} else {
						this._bymonthday.push(_value);
					}
				}
			}

			// BYYEARDAY
			// ---------------------------------------------------------------------

			if (notEmpty(parts.BYYEARDAY)) {
				if (this._freq === RRule.DAILY || this._freq === RRule.WEEKLY || this._freq === RRule.MONTHLY) {
					throw new Error("The BYYEARDAY rule part MUST NOT be specified when the FREQ rule part is set to DAILY, WEEKLY, or MONTHLY.");
				}

				if (!Array.isArray(parts.BYYEARDAY)) parts.BYYEARDAY = parts.BYYEARDAY.split(",");

				this._byyearday = [];

				for (var _i2 = 0, _l2 = parts.BYYEARDAY.length; _i2 < _l2; ++_i2) {
					var _value2 = parts.BYYEARDAY[_i2];

					if (!_value2 || !Number.isInteger(+_value2) || _value2 | 0 < -366 || _value2 | 0 > 366) {
						throw new Error("Invalid BYYEARDAY value: " + _value2 + " (valid values are 1 to 366 or -366 to -1)");
					}

					this._byyearday.push(_value2 | 0);
				}
			}

			// BYWEEKNO
			// ---------------------------------------------------------------------

			if (notEmpty(parts.BYWEEKNO)) {
				if (this._freq !== RRule.YEARLY) throw new Error("The BYWEEKNO rule part MUST NOT be used when the FREQ rule part is set to anything other than YEARLY.");

				if (!Array.isArray(parts.BYWEEKNO)) parts.BYWEEKNO = parts.BYWEEKNO.split(",");

				this._byweekno = [];

				for (var _i3 = 0, _l3 = parts.BYWEEKNO.length; _i3 < _l3; ++_i3) {
					var _value3 = parts.BYWEEKNO[_i3];

					if (!_value3 || !Number.isInteger(+_value3) || _value3 | 0 < -53 || _value3 | 0 > 53) {
						throw new Error("Invalid BYWEEKNO value: " + _value3 + " (valid values are 1 to 53 or -53 to -1)");
					}

					this._byweekno.push(_value3 | 0);
				}
			}

			// BYMONTH
			// ---------------------------------------------------------------------

			if (notEmpty(parts.BYMONTH)) {
				if (!Array.isArray(parts.BYMONTH)) parts.BYMONTH = parts.BYMONTH.split(",");

				this._bymonth = [];

				for (var _i4 = 0, _l4 = parts.BYMONTH.length; _i4 < _l4; ++_i4) {
					var _value4 = parts.BYMONTH[_i4];

					if (!_value4 || !Number.isInteger(+_value4) || _value4 | 0 < 1 || _value4 | 0 > 12) {
						throw new Error("Invalid BYMONTH value: " + _value4);
					}

					this._bymonth.push(_value4 | 0);
				}
			}

			// BYSETPOS
			// ---------------------------------------------------------------------

			if (notEmpty(parts.BYSETPOS)) {
				if (!(notEmpty(parts.BYWEEKNO) || notEmpty(parts.BYYEARDAY) || notEmpty(parts.BYMONTHDAY) || notEmpty(parts.BYDAY) || notEmpty(parts.BYMONTH) || notEmpty(parts.BYHOUR) || notEmpty(parts.BYMINUTE) || notEmpty(parts.BYSETPOS))) {
					throw new Error("The BYSETPOS rule part MUST only be used in conjunction with another BYxxx rule part.");
				}

				if (!Array.isArray(parts.BYSETPOS)) parts.BYSETPOS = parts.BYSETPOS.split(",");

				this._bysetpos = [];

				for (var _i5 = 0, _l5 = parts.BYSETPOS.length; _i5 < _l5; ++_i5) {
					var _value5 = parts.BYSETPOS[_i5];

					if (!_value5 || !Number.isInteger(+_value5) || _value5 | 0 < -366 || _value5 | 0 > 366) {
						throw new Error("Invalid BYSETPOS value: " + _value5 + " (valid values are 1 to 366 or -366 to -1)");
					}

					this._bysetpos.push(_value5 | 0);
				}
			}

			// BYHOUR
			// ---------------------------------------------------------------------

			if (notEmpty(parts.BYHOUR)) {
				if (!Array.isArray(parts.BYHOUR)) parts.BYHOUR = parts.BYHOUR.split(",");

				this._byhour = [];

				for (var _i6 = 0, _l6 = parts.BYHOUR.length; _i6 < _l6; ++_i6) {
					var _value6 = parts.BYHOUR[_i6];

					if (!_value6 || !Number.isInteger(+_value6) || _value6 | 0 < 0 || _value6 | 0 > 23) {
						throw new Error("Invalid BYHOUR value: " + _value6);
					}

					this._byhour.push(_value6 | 0);
				}

				this._byhour.sort(function (a, b) {
					return a - b;
				});
			} else if (this._freq === RRule.HOURLY) {
				this._byhour = [format(this._dtstart, "G") | 0];
			}

			// BYMINUTE
			// ---------------------------------------------------------------------

			if (notEmpty(parts.BYMINUTE)) {
				if (!Array.isArray(parts.BYMINUTE)) parts.BYMINUTE = parts.BYMINUTE.split(",");

				this._byminute = [];

				for (var _i7 = 0, _l7 = parts.BYMINUTE.length; _i7 < _l7; ++_i7) {
					var _value7 = parts.BYMINUTE[_i7];

					if (!_value7 || !Number.isInteger(+_value7) || _value7 | 0 < 0 || _value7 | 0 > 59) {
						throw new Error("Invalid BYMINUTE value: " + _value7);
					}

					this._byminute.push(_value7 | 0);
				}

				this._byminute.sort(function (a, b) {
					return a - b;
				});
			} else if (this._freq === RRule.MINUTELY) {
				this._byminute = [format(this._dtstart, "i") | 0];
			}

			// BYSECOND
			// ---------------------------------------------------------------------

			if (notEmpty(parts.BYSECOND)) {
				if (!Array.isArray(parts.BYSECOND)) parts.BYSECOND = parts.BYSECOND.split(",");

				this._bysecond = [];

				for (var _i8 = 0, _l8 = parts.BYSECOND.length; _i8 < _l8; ++_i8) {
					var _value8 = parts.BYSECOND[_i8];

					// Yes, 60 is a valid value, in (very rare) cases on leap seconds
					// December 31, 2005 23:59:60 UTC is a valid date...
					// so is 2012-06-30T23:59:60UTC

					if (!_value8 || !Number.isInteger(+_value8) || _value8 | 0 < 0 || _value8 | 0 > 60) {
						throw new Error("Invalid BYSECOND value: " + _value8);
					}

					this._bysecond.push(_value8 | 0);
				}

				this._bysecond.sort(function (a, b) {
					return a - b;
				});
			} else if (this._freq === RRule.SECONDLY) {
				this._bysecond = [format(this._dtstart, "s") | 0];
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

				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = this._byhour[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var hour = _step.value;
						var _iteratorNormalCompletion2 = true;
						var _didIteratorError2 = false;
						var _iteratorError2 = undefined;

						try {
							for (var _iterator2 = this._byminute[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
								var minute = _step2.value;
								var _iteratorNormalCompletion3 = true;
								var _didIteratorError3 = false;
								var _iteratorError3 = undefined;

								try {
									for (var _iterator3 = this._bysecond[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
										var second = _step3.value;

										this._timeset.push([hour, minute, second]);
									}
								} catch (err) {
									_didIteratorError3 = true;
									_iteratorError3 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion3 && _iterator3.return) {
											_iterator3.return();
										}
									} finally {
										if (_didIteratorError3) {
											throw _iteratorError3;
										}
									}
								}
							}
						} catch (err) {
							_didIteratorError2 = true;
							_iteratorError2 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion2 && _iterator2.return) {
									_iterator2.return();
								}
							} finally {
								if (_didIteratorError2) {
									throw _iteratorError2;
								}
							}
						}
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			}
		}

		/**
	  * Gets the internal rule object, as it was passed to the constructor.
	  *
	  * @return {Object}
	  */


		createClass(RRule, [{
			key: "toString",


			/**
	   * Magic string converter
	   *
	   * @see RRule.rfcString()
	   * @return {string}
	   */
			value: function toString() {
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

		}, {
			key: "rfcString",
			value: function rfcString() {
				var includeTimezone = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

				var str = "";

				if (this._dtstart) {
					if (!includeTimezone) {
						str = "DTSTART:" + format(this._dtstart, "Ymd\THis") + "\nRRULE:";
					} else {
						str = "DTSTART:" + format(this._dtstart, "Ymd\THis\Z") + "\nRRULE:";
					}
				}

				var parts = [];

				for (var key in this._rule) {
					var value = this._rule[key];

					if (key === "DTSTART" || key === "INTERVAL" && value === 1 || key === "WKST" && value === "MO") continue;

					if (key === "UNTIL" && value) {
						if (!includeTimezone) {
							parts.push("UNTIL:" + format(this._until, "Ymd\THis"));
						} else {
							parts.push("UNTIL:" + format(this._until, "Ymd\THis\Z"));
						}

						continue;
					}

					if (key === "FREQ" && value && !~Object.keys(RRule.frequencies).indexOf(value)) {
						var index = Object.values(RRule.frequencies).indexOf(value);

						if (index > -1) value = Object.keys(RRule)[index];
					}

					if (value !== null) {
						if (Array.isArray(value)) value = value.join(",");

						parts.push((key + "=" + value).toUpperCase().replace(/ /g, ""));
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

		}, {
			key: "clearCache",


			/**
	   * Clear the cache
	   *
	   * It isn't recommended to use this method while iterating!
	   *
	   * @return {RRule}
	   */
			value: function clearCache() {
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


			/**
	   * Returns true if the RRule has no end condition (infinite)
	   *
	   * @return {boolean}
	   */

		}, {
			key: "getOccurrences",


			/**
	   * Return all the occurrences in an array of Date()'s
	   *
	   * @param {number|null=} limit - Limit the result set to n occurrences
	   *      (0, null, or false === everything)
	   * @return {Date[]}
	   */
			value: function getOccurrences() {
				var limit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

				if (!limit && this.isInfinite()) throw new Error("Cannot get all occurrences of an infinite recurrence rule!");

				var iterator = this;

				// Cached version already computed
				if (this._total !== null) iterator = this._cache;

				var res = [];
				var n = 0;

				var _iteratorNormalCompletion4 = true;
				var _didIteratorError4 = false;
				var _iteratorError4 = undefined;

				try {
					for (var _iterator4 = iterator[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
						var occurrence = _step4.value;

						res.push(new Date(occurrence.toUTCString()));
						++n;
						if (limit && n >= limit) break;
					}
				} catch (err) {
					_didIteratorError4 = true;
					_iteratorError4 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion4 && _iterator4.return) {
							_iterator4.return();
						}
					} finally {
						if (_didIteratorError4) {
							throw _iteratorError4;
						}
					}
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

		}, {
			key: "getOccurrencesBetween",
			value: function getOccurrencesBetween(begin, end) {
				var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

				if (begin !== null) begin = RRule.parseDate(begin);

				if (end !== null) end = RRule.parseDate(end);else if (!limit && this.isInfinite()) throw new Error("Cannot get all occurrences of an infinite recurrence rule!");

				var iterator = this;

				if (this._total === null) iterator = this._cache;

				var res = [];
				var n = 0;

				var _iteratorNormalCompletion5 = true;
				var _didIteratorError5 = false;
				var _iteratorError5 = undefined;

				try {
					for (var _iterator5 = iterator[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
						var occurrence = _step5.value;

						if (begin !== null && occurrence.getTime() < begin.getTime()) continue;

						if (end !== null && occurrence.getTime() > end.getTime()) break;

						res.push(new Date(occurrence.toUTCString()));
						++n;
						if (limit && n >= limit) break;
					}
				} catch (err) {
					_didIteratorError5 = true;
					_iteratorError5 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion5 && _iterator5.return) {
							_iterator5.return();
						}
					} finally {
						if (_didIteratorError5) {
							throw _iteratorError5;
						}
					}
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

		}, {
			key: "occursAt",
			value: function occursAt(date) {
				date = RRule.parseDate(date);
				var timestamp = date.getTime();

				// Check whether the date is in the cache
				// (whether the cache is complete or not)
				if (~this._cache.indexOf(date)) return true;

				// If the cache is complete and doesn't contain the date
				else if (this._total !== null) return false;

				// Check if date is within start and until
				if (timestamp < this._dtstart.getTime() || this._until && timestamp > this._until.getTime()) return false;

				// Check against the BYxxx rules (except BYSETPOS)
				if (this._byhour && !~this._byhour.indexOf(format(date, "G") | 0)) return false;

				if (this._byminute && !~this._byminute.indexOf(format(date, "i") | 0)) return false;

				if (this._bysecond && !~this._bysecond.indexOf(format(date, "s") | 0)) return false;

				// Create mask variable

				var _formatDate$split$map = format(date, "Y n j z N").split(" ").map(function (n) {
					return n | 0;
				}),
				    _formatDate$split$map2 = slicedToArray(_formatDate$split$map, 5),
				    year = _formatDate$split$map2[0],
				    month = _formatDate$split$map2[1],
				    day = _formatDate$split$map2[2],
				    yearDay = _formatDate$split$map2[3],
				    weekday = _formatDate$split$map2[4];

				var masks = {};

				masks["weekdayOf1stYearDay"] = format(new Date(year + "-01-01 00:00:00"), "N");

				masks["yearDayToWeekday"] = RRule.WEEKDAY_MASK.slice(masks["weekdayOf1stYearDay"] - 1);

				if (isLeapYear(year)) {
					masks["yearLen"] = 366;
					masks["lastDayOfMonth"] = RRule.LAST_DAY_OF_MONTH_366;
				} else {
					masks["yearLen"] = 365;
					masks["lastDayOfMonth"] = RRule.LAST_DAY_OF_MONTH;
				}

				var monthLen = masks["lastDayOfMonth"][month] - masks["lastDayOfMonth"][month - 1];

				if (this._bymonth && !~this._bymonth.indexOf(month)) return false;

				if (this._bymonthday || this._bymonthdayNegative) {
					var monthDayNegative = -1 * (monthLen - day + 1);

					if (!~this._bymonthday.indexOf(day) && !~this._bymonthdayNegative.indexOf(monthDayNegative)) return false;
				}

				if (this._byyearday) {
					// Caution here, yearDay starts from 0
					var yearDayNegative = -1 * (masks["yearLen"] - yearDay);

					if (!~this._byyearday.indexOf(yearDay + 1) && !~this._byyearday.indexOf(yearDayNegative)) return false;
				}

				if (this._byweekday || this._byweekdayNth) {
					this._buildNthWeekdayMask(year, month, day, masks);

					if (!~this._byweekday.indexOf(weekday) && !~masks["yearDayIsNthWeekday"].indexOf(yearDay)) return false;
				}

				if (this._byweekno) {
					this._buildWeekNoMask(year, month, day, masks);

					if (!~masks["yearDayIsInWeekNo"].indexOf(yearDay)) return false;
				}

				// Now we've exhausted all the BYxxx rules (except BYSETPOS), we still
				// need to consider FREQUENCY and INTERVAL.

				var _formatDate$split$map3 = format(this._dtstart, "Y-m-d").split("-").map(function (n) {
					return n | 0;
				}),
				    _formatDate$split$map4 = slicedToArray(_formatDate$split$map3, 2),
				    startYear = _formatDate$split$map4[0],
				    startMonth /*, startDay*/ = _formatDate$split$map4[1];

				switch (this._freq) {
					case RRule.YEARLY:
						if ((year - startYear) % this._interval !== 0) return false;
						break;

					case RRule.MONTHLY:
						{
							// We need to count the number of months elapsed
							var diff = 12 - startMonth + 12 * (year - startYear - 1) + month;

							if (diff % this._interval !== 0) return false;
							break;
						}

					case RRule.WEEKLY:
						{
							// Count the number of days and divide by 7 to get the number of
							// weeks. We add some days to align DTSTART with WKST.
							var _diff = dateDiff(date, this._dtstart);
							_diff = (_diff.days + pymod((format(this._dtstart, "N") | 0) - this._wkst, 7)) / 7 | 0;

							if (_diff % this._interval !== 0) return false;
							break;
						}

					case RRule.DAILY:
						{
							// Count the number of days
							var _diff2 = dateDiff(date, this._dtstart);
							if (_diff2.days % this._interval !== 0) return false;
							break;
						}

					case RRule.HOURLY:
						{
							var _diff3 = dateDiff(date, this._dtstart);
							_diff3 = _diff3.hours + _diff3.days * 24;
							if (_diff3 % this._interval !== 0) return false;
							break;
						}

					case RRule.MINUTELY:
						{
							var _diff4 = dateDiff(date, this._dtstart);
							_diff4 = _diff4.minutes + _diff4.hours * 60 + _diff4.days * 1440;
							if (_diff4 % this._interval !== 0) return false;
							break;
						}

					case RRule.SECONDLY:
						{
							var _diff5 = dateDiff(date, this._dtstart);
							// XXX doesn't count for leap seconds (should it?)
							_diff5 = _diff5.seconds + _diff5.minutes * 60 + _diff5.hours * 3600 + _diff5.days * 86400;
							if (_diff5 % this._interval !== 0) return false;
							break;
						}

					default:
						throw new Error("Invalid frequency: " + this._freq);
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

				if (!this._count && !this._bysetpos) return true;

				// As a fallback we have to loop :(
				var _iteratorNormalCompletion6 = true;
				var _didIteratorError6 = false;
				var _iteratorError6 = undefined;

				try {
					for (var _iterator6 = this[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
						var occurrence = _step6.value;

						if (occurrence.getTime() === date.getTime()) return true;

						if (occurrence.getTime() > date.getTime()) break;
					}

					// If the loop came up short
				} catch (err) {
					_didIteratorError6 = true;
					_iteratorError6 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion6 && _iterator6.return) {
							_iterator6.return();
						}
					} finally {
						if (_didIteratorError6) {
							throw _iteratorError6;
						}
					}
				}

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

		}, {
			key: "_getDaySet",


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
			value: function _getDaySet(year, month, day, masks) {
				switch (this._freq) {
					case RRule.YEARLY:
						return range(0, masks["yearLen"] - 1);

					case RRule.MONTHLY:
						{
							var start = masks["lastDayOfMonth"][month - 1],
							    stop = masks["lastDayOfMonth"][month];

							return range(start, stop - 1);
						}

					case RRule.WEEKLY:
						{
							// On first iteration, the first week will not be complete.
							// We don't backtrack to the first day of the week, to avoid
							// crossing year boundary in reverse (i.e. if the week started
							// during the previous year), because that would generate
							// negative indexes (which would not work with the masks).
							var set$$1 = [];
							var _i9 = format(new Date(year, month - 1, day, 0, 0, 0), "z") | 0;

							for (var j = 0; j < 7; ++j) {
								set$$1.push(_i9);
								++_i9;
								if (masks["yearDayToWeekday"][_i9] === this._wkst) break;
							}

							return set$$1;
						}

					case RRule.DAILY:
					case RRule.HOURLY:
					case RRule.MINUTELY:
					case RRule.SECONDLY:
						var i = format(new Date(year, month - 1, day, 0, 0, 0), "z") | 0;
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

		}, {
			key: "_buildNthWeekdayMask",
			value: function _buildNthWeekdayMask(year, month, day, masks) {
				masks["yearDayIsNthWeekday"] = [];

				if (this._byweekdayNth) {
					var ranges = [];

					if (this._freq === RRule.YEARLY) {
						if (this._bymonth) {
							var _iteratorNormalCompletion7 = true;
							var _didIteratorError7 = false;
							var _iteratorError7 = undefined;

							try {
								for (var _iterator7 = this._bymonth[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
									var byMonth = _step7.value;

									ranges.push([masks["lastDayOfMonth"][byMonth - 1], masks["lastDayOfMonth"][byMonth] - 1]);
								}
							} catch (err) {
								_didIteratorError7 = true;
								_iteratorError7 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion7 && _iterator7.return) {
										_iterator7.return();
									}
								} finally {
									if (_didIteratorError7) {
										throw _iteratorError7;
									}
								}
							}
						} else {
							ranges = [[0, masks["yearLen"] - 1]];
						}
					} else if (this._freq === RRule.MONTHLY) {
						ranges.push([masks["lastDayOfMonth"][month - 1], masks["lastDayOfMonth"][month] - 1]);
					}

					if (ranges.length) {
						// Weekly frequency won't get here, so we don't need to worry
						// about cross-year weekly periods.
						var _iteratorNormalCompletion8 = true;
						var _didIteratorError8 = false;
						var _iteratorError8 = undefined;

						try {
							for (var _iterator8 = ranges[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
								var _ref = _step8.value;

								var _ref2 = slicedToArray(_ref, 2);

								var first = _ref2[0];
								var last = _ref2[1];
								var _iteratorNormalCompletion9 = true;
								var _didIteratorError9 = false;
								var _iteratorError9 = undefined;

								try {
									for (var _iterator9 = this._byweekdayNth[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
										var _ref3 = _step9.value;

										var _ref4 = slicedToArray(_ref3, 2);

										var weekday = _ref4[0];
										var nth = _ref4[1];

										var i = void 0;

										if (nth < 0) {
											i = last + (nth + 1) * 7;
											i = i - pymod(masks["yearDayToWeekday"][i] - weekday, 7);
										} else {
											i = first + (nth - 1) * 7;
											i = i + (7 - masks["yearDayToWeekDay"][i] + weekday) % 7;
										}

										if (i >= first && i <= last) {
											masks["yearDayIsNthWeekday"][i] = true;
										}
									}
								} catch (err) {
									_didIteratorError9 = true;
									_iteratorError9 = err;
								} finally {
									try {
										if (!_iteratorNormalCompletion9 && _iterator9.return) {
											_iterator9.return();
										}
									} finally {
										if (_didIteratorError9) {
											throw _iteratorError9;
										}
									}
								}
							}
						} catch (err) {
							_didIteratorError8 = true;
							_iteratorError8 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion8 && _iterator8.return) {
									_iterator8.return();
								}
							} finally {
								if (_didIteratorError8) {
									throw _iteratorError8;
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

		}, {
			key: "_buildWeekNoMask",
			value: function _buildWeekNoMask(year, month, day, masks) {
				masks["yearDayIsInWeekNo"] = [];

				// Calculate the index of the first WKST day of the year.
				// 0 === the first day of the year in the WKST day
				// (e.g. WKST is Monday & Jan 1st is a Monday)
				// n === there is n days before the first WKST day of the year
				// If n >= 4, this is the first day of the year (even though it started
				// the year before)
				var firstWKST = (7 - masks["weekdayOf1stYearDay"] + this._wkst) % 7;
				var firstWKSTOffset = void 0,
				    nbDays = void 0;

				if (firstWKST >= 4) {
					firstWKSTOffset = 0;

					// Number of days in the year, plus the days we got from last year
					nbDays = masks["yearLen"] + masks["weekdayOf1stYearDay"] - this._wkst;
				} else {
					firstWKSTOffset = firstWKST;

					// Number of days in the year, minus the days we left in last year
					nbDays = masks["yearLen"] - firstWKST;
				}

				var nbWeeks = (nbDays / 7 | 0) + (nbDays % 7 / 4 | 0);

				// Now we know when the first week starts and the number of weeks of the
				// year, we can generate a map of every year day that are in the weeks
				// specified in BYWEEKNO
				var _iteratorNormalCompletion10 = true;
				var _didIteratorError10 = false;
				var _iteratorError10 = undefined;

				try {
					for (var _iterator10 = this._byweekno[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
						var n = _step10.value;

						if (n < 0) n = n + nbWeeks + 1;

						if (n <= 0 || n > nbWeeks) continue;

						var i = void 0;

						if (n > 1) {
							i = firstWKSTOffset + (n - 1) * 7;

							// If week #1 started the previous year, realign the start of
							// the week
							if (firstWKSTOffset !== firstWKST) i = i - (7 - firstWKST);
						} else {
							i = firstWKSTOffset;
						}

						// Now add 7 days into the result set, stopping either at 7 or if we
						// reach WKST before (in the case of a short first week of the year)
						for (var _j = 0; _j < 7; ++_j) {
							masks["yearDayIsInWeekNo"][i] = true;
							++i;
							if (masks["yearDayToWeekday"][i] === this._wkst) break;
						}
					}

					// If we asked for week #1, it's possible that week #1 of the next year
					// already started this year. Therefore we need to return also matching
					// days of next year.
				} catch (err) {
					_didIteratorError10 = true;
					_iteratorError10 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion10 && _iterator10.return) {
							_iterator10.return();
						}
					} finally {
						if (_didIteratorError10) {
							throw _iteratorError10;
						}
					}
				}

				if (~this._byweekno.indexOf(1)) {
					// Check week number 1 of next year as well
					// TODO: Check -numweeks for next year
					var i = firstWKSTOffset + nbWeeks * 7;

					if (firstWKSTOffset !== firstWKST) i = i - (7 - firstWKST);

					if (i < masks["yearLen"]) {
						// If the week starts in the next year, we don't care about it
						for (var j = 0; j < 7; ++j) {
							masks["yearDayIsInWeekNo"][i] = true;
							++i;
							if (masks["yearDayToWeekday"][i] === this._wkst) break;
						}
					}
				}

				if (firstWKSTOffset) {
					// Check the last week number of last year as well.
					// If firstWKSTOffset is 0, either the year start on week start or
					// week #1 got days from last year, so there are no days from last
					// years last week number in this year
					var nbWeeksLastYear = void 0;

					if (!~this._byweekno.indexOf(-1)) {
						var weekdayOf1stYearDay = format(new Date(year - 1, 0, 1, 0, 0, 0), "N");
						var lastYearLen = 365 + isLeapYear(year - 1) | 0;

						var firstWKSTOffsetLastYear = (7 - weekdayOf1stYearDay + this._wkst) % 7;

						if (firstWKSTOffsetLastYear >= 4) {
							// firstWKSTOffsetLastYear = 0;
							nbWeeksLastYear = 52 + (lastYearLen + (weekdayOf1stYearDay - this._wkst) % 7) % 7 / 4 | 0;
						} else {
							nbWeeksLastYear = 52 + (masks["yearLen"] - firstWKSTOffset) % 7 / 4 | 0;
						}
					} else {
						nbWeeksLastYear = -1;
					}

					if (~this._byweekno.indexOf(nbWeeksLastYear)) for (var _i10 = 0; _i10 < firstWKSTOffset; ++_i10) {
						masks["yearDayIsInWeekNo"][_i10] = true;
					}
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

		}, {
			key: "_getTimeSet",
			value: function _getTimeSet(hour, minute, second) {
				switch (this._freq) {
					case RRule.HOURLY:
						{
							var set$$1 = [];
							var _iteratorNormalCompletion11 = true;
							var _didIteratorError11 = false;
							var _iteratorError11 = undefined;

							try {
								for (var _iterator11 = this._byminute[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
									var _minute = _step11.value;

									// Should we use another type?
									set$$1.push([hour, _minute, second]);
								} // Sort?
							} catch (err) {
								_didIteratorError11 = true;
								_iteratorError11 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion11 && _iterator11.return) {
										_iterator11.return();
									}
								} finally {
									if (_didIteratorError11) {
										throw _iteratorError11;
									}
								}
							}

							return set$$1;
						}

					case RRule.MINUTELY:
						{
							var _set = [];
							var _iteratorNormalCompletion12 = true;
							var _didIteratorError12 = false;
							var _iteratorError12 = undefined;

							try {
								for (var _iterator12 = this._bysecond[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
									var _second = _step12.value;

									// Should we use another type?
									_set.push([hour, _second, _second]);
								} // Sort?
							} catch (err) {
								_didIteratorError12 = true;
								_iteratorError12 = err;
							} finally {
								try {
									if (!_iteratorNormalCompletion12 && _iterator12.return) {
										_iterator12.return();
									}
								} finally {
									if (_didIteratorError12) {
										throw _iteratorError12;
									}
								}
							}

							return _set;
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

		}, {
			key: Symbol.iterator,
			value: /*#__PURE__*/regeneratorRuntime.mark(function value() {
				var year, month, day, hour, minute, second, daySet, masks, timeSet, dtStart, useCache, total, occurrence, tmp, _formatDate$split, _formatDate$split2, _formatDate$split3, _formatDate$split4, maxCycles, i, filteredSet, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, yearDay, _filteredSet, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, pos, n, div, mod, _yearDay, time, _tmp, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, _occurrence, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, _yearDay2, _occurrence2, _iteratorNormalCompletion17, _didIteratorError17, _iteratorError17, _iterator17, _step17, _time, daysIncrement, _div, found, j, _div2, _mod, _found, _j2, _div3, _mod2, _found2, _j3, _div4, _mod3, d, _formatDate$split5, _formatDate$split6;

				return regeneratorRuntime.wrap(function value$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								year = null, month = null, day = null, hour = null, minute = null, second = null, daySet = null, masks = null, timeSet = null, dtStart = null, useCache = true, total = 0;

							case 1:

								if (!useCache) {
									_context.next = 16;
									break;
								}

								_context.t0 = regeneratorRuntime.keys(this._cache);

							case 4:
								if ((_context.t1 = _context.t0()).done) {
									_context.next = 12;
									break;
								}

								occurrence = _context.t1.value;

								dtStart = occurrence;
								++total.total;
								_context.next = 10;
								return new Date(occurrence.getTime());

							case 10:
								_context.next = 4;
								break;

							case 12:

								useCache = false;

								// If the cache has been used up and we know there is nothing else...

								if (!(total.total === this._total)) {
									_context.next = 15;
									break;
								}

								return _context.abrupt("return");

							case 15:

								if (dtStart) {
									dtStart = new Date(dtStart.getTime());

									// Skip the last occurrence of the cache
									if (this._freq === RRule.SECONDLY) {
										dtStart.setSeconds(dtStart.getSeconds() + this._interval);
									} else {
										dtStart.setSeconds(dtStart.getSeconds() + 1);
									}
								}

							case 16:
								if (!(this._count && total >= this._count)) {
									_context.next = 18;
									break;
								}

								return _context.abrupt("return");

							case 18:

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
										tmp = new Date(dtStart.getTime());

										tmp.setDate(tmp.getDate() - pymod(format(dtStart, "N") - this._wkst, 7));

										_formatDate$split = format(tmp, "Y n j G i s").split(" ");
										_formatDate$split2 = slicedToArray(_formatDate$split, 6);
										year = _formatDate$split2[0];
										month = _formatDate$split2[1];
										day = _formatDate$split2[2];
										hour = _formatDate$split2[3];
										minute = _formatDate$split2[4];
										second = _formatDate$split2[5];
									} else {
										_formatDate$split3 = format(dtStart, "Y n j G i s").split(" ");
										_formatDate$split4 = slicedToArray(_formatDate$split3, 6);
										year = _formatDate$split4[0];
										month = _formatDate$split4[1];
										day = _formatDate$split4[2];
										hour = _formatDate$split4[3];
										minute = _formatDate$split4[4];
										second = _formatDate$split4[5];
									}

									// Force back to ints (& remove leading zeros)
									year = year | 0;
									month = month | 0;
									day = day | 0;
									hour = hour | 0;
									minute = minute | 0;
									second = second | 0;
								}

								// Initialize the time set
								if (timeSet === null) {
									if (this._freq < RRule.HOURLY) {
										// For daily, weekly, monthly, or yearly, we don't need to
										// calculate  a new time set.
										timeSet = this._timeset;
									} else {
										// Initialize empty if it's not going to occur on the
										// first iteration
										if (this._freq >= RRule.HOURLY && this._byhour && !~this._byhour.indexOf(hour) || this._freq >= RRule.MINUTELY && this._byminute && !~this._byminute.indexOf(minute) || this._freq >= RRule.SECONDLY && this._bysecond && !~this._bysecond.indexOf(second)) {
											timeSet = [];
										} else {
											timeSet = this._getTimeSet(hour, minute, second);
										}
									}
								}

								maxCycles = RRule.REPEAT_CYCLES[this._freq <= RRule.DAILY ? this._freq : RRule.DAILY];
								i = 0;

							case 23:
								if (!(i < maxCycles)) {
									_context.next = 261;
									break;
								}

								if (!(daySet === null)) {
									_context.next = 94;
									break;
								}

								// Rebuild the various masks and converters. These arrays
								// will allow fast date operations without relying on
								// Date functions.
								if (!masks.length || masks["year"] !== year || masks["month"] !== month) {
									masks = {
										year: "",
										month: ""
									};

									// Only if year has changed
									// TODO(Tam): Won't this always be true?
									if (masks["year"] !== year) {
										masks["leapYear"] = isLeapYear(year);
										masks["yearLen"] = 365 + masks["leapYear"] | 0;
										masks["nextYearLen"] = 365 + isLeapYear(year + 1) | 0;
										masks["weekdayOf1stYearDay"] = format(new Date(year, 0, 1, 0, 0, 0), "N");
										masks["yearDayToWeekday"] = RRule.WEEKDAY_MASK.slice(masks["weekdayOf1stYearDay"] - 1);

										if (masks["leapYear"]) {
											masks["yearDayToMonth"] = RRule.MONTH_MASK_366;
											masks["yearDayToMonthDay"] = RRule.MONTHDAY_MASK_366;
											masks["yearDayToMonthDayNegative"] = RRule.NEGATIVE_MONTHDAY_MASK_366;
											masks["lastDayOfMonth"] = RRule.LAST_DAY_OF_MONTH_366;
										} else {
											masks["yearDayToMonth"] = RRule.MONTH_MASK;
											masks["yearDayToMonthDay"] = RRule.MONTHDAY_MASK;
											masks["yearDayToMonthDayNegative"] = RRule.NEGATIVE_MONTHDAY_MASK;
											masks["lastDayOfMonth"] = RRule.LAST_DAY_OF_MONTH;
										}

										if (this._byweekno) this._buildWeekNoMask(year, month, day, masks);
									}

									// Every time month or year changes
									if (this._byweekdayNth) this._buildNthWeekdayMask(year, month, day, masks);

									masks["year"] = year;
									masks["month"] = month;
								}

								// Calculate the current set
								daySet = this._getDaySet(year, month, day, masks);

								filteredSet = [];

								// Filter out the days based on the BYxxx rules

								_iteratorNormalCompletion13 = true;
								_didIteratorError13 = false;
								_iteratorError13 = undefined;
								_context.prev = 31;
								_iterator13 = daySet[Symbol.iterator]();

							case 33:
								if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
									_context.next = 55;
									break;
								}

								yearDay = _step13.value;

								if (!(this._bymonth && !~this._bymonth.indexOf(masks["yearDayToMonth"][yearDay]))) {
									_context.next = 37;
									break;
								}

								return _context.abrupt("continue", 52);

							case 37:
								if (!(this._byweekno && masks["yearDayIsInWeekNo"][yearDay] === undefined)) {
									_context.next = 39;
									break;
								}

								return _context.abrupt("continue", 52);

							case 39:
								if (!this._byyearday) {
									_context.next = 47;
									break;
								}

								if (!(yearDay <= masks["yearLen"])) {
									_context.next = 45;
									break;
								}

								if (!(!~this._byyearday.indexOf(yearDay + 1) && !~this._byyearday.indexOf(-masks["yearLen"] + yearDay))) {
									_context.next = 43;
									break;
								}

								return _context.abrupt("continue", 52);

							case 43:
								_context.next = 47;
								break;

							case 45:
								if (!(!~this._byyearday.indexOf(yearDay + 1 - masks["yearLen"]) && !~this._byyearday.indexOf(-masks["nextYearLen"] + yearDay - masks["yearLen"]))) {
									_context.next = 47;
									break;
								}

								return _context.abrupt("continue", 52);

							case 47:
								if (!((this._bymonthday || this._bymonthdayNegative) && !~this._bymonthday.indexOf(masks["yearDayToMonthDay"][yearDay]) && !~this._bymonthdayNegative.indexOf(masks["yearDayToMonthDayNegative"][yearDay]))) {
									_context.next = 49;
									break;
								}

								return _context.abrupt("continue", 52);

							case 49:
								if (!((this._byweekday || this._byweekdayNth) && !~this._byweekday.indexOf(masks["yearDayToWeekday"][yearDay]) && masks["yearDayIsNthWeekday"][yearDay] === undefined)) {
									_context.next = 51;
									break;
								}

								return _context.abrupt("continue", 52);

							case 51:

								filteredSet.push(yearDay);

							case 52:
								_iteratorNormalCompletion13 = true;
								_context.next = 33;
								break;

							case 55:
								_context.next = 61;
								break;

							case 57:
								_context.prev = 57;
								_context.t2 = _context["catch"](31);
								_didIteratorError13 = true;
								_iteratorError13 = _context.t2;

							case 61:
								_context.prev = 61;
								_context.prev = 62;

								if (!_iteratorNormalCompletion13 && _iterator13.return) {
									_iterator13.return();
								}

							case 64:
								_context.prev = 64;

								if (!_didIteratorError13) {
									_context.next = 67;
									break;
								}

								throw _iteratorError13;

							case 67:
								return _context.finish(64);

							case 68:
								return _context.finish(61);

							case 69:

								daySet = filteredSet;

								// If BYSETPOS is set, we need to expand the time set to
								// filter by pos, so we'll make a special loop to return
								// while generating

								if (!(this._bysetpos && timeSet.length)) {
									_context.next = 94;
									break;
								}

								_filteredSet = {};
								_iteratorNormalCompletion14 = true;
								_didIteratorError14 = false;
								_iteratorError14 = undefined;
								_context.prev = 75;


								for (_iterator14 = this._bysetpos[Symbol.iterator](); !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
									pos = _step14.value;
									n = timeSet.length;


									if (pos < 0) pos = n * daySet.length + pos;else pos = pos - 1;

									div = pos / n | 0, mod = pos % n; // timePos

									if (daySet[div] !== undefined && timeSet[mod] !== undefined) {
										_yearDay = daySet[div], time = timeSet[mod];

										// Used as key to ensure uniqueness

										_tmp = year + ":" + _yearDay + ":" + time[0] + ":" + time[1] + ":" + time[2];

										if (_filteredSet[_tmp] === undefined) {
											_filteredSet[_tmp] = new Date(year, 0, _yearDay, time[0], time[1], time[2]);
										}
									}
								}

								_context.next = 83;
								break;

							case 79:
								_context.prev = 79;
								_context.t3 = _context["catch"](75);
								_didIteratorError14 = true;
								_iteratorError14 = _context.t3;

							case 83:
								_context.prev = 83;
								_context.prev = 84;

								if (!_iteratorNormalCompletion14 && _iterator14.return) {
									_iterator14.return();
								}

							case 86:
								_context.prev = 86;

								if (!_didIteratorError14) {
									_context.next = 89;
									break;
								}

								throw _iteratorError14;

							case 89:
								return _context.finish(86);

							case 90:
								return _context.finish(83);

							case 91:
								_filteredSet = Object.values(_filteredSet);
								_filteredSet.sort(function (a, b) {
									return a - b;
								});
								daySet = _filteredSet;

							case 94:
								if (!(this._bysetpos && timeSet.length)) {
									_context.next = 129;
									break;
								}

								_iteratorNormalCompletion15 = true;
								_didIteratorError15 = false;
								_iteratorError15 = undefined;
								_context.prev = 98;
								_iterator15 = daySet[Symbol.iterator]();

							case 100:
								if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
									_context.next = 113;
									break;
								}

								_occurrence = _step15.value;

								if (!(this._until && _occurrence.getTime() > this._until.getTime())) {
									_context.next = 105;
									break;
								}

								this._total = total;
								return _context.abrupt("return");

							case 105:
								if (!(_occurrence.getTime() >= dtStart.getTime())) {
									_context.next = 110;
									break;
								}

								++total;
								this._cache.push(_occurrence);
								_context.next = 110;
								return new Date(_occurrence.getTime());

							case 110:
								_iteratorNormalCompletion15 = true;
								_context.next = 100;
								break;

							case 113:
								_context.next = 119;
								break;

							case 115:
								_context.prev = 115;
								_context.t4 = _context["catch"](98);
								_didIteratorError15 = true;
								_iteratorError15 = _context.t4;

							case 119:
								_context.prev = 119;
								_context.prev = 120;

								if (!_iteratorNormalCompletion15 && _iterator15.return) {
									_iterator15.return();
								}

							case 122:
								_context.prev = 122;

								if (!_didIteratorError15) {
									_context.next = 125;
									break;
								}

								throw _iteratorError15;

							case 125:
								return _context.finish(122);

							case 126:
								return _context.finish(119);

							case 127:
								_context.next = 189;
								break;

							case 129:
								_iteratorNormalCompletion16 = true;
								_didIteratorError16 = false;
								_iteratorError16 = undefined;
								_context.prev = 132;
								_iterator16 = daySet[Symbol.iterator]();

							case 134:
								if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
									_context.next = 175;
									break;
								}

								_yearDay2 = _step16.value;
								_occurrence2 = new Date(year, 0, _yearDay2, 0, 0, 0);
								_iteratorNormalCompletion17 = true;
								_didIteratorError17 = false;
								_iteratorError17 = undefined;
								_context.prev = 140;
								_iterator17 = timeSet[Symbol.iterator]();

							case 142:
								if (_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done) {
									_context.next = 158;
									break;
								}

								_time = _step17.value;

								_occurrence2.setHours(_time[0]);
								_occurrence2.setMinutes(_time[0]);
								_occurrence2.setSeconds(_time[0]);

								// Consider end conditions

								if (!(this._until && _occurrence2.getTime() > this._until.getTime())) {
									_context.next = 150;
									break;
								}

								this._total = total;
								return _context.abrupt("return");

							case 150:
								if (!(_occurrence2.getTime() >= dtStart.getTime())) {
									_context.next = 155;
									break;
								}

								++total;
								this._cache.push(_occurrence2);
								_context.next = 155;
								return new Date(_occurrence2.getTime());

							case 155:
								_iteratorNormalCompletion17 = true;
								_context.next = 142;
								break;

							case 158:
								_context.next = 164;
								break;

							case 160:
								_context.prev = 160;
								_context.t5 = _context["catch"](140);
								_didIteratorError17 = true;
								_iteratorError17 = _context.t5;

							case 164:
								_context.prev = 164;
								_context.prev = 165;

								if (!_iteratorNormalCompletion17 && _iterator17.return) {
									_iterator17.return();
								}

							case 167:
								_context.prev = 167;

								if (!_didIteratorError17) {
									_context.next = 170;
									break;
								}

								throw _iteratorError17;

							case 170:
								return _context.finish(167);

							case 171:
								return _context.finish(164);

							case 172:
								_iteratorNormalCompletion16 = true;
								_context.next = 134;
								break;

							case 175:
								_context.next = 181;
								break;

							case 177:
								_context.prev = 177;
								_context.t6 = _context["catch"](132);
								_didIteratorError16 = true;
								_iteratorError16 = _context.t6;

							case 181:
								_context.prev = 181;
								_context.prev = 182;

								if (!_iteratorNormalCompletion16 && _iterator16.return) {
									_iterator16.return();
								}

							case 184:
								_context.prev = 184;

								if (!_didIteratorError16) {
									_context.next = 187;
									break;
								}

								throw _iteratorError16;

							case 187:
								return _context.finish(184);

							case 188:
								return _context.finish(181);

							case 189:

								// 3. Reset the loop to the next interval
								daysIncrement = 0;
								_context.t7 = this._freq;
								_context.next = _context.t7 === RRule.YEARLY ? 193 : _context.t7 === RRule.MONTHLY ? 195 : _context.t7 === RRule.WEEKLY ? 198 : _context.t7 === RRule.DAILY ? 200 : _context.t7 === RRule.HOURLY ? 202 : _context.t7 === RRule.MINUTELY ? 220 : _context.t7 === RRule.SECONDLY ? 238 : 256;
								break;

							case 193:
								// We don't care about month or day not existing, they
								// are not used in the yearly frequency.
								year += this._interval;
								return _context.abrupt("break", 256);

							case 195:
								// We don't care about the day of the month not
								// existing, it isn't used in the monthly frequency.
								month += this._interval;

								if (month > 12) {
									_div = month / 12 | 0;

									month = month % 12;
									year += _div;

									if (month === 0) {
										month = 12;
										year -= 1;
									}
								}
								return _context.abrupt("break", 256);

							case 198:
								daysIncrement = this._interval * 7;
								return _context.abrupt("break", 256);

							case 200:
								daysIncrement = this._interval;
								return _context.abrupt("break", 256);

							case 202:
								if (!daySet || daySet.length === 0) {
									// An empty set means that this day has been
									// filtered out by one of the BYxxx rules. So there
									// is no need to examine it any further, we know
									// nothing is going to occur anyway. So we jump to
									// an iteration right before the next day.
									hour += (23 - hour) / this._interval * this._interval | 0;
								}

								found = false;
								j = 0;

							case 205:
								if (!(j < RRule.REPEAT_CYCLES[RRule.HOURLY])) {
									_context.next = 215;
									break;
								}

								hour += this._interval;
								_div2 = hour / 24 | 0, _mod = hour % 24;


								if (_div2) {
									hour = _mod;
									daysIncrement += _div2;
								}

								if (!(!this._byhour || ~this._byhour.indexOf(hour))) {
									_context.next = 212;
									break;
								}

								found = true;
								return _context.abrupt("break", 215);

							case 212:
								++j;
								_context.next = 205;
								break;

							case 215:
								if (found) {
									_context.next = 218;
									break;
								}

								this._total = total;
								return _context.abrupt("return");

							case 218:

								timeSet = this._getTimeSet(hour, minute, second);
								return _context.abrupt("break", 256);

							case 220:
								if (!daySet || !daySet.length) {
									minute += ((1439 - hour * 60 * minute) / this._interval | 0) * this._interval;
								}

								_found = false;
								_j2 = 0;

							case 223:
								if (!(_j2 < RRule.REPEAT_CYCLES[RRule.MINUTELY])) {
									_context.next = 233;
									break;
								}

								minute += this._interval;
								_div3 = minute / 60 | 0, _mod2 = minute % 60;


								if (_div3) {
									minute = _mod2;
									hour += _div3;

									_div3 = hour / 24 | 0;
									_mod2 = hour % 24;

									if (_div3) {
										hour = _mod2;
										daysIncrement += _div3;
									}
								}

								if (!((!this._byhour || ~this._byhour.indexOf(hour)) && (!this._byminute || ~this._byminute.indexOf(minute)))) {
									_context.next = 230;
									break;
								}

								_found = true;
								return _context.abrupt("return");

							case 230:
								++_j2;
								_context.next = 223;
								break;

							case 233:
								if (_found) {
									_context.next = 236;
									break;
								}

								this._total = total;
								return _context.abrupt("return");

							case 236:

								timeSet = this._getTimeSet(hour, minute, second);
								return _context.abrupt("break", 256);

							case 238:
								if (!daySet || !daySet.length) {
									second += (86399 - (hour * 3600 + minute * 60 + second)) / this._interval | 0;
								}

								_found2 = false;
								_j3 = 0;

							case 241:
								if (!(_j3 < RRule.REPEAT_CYCLES[RRule.SECONDLY])) {
									_context.next = 251;
									break;
								}

								second += this._interval;

								_div4 = second / 60 | 0, _mod3 = second % 60;


								if (_div4) {
									second = _mod3;
									minute += _div4;

									_div4 = minute / 60 | 0;
									_mod3 = minute % 60;

									if (_div4) {
										minute = _mod3;
										hour += _div4;

										_div4 = hour / 24 | 0;
										_mod3 = hour % 24;

										if (_div4) {
											hour = _mod3;
											daysIncrement += _div4;
										}
									}
								}

								if (!(!this._byhour || ~this._byhour.indexOf(hour) || !this._byminute || ~this._byminute.indexOf(minute) || !this._bysecond || ~this._bysecond.indexOf(second))) {
									_context.next = 248;
									break;
								}

								_found2 = true;
								return _context.abrupt("break", 251);

							case 248:
								++_j3;
								_context.next = 241;
								break;

							case 251:
								if (_found2) {
									_context.next = 254;
									break;
								}

								this._total = total;
								return _context.abrupt("return");

							case 254:

								timeSet = this._getTimeSet(hour, minute, second);
								return _context.abrupt("break", 256);

							case 256:

								// Here we take a little shortcut from the Python version by
								// using Date()
								if (daysIncrement) {
									d = new Date(year, month - 1, day);

									d.setDate(d.getDate() + daysIncrement);
									_formatDate$split5 = format(d, "Y-n-j").split("-");
									_formatDate$split6 = slicedToArray(_formatDate$split5, 3);
									year = _formatDate$split6[0];
									month = _formatDate$split6[1];
									day = _formatDate$split6[2];
								}

								// Reset the loop
								daySet = null;

							case 258:
								++i;
								_context.next = 23;
								break;

							case 261:

								this._total = total;
								return _context.abrupt("return");

							case 265:
							case "end":
								return _context.stop();
						}
					}
				}, value, this, [[31, 57, 61, 69], [62,, 64, 68], [75, 79, 83, 91], [84,, 86, 90], [98, 115, 119, 127], [120,, 122, 126], [132, 177, 181, 189], [140, 160, 164, 172], [165,, 167, 171], [182,, 184, 188]]);
			})

			// Constants
			// =========================================================================

			// Every mask is 7 days longer to handle cross-year weekly periods

		}, {
			key: "rule",
			get: function get$$1() {
				return this._rule;
			}
		}], [{
			key: "createFromRfcString",
			value: function createFromRfcString(string) {
				var forceRSet = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

				var cls = RSet;

				if (!forceRSet) {
					// Try to detect if we have an RRule or a Set
					var upperCasedString = string.toUpperCase();
					var nbRRule = upperCasedString.split("RRULE").length - 1;

					if (nbRRule === 0) cls = RRule;else if (nbRRule > 1) cls = RSet;else {
						cls = RRule;

						if (!~upperCasedString.indexOf("EXDATE") || !~upperCasedString.indexOf("RDATE") || !~upperCasedString.indexOf("EXRULE")) {
							cls = RSet;
						}
					}
				}

				return new cls(string);
			}
		}, {
			key: "parseDate",
			value: function parseDate(rawDate) {
				var date = new Date(rawDate);

				if (isNaN(date.getTime())) throw new Error("Unable to parse date: " + rawDate);

				return new Date(date.toUTCString());
			}
		}, {
			key: "MONTH_MASK",
			get: function get$$1() {
				return [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 1, 1, 1, 1, 1, 1, 1];
			}
		}, {
			key: "MONTH_MASK_366",
			get: function get$$1() {
				return [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 1, 1, 1, 1, 1, 1, 1];
			}
		}, {
			key: "MONTHDAY_MASK",
			get: function get$$1() {
				return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7];
			}
		}, {
			key: "MONTHDAY_MASK_366",
			get: function get$$1() {
				return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7];
			}
		}, {
			key: "NEGATIVE_MONTHDAY_MASK",
			get: function get$$1() {
				return [-31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25];
			}
		}, {
			key: "NEGATIVE_MONTHDAY_MASK_366",
			get: function get$$1() {
				return [-31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, -21, -20, -19, -18, -17, -16, -15, -14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, -31, -30, -29, -28, -27, -26, -25];
			}
		}, {
			key: "WEEKDAY_MASK",
			get: function get$$1() {
				return [1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5, 6, 7];
			}
		}, {
			key: "LAST_DAY_OF_MONTH",
			get: function get$$1() {
				return [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
			}
		}, {
			key: "LAST_DAY_OF_MONTH_366",
			get: function get$$1() {
				return [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];
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

		}, {
			key: "REPEAT_CYCLES",
			get: function get$$1() {
				var _ref5;

				return _ref5 = {}, defineProperty(_ref5, RRule.YEARLY, 28), defineProperty(_ref5, RRule.MONTHLY, 336), defineProperty(_ref5, RRule.WEEKLY, 1461), defineProperty(_ref5, RRule.DAILY, 10227), defineProperty(_ref5, RRule.HOURLY, 24), defineProperty(_ref5, RRule.MINUTELY, 1440), defineProperty(_ref5, RRule.SECONDLY, 86400), _ref5;
			}
		}]);
		return RRule;
	}();

	exports.RRule = RRule;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
