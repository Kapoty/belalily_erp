function toCPF(number) {
	number = String(number)
	if (number.length == 11)
		return number.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	return number;
}

export {toCPF}