function toDate(dateStr) {
	return new Date(dateStr).toLocaleDateString('pt-BR');
}

export {toDate}