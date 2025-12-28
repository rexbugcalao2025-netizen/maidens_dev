
// Format Price Numbers
export function formatCurrency(value, locale = 'en-PH') {
  if (value == null) return '—';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
