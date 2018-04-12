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
					for (var _iterator = this._byHour[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var hour = _step.value;
						var _iteratorNormalCompletion2 = true;
						var _didIteratorError2 = false;
						var _iteratorError2 = undefined;

						try {
							for (var _iterator2 = this._byMinute[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
								var minute = _step2.value;
								var _iteratorNormalCompletion3 = true;
								var _didIteratorError3 = false;
								var _iteratorError3 = undefined;

								try {
									for (var _iterator3 = this._bySecond[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
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

					if (value) {
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
							var _i9 = format(new Date(year, month, day, 0, 0, 0), "z") | 0;

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
						var i = format(new Date(year, month, day, 0, 0, 0), "z") | 0;
						return [i];
				}
			}

			// TODO: https://github.com/rlanvin/php-rrule/blob/master/src/RRule.php#L1216

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
				var _ref;

				return _ref = {}, defineProperty(_ref, RRule.YEARLY, 28), defineProperty(_ref, RRule.MONTHLY, 336), defineProperty(_ref, RRule.WEEKLY, 1461), defineProperty(_ref, RRule.DAILY, 10227), defineProperty(_ref, RRule.HOURLY, 24), defineProperty(_ref, RRule.MINUTELY, 1440), defineProperty(_ref, RRule.SECONDLY, 86400), _ref;
			}
		}]);
		return RRule;
	}();

	exports.RRule = RRule;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
