const moment = require('moment');

const formatDate = function (date, targetFormat) {
    return moment(date).format(targetFormat);
};

const minDateToday = () => {
    return formatDate(new Date(), 'YYYY-MM-DD');
}

const replaceCommas = function(value) {
    return value ? value.replace(/,/g, ' | ') : 'None';
};

const checkboxCheck = function (value, checkboxValue) {
    return (value.search(checkboxValue) >= 0) ? 'checked' : '';
};

const radioCheck = function (value, radioValue) {
    return (value == radioValue) ? 'checked' : '';
};

const ifEquals = (arg1, arg2, options) => {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
}

const ifNotEquals = (arg1, arg2, options) => {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
}

module.exports = { formatDate, replaceCommas, checkboxCheck, radioCheck, ifEquals, ifNotEquals , minDateToday};