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
  Coffee,
  Film,
  Zap,
  DollarSign,
  type AnimatedIcon
} from '../components/icons';

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

// Map category or brand string to visual representation
export interface CategoryStyle {
  icon: AnimatedIcon;
  bgClass: string;
  textClass: string;
  badgeChar?: string;
  badgeBg?: string;
  badgeText?: string;
}

export const getCategoryStyle = (category: string, description: string = ''): CategoryStyle => {
  const normCat = (category || '').toLowerCase().trim();
  const normDesc = (description || '').toLowerCase().trim();
  const combined = `${normCat} ${normDesc}`;

  // 1. Specific Brand detection matching reference image
  if (combined.includes('netflix')) {
    return {
      icon: Film,
      bgClass: 'bg-black text-white dark:bg-black',
      textClass: 'text-red-600',
      badgeChar: 'N',
      badgeBg: 'bg-[#E50914] text-white',
      badgeText: 'text-white'
    };
  }
  if (combined.includes('starbucks') || combined.includes('kopi') || combined.includes('coffee')) {
    return {
      icon: Coffee,
      bgClass: 'bg-[#00704A]/12 text-[#00704A] dark:bg-[#00704A]/25 dark:text-[#34D399]',
      textClass: 'text-[#00704A] dark:text-[#34D399]',
      badgeChar: '☕',
      badgeBg: 'bg-[#00704A] text-white',
      badgeText: 'text-white'
    };
  }
  if (combined.includes('uber') || combined.includes('grab') || combined.includes('gojek')) {
    return {
      icon: Car,
      bgClass: 'bg-amber-400/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300',
      textClass: 'text-amber-600 dark:text-amber-400',
      badgeChar: '🚗',
      badgeBg: 'bg-black text-amber-400',
      badgeText: 'text-amber-400'
    };
  }
  if (combined.includes('salary') || combined.includes('gaji') || combined.includes('paycheck')) {
    return {
      icon: Briefcase,
      bgClass: 'bg-[#123628] text-white dark:bg-[#1C4D3A] dark:text-white',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      badgeChar: '💼',
      badgeBg: 'bg-[#123628] text-white',
      badgeText: 'text-white'
    };
  }

  // 2. Category matching
  if (combined.includes('makan') || combined.includes('minum') || combined.includes('food') || combined.includes('restoran')) {
    return { icon: Utensils, bgClass: 'bg-orange-500/12 dark:bg-orange-500/20', textClass: 'text-orange-600 dark:text-orange-400' };
  }
  if (combined.includes('trans') || combined.includes('mobil') || combined.includes('motor') || combined.includes('bensin') || combined.includes('ojek')) {
    return { icon: Car, bgClass: 'bg-blue-500/12 dark:bg-blue-500/20', textClass: 'text-blue-600 dark:text-blue-400' };
  }
  if (combined.includes('belanja') || combined.includes('shopping') || combined.includes('baju') || combined.includes('mall')) {
    return { icon: ShoppingBag, bgClass: 'bg-rose-500/12 dark:bg-rose-500/20', textClass: 'text-rose-600 dark:text-rose-400' };
  }
  if (combined.includes('tagihan') || combined.includes('utilitas') || combined.includes('listrik') || combined.includes('pulsa') || combined.includes('air') || combined.includes('internet')) {
    return { icon: Receipt, bgClass: 'bg-amber-500/12 dark:bg-amber-500/20', textClass: 'text-amber-600 dark:text-amber-400' };
  }
  if (combined.includes('hiburan') || combined.includes('bioskop') || combined.includes('game') || combined.includes('wisata')) {
    return { icon: Tv, bgClass: 'bg-purple-500/12 dark:bg-purple-500/20', textClass: 'text-purple-600 dark:text-purple-400' };
  }
  if (combined.includes('sehat') || combined.includes('obat') || combined.includes('dokter') || combined.includes('klinik') || combined.includes('gym')) {
    return { icon: HeartPulse, bgClass: 'bg-pink-500/12 dark:bg-pink-500/20', textClass: 'text-pink-600 dark:text-pink-400' };
  }
  if (combined.includes('didik') || combined.includes('sekolah') || combined.includes('kuliah') || combined.includes('buku') || combined.includes('kursus')) {
    return { icon: GraduationCap, bgClass: 'bg-indigo-500/12 dark:bg-indigo-500/20', textClass: 'text-indigo-600 dark:text-indigo-400' };
  }
  if (combined.includes('invest') || combined.includes('saham') || combined.includes('crypto') || combined.includes('reksadana')) {
    return { icon: TrendingUp, bgClass: 'bg-cyan-500/12 dark:bg-cyan-500/20', textClass: 'text-cyan-600 dark:text-cyan-400' };
  }
  if (combined.includes('hadiah') || combined.includes('gift') || combined.includes('kado') || combined.includes('bonus')) {
    return { icon: Gift, bgClass: 'bg-teal-500/12 dark:bg-teal-500/20', textClass: 'text-teal-600 dark:text-teal-400' };
  }
  
  // Fallback default
  return { icon: HelpCircle, bgClass: 'bg-slate-500/12 dark:bg-slate-500/20', textClass: 'text-slate-600 dark:text-slate-400' };
};
