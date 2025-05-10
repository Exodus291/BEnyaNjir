const convertRupiahToNumber = (rupiahString) => {
  if (!rupiahString) return 0;
  return parseInt(rupiahString.toString().replace(/[^\d]/g, ''));
};

const formatToRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const sanitizeString = (str) => {
  return str.replace(/[^\w\s]/gi, '').trim();
};

module.exports = {
  convertRupiahToNumber,
  formatToRupiah,
  sanitizeString
};
