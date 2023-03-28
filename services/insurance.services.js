/* eslint-disable camelcase */

const calculateInsuranceDate = async (effective_insurance_date) => {
  let constDate;
  let month;
  let insurance_end_date;
  if (effective_insurance_date) {
    if (effective_insurance_date[4] === '/') {
      // Calculate Insurance End Date
      constDate = '/09/30';
      month = effective_insurance_date.slice(
        effective_insurance_date.indexOf('/') + 1,
        effective_insurance_date.lastIndexOf('/'),
      );
    } else if (effective_insurance_date[4] === '-') {
      // Calculate Insurance End Date
      constDate = '-09-30';
      month = effective_insurance_date.slice(
        effective_insurance_date.indexOf('-') + 1,
        effective_insurance_date.lastIndexOf('-'),
      );
    }
    let year = effective_insurance_date.substring(0, 4);
    if (month > 9) {
      year = JSON.parse(year) + 1;
      insurance_end_date = `${year}${constDate}`;
    } else {
      insurance_end_date = `${year}${constDate}`;
    }
  }

  return insurance_end_date;
};

module.exports = { calculateInsuranceDate };
