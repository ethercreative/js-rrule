export default function dateDiff (a, b) {
	const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds())
		, utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds());
	
	const diff = utc2 - utc1;
	
	return {
		weeks:        Math.floor(diff / 6048e5),
		days:         Math.floor(diff / 864e5),
		hours:        Math.floor(diff / 36e5),
		minutes:      Math.floor(diff / 6e4),
		seconds:      Math.floor(diff / 1e3),
		milliseconds: diff,
	};
}