function toPhone(number) {
	number = String(number)
	return number.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

export {toPhone}