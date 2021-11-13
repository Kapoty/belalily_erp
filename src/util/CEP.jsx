function toCEP(number) {
	number = String(number)
	if (number.length == 8)
		return number.substr(0, 5) + '-' + number.substr(5,3);
	return number;
}

export {toCEP}