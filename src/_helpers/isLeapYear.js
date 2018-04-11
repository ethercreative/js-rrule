/**
 * Check is a year is a leap year.
 *
 * @param {number} year The year to be checked.
 * @return {boolean}
 */
export default function isLeapYear (year) {
	if ( year % 4 !== 0 ) return false;
	if ( year % 100 !== 0 ) return true;
	return year % 400 === 0;
}