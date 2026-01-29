const isStringArray = arr => arr.every(i => typeof i === 'string');
const ogToString = Array.prototype.toString;
const ogLog = console.log;

Array.prototype.toString = function () {
	return isStringArray(this) ? this.join('') : ogToString.call(this);
};

console.log = function (...args) {
	for (let i = 0; i < args.length; i++) {
		if (Array.isArray(args[i]) && isStringArray(args[i])) args[i] = args[i].join('');
	}
	ogLog(...args);
};
