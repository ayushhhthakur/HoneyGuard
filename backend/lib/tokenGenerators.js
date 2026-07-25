export const generateAwsToken = (region, service) => {
  const timestamp = Date.now().toString(36);
  const servicePrefix = (service || 'xx').substring(0, 2).toUpperCase();
  return `AKIA${servicePrefix}${timestamp}X${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

export const generateFinancialToken = (type) => {
  switch (type) {
    case 'credit_card':
      return `4532${Math.random().toString().slice(2, 6)}${Math.random().toString().slice(2, 6)}${Math.random()
        .toString()
        .slice(2, 6)}`;
    case 'bank_account':
      return `BANK${Math.random().toString().slice(2, 14)}`;
    case 'api_key':
      return `fin_live_${Math.random().toString(36).substring(2, 15)}`;
    default:
      return `FIN_${Math.random().toString(36).substring(2, 15)}`;
  }
};

export const generateHealthcareToken = (system, patientIdFormat) => {
  const timestamp = Date.now().toString(36);
  if (patientIdFormat) {
    return patientIdFormat.replace(/#/g, () => Math.floor(Math.random() * 10));
  }
  return `${(system || 'SYS').toUpperCase()}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
};

export const generateImageToken = () => `img_${Math.random().toString(36).substring(2, 15)}`;
