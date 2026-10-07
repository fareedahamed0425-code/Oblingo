/**
 * Currency and date formatting utilities tailored for Indian financial notation (Lakhs & Crores)
 */

export function formatINR(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (compact) {
    if (absAmount >= 10000000) {
      // Crores
      const cr = absAmount / 10000000;
      return `${isNegative ? '-' : ''}₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
    } else if (absAmount >= 100000) {
      // Lakhs
      const lakh = absAmount / 100000;
      return `${isNegative ? '-' : ''}₹${lakh.toFixed(1).replace(/\.0$/, '')}L`;
    } else if (absAmount >= 1000) {
      const k = absAmount / 1000;
      return `${isNegative ? '-' : ''}₹${k.toFixed(1).replace(/\.0$/, '')}k`;
    }
  }

  // Full Indian comma separation format (e.g. 12,00,000)
  const parts = Math.round(absAmount).toString();
  let lastThree = parts.substring(parts.length - 3);
  const otherNumbers = parts.substring(0, parts.length - 3);
  
  let formatted = '';
  if (otherNumbers !== '') {
    formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    formatted = lastThree;
  }

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatDate(dateString: string, options: { short?: boolean; includeYear?: boolean } = {}): string {
  if (!dateString) return 'N/A';
  
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;

  const date = new Date(year, month - 1, day);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (options.short) {
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  }
  
  if (options.includeYear) {
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}

export function getDaysDifference(fromDateStr: string, toDateStr: string): number {
  const [y1, m1, d1] = fromDateStr.split('-').map(Number);
  const [y2, m2, d2] = toDateStr.split('-').map(Number);
  const from = new Date(y1, m1 - 1, d1);
  const to = new Date(y2, m2 - 1, d2);
  
  const diffTime = to.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function addDaysToDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRiskBadgeClasses(risk: string): { bg: string; text: string; border: string; glow: string } {
  switch (risk?.toUpperCase()) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        glow: 'shadow-sm shadow-red-100',
      };
    case 'HIGH':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        glow: 'shadow-sm shadow-rose-100',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        glow: 'shadow-sm shadow-amber-100',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        glow: 'shadow-sm shadow-emerald-100',
      };
  }
}

export function getStatusBadgeClasses(status: string): { bg: string; text: string } {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' };
    case 'EXPECTED':
    case 'UPCOMING':
      return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' };
    case 'DUE':
      return { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' };
    case 'DELAYED':
      return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800' };
    case 'AT_RISK':
      return { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' };
    case 'OVERDUE':
      return { bg: 'bg-red-50 border-red-200', text: 'text-red-700' };
    default:
      return { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' };
  }
}
