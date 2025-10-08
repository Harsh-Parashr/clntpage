import { format } from 'date-fns';

export function formatDate(date) {
  if (!date) return '';
  return format(new Date(date), 'yyyy-MM-dd');
}

export function formatPrice(amount, currency = 'INR') {
  if (typeof amount !== 'number') return '';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Format as per Indian phone numbers
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  return phone;
}

export function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}