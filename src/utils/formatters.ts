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
        bg: 'bg-red-950/60',
        text: 'text-red-400',
        border: 'border-red-500/40',
        glow: 'shadow-[0_0_12px_rgba(239,68,68,0.25)]',
      };
    case 'HIGH':
      return {
        bg: 'bg-rose-950/50',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        glow: 'shadow-[0_0_10px_rgba(244,63,94,0.2)]',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-950/40',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-[0_0_10px_rgba(245,158,11,0.15)]',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-950/40',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.15)]',
      };
  }
}

export function getStatusBadgeClasses(status: string): { bg: string; text: string } {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' };
    case 'EXPECTED':
    case 'UPCOMING':
      return { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400' };
    case 'DUE':
      return { bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-400' };
    case 'DELAYED':
      return { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' };
    case 'AT_RISK':
      return { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400' };
    case 'OVERDUE':
      return { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400' };
    default:
      return { bg: 'bg-slate-700/30 border-slate-600/30', text: 'text-slate-300' };
  }
}
