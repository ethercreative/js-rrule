/**
 * Check that a variable is not empty.
 * 0 and '0' are considered NOT empty.
 *
 * @param {*} value - Variable to be checked
 * @return {boolean}
 */
export default function notEmpty (value) {
	return (
		value === 0
		|| value === "0"
		|| !!value
		|| (Array.isArray(value) && value.length > 0)
	);
}