function toDate(dateStr) {
	return new Date(dateStr).toLocaleDateString('pt-BR');
}

function toDateAndTime(dateStr) {
	let date = new Date(dateStr);
	return date.toLocaleDateString('pt-BR') + ` ${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}m${String(date.getSeconds()).padStart(2, '0')}s`;
}

export {toDate, toDateAndTime}