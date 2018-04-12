export default function range (min, max) {
	const r = [];
	for (let i = min, l = max + 1; i < l; ++i)
		r.push(i);
	return r;
}