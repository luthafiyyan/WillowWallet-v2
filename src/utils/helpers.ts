import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Tv,
  HeartPulse,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Gift,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

// Format currency as IDR
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Generates time-based Indonesian greeting
export const getIndonesianGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
};

// Map category string to Lucide icon and color classes
export interface CategoryStyle {
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
}

export const getCategoryStyle = (category: string): CategoryStyle => {
  const norm = category.toLowerCase().trim();

  if (norm.includes('makan') || norm.includes('minum') || norm.includes('food') || norm.includes('restoran')) {
    return { icon: Utensils, bgClass: 'bg-orange-500/10 dark:bg-orange-500/20', textClass: 'text-orange-600 dark:text-orange-400' };
  }
  if (norm.includes('trans') || norm.includes('mobil') || norm.includes('motor') || norm.includes('bensin') || norm.includes('ojek')) {
    return { icon: Car, bgClass: 'bg-blue-500/10 dark:bg-blue-500/20', textClass: 'text-blue-600 dark:text-blue-400' };
  }
  if (norm.includes('belanja') || norm.includes('shopping') || norm.includes('baju') || norm.includes('mall')) {
    return { icon: ShoppingBag, bgClass: 'bg-pink-500/10 dark:bg-pink-500/20', textClass: 'text-pink-600 dark:text-pink-400' };
  }
  if (norm.includes('tagihan') || norm.includes('utilitas') || norm.includes('listrik') || norm.includes('pulsa') || norm.includes('air') || norm.includes('internet')) {
    return { icon: Receipt, bgClass: 'bg-amber-500/10 dark:bg-amber-500/20', textClass: 'text-amber-600 dark:text-amber-400' };
  }
  if (norm.includes('hiburan') || norm.includes('bioskop') || norm.includes('game') || norm.includes('netflix') || norm.includes('wisata')) {
    return { icon: Tv, bgClass: 'bg-purple-500/10 dark:bg-purple-500/20', textClass: 'text-purple-600 dark:text-purple-400' };
  }
  if (norm.includes('sehat') || norm.includes('obat') || norm.includes('dokter') || norm.includes('klinik') || norm.includes('gym')) {
    return { icon: HeartPulse, bgClass: 'bg-rose-500/10 dark:bg-rose-500/20', textClass: 'text-rose-600 dark:text-rose-400' };
  }
  if (norm.includes('didik') || norm.includes('sekolah') || norm.includes('kuliah') || norm.includes('buku') || norm.includes('kursus')) {
    return { icon: GraduationCap, bgClass: 'bg-indigo-500/10 dark:bg-indigo-500/20', textClass: 'text-indigo-600 dark:text-indigo-400' };
  }
  if (norm.includes('gaji') || norm.includes('salary') || norm.includes('paycheck')) {
    return { icon: Briefcase, bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20', textClass: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (norm.includes('invest') || norm.includes('saham') || norm.includes('crypto') || norm.includes('reksadana')) {
    return { icon: TrendingUp, bgClass: 'bg-cyan-500/10 dark:bg-cyan-500/20', textClass: 'text-cyan-600 dark:text-cyan-400' };
  }
  if (norm.includes('hadiah') || norm.includes('gift') || norm.includes('kado') || norm.includes('bonus')) {
    return { icon: Gift, bgClass: 'bg-teal-500/10 dark:bg-teal-500/20', textClass: 'text-teal-600 dark:text-teal-400' };
  }
  
  // Fallback default
  return { icon: HelpCircle, bgClass: 'bg-slate-500/10 dark:bg-slate-500/20', textClass: 'text-slate-600 dark:text-slate-400' };
};
