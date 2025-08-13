// Basic synchronous validators; you can replace with Joi, Zod, or Yup later

export function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export function isNonEmptyString(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

export function isPositiveNumber(val) {
  return typeof val === 'number' && isFinite(val) && val > 0;
}

export function validateTenantRequest(data) {
  const errors = [];
  if (!isNonEmptyString(data.name)) errors.push('Name is required');
  if (!isEmail(data.email)) errors.push('Valid email is required');
  if (data.phone && !/^\+?[0-9]{7,15}$/.test(data.phone)) errors.push('Phone number is invalid');
  if (!data.property_id) errors.push('Property ID is required');
  return errors;
}

export function validateProperty(data) {
  const errors = [];
  if (!isNonEmptyString(data.name)) errors.push('Property name is required');
  return errors;
}