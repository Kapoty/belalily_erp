function toDate(dateStr) {
	return new Date(dateStr).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
}

function toDateAndTime(dateStr) {
	let date = new Date(dateStr);
	return date.toLocaleDateString('pt-BR', {timeZone: 'UTC'}) + ` ${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}m${String(date.getSeconds()).padStart(2, '0')}s`;
}

function toAge(dateStr) {
	let birthday_date = new Date(dateStr);
	let today_date = new Date();
	let age = Math.floor((today_date - birthday_date.getTime()) / 3.15576e+10);
	return age + ' anos';
}

export {toDate, toDateAndTime, toAge}