export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  return re.test(password);
}

export function validatePhone(phone) {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
}

export function validateRequired(value) {
  return value !== null && value !== undefined && value.toString().trim() !== '';
}

export function validateForm(values, requiredFields = []) {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!validateRequired(values[field])) {
      errors[field] = 'This field is required';
    }
  });
  
  if (values.email && !validateEmail(values.email)) {
    errors.email = 'Invalid email address';
  }
  
  if (values.phone && !validatePhone(values.phone)) {
    errors.phone = 'Invalid phone number';
  }
  
  if (values.password && !validatePassword(values.password)) {
    errors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers';
  }
  
  if (values.password && values.confirmPassword && values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
}