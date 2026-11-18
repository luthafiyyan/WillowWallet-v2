import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  ReceiptText,
  Tv,
  HeartPulse,
  Pill,
  GraduationCap,
  BookOpen,
  Briefcase,
  Banknote,
  TrendingUp,
  PiggyBank,
  Gift,
  Coffee,
  Film,
  Zap,
  DollarSign,
  HelpCircle,
  Flame,
  Gamepad,
  Dumbbell,
  HandHeart,
  House,
  Users,
  Smartphone,
  Laptop,
  Sparkles,
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

  // 1. Specific Brand detection
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
  if (combined.includes('starbucks') || combined.includes('kopi') || combined.includes('coffee') || combined.includes('cafe') || combined.includes('kafe')) {
    return {
      icon: Coffee,
      bgClass: 'bg-[#00704A]/12 text-[#00704A] dark:bg-[#00704A]/25 dark:text-[#34D399]',
      textClass: 'text-[#00704A] dark:text-[#34D399]'
    };
  }
  if (combined.includes('uber') || combined.includes('grab') || combined.includes('gojek')) {
    return {
      icon: Car,
      bgClass: 'bg-amber-400/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300',
      textClass: 'text-amber-600 dark:text-amber-400'
    };
  }
  if (combined.includes('salary') || combined.includes('gaji') || combined.includes('paycheck') || combined.includes('payroll') || combined.includes('thr')) {
    return {
      icon: Briefcase,
      bgClass: 'bg-[#123628] text-white dark:bg-[#1C4D3A] dark:text-white',
      textClass: 'text-emerald-600 dark:text-emerald-400'
    };
  }

  // 2. BBM / Bahan Bakar / Fuel (Dedicated Match)
  if (
    normCat === 'bbm' || 
    combined.includes('bbm') || 
    combined.includes('bensin') || 
    combined.includes('pertamax') || 
    combined.includes('pertalite') || 
    combined.includes('solar') || 
    combined.includes('spbu') || 
    combined.includes('fuel') || 
    combined.includes('shell')
  ) {
    return {
      icon: Flame,
      bgClass: 'bg-amber-500/15 dark:bg-amber-500/25',
      textClass: 'text-amber-600 dark:text-amber-400'
    };
  }

  // 3. Category matching with 21st.dev animated icons
  if (combined.includes('makan') || combined.includes('minum') || combined.includes('food') || combined.includes('restoran') || combined.includes('kuliner') || combined.includes('snack')) {
    return { icon: Utensils, bgClass: 'bg-orange-500/14 dark:bg-orange-500/24', textClass: 'text-orange-600 dark:text-orange-400' };
  }
  if (combined.includes('trans') || combined.includes('mobil') || combined.includes('motor') || combined.includes('ojek') || combined.includes('taksi') || combined.includes('taxi') || combined.includes('kereta') || combined.includes('bus') || combined.includes('parkir') || combined.includes('tol')) {
    return { icon: Car, bgClass: 'bg-blue-500/14 dark:bg-blue-500/24', textClass: 'text-blue-600 dark:text-blue-400' };
  }
  if (combined.includes('belanja') || combined.includes('shopping') || combined.includes('baju') || combined.includes('mall') || combined.includes('pasar') || combined.includes('minimarket') || combined.includes('supermarket')) {
    return { icon: ShoppingBag, bgClass: 'bg-rose-500/14 dark:bg-rose-500/24', textClass: 'text-rose-600 dark:text-rose-400' };
  }
  if (combined.includes('tagihan') || combined.includes('utilitas') || combined.includes('listrik') || combined.includes('pulsa') || combined.includes('air') || combined.includes('internet') || combined.includes('pdam') || combined.includes('pln') || combined.includes('wifi') || combined.includes('bpjs')) {
    return { icon: ReceiptText, bgClass: 'bg-amber-500/14 dark:bg-amber-500/24', textClass: 'text-amber-600 dark:text-amber-400' };
  }
  if (combined.includes('hiburan') || combined.includes('game') || combined.includes('gaming') || combined.includes('steam') || combined.includes('wisata') || combined.includes('rekreasi') || combined.includes('liburan')) {
    return { icon: Gamepad, bgClass: 'bg-purple-500/14 dark:bg-purple-500/24', textClass: 'text-purple-600 dark:text-purple-400' };
  }
  if (combined.includes('film') || combined.includes('bioskop') || combined.includes('cinema') || combined.includes('movie') || combined.includes('tv')) {
    return { icon: Tv, bgClass: 'bg-purple-500/14 dark:bg-purple-500/24', textClass: 'text-purple-600 dark:text-purple-400' };
  }
  if (combined.includes('sehat') || combined.includes('kesehatan') || combined.includes('dokter') || combined.includes('klinik') || combined.includes('hospital') || combined.includes('rumah sakit')) {
    return { icon: HeartPulse, bgClass: 'bg-pink-500/14 dark:bg-pink-500/24', textClass: 'text-pink-600 dark:text-pink-400' };
  }
  if (combined.includes('obat') || combined.includes('apotek') || combined.includes('vitamin') || combined.includes('medis')) {
    return { icon: Pill, bgClass: 'bg-pink-500/14 dark:bg-pink-500/24', textClass: 'text-pink-600 dark:text-pink-400' };
  }
  if (combined.includes('olahraga') || combined.includes('gym') || combined.includes('fitness') || combined.includes('workout') || combined.includes('sport')) {
    return { icon: Dumbbell, bgClass: 'bg-lime-500/14 dark:bg-lime-500/24', textClass: 'text-lime-600 dark:text-lime-400' };
  }
  if (combined.includes('didik') || combined.includes('sekolah') || combined.includes('kuliah') || combined.includes('buku') || combined.includes('kursus') || combined.includes('pendidikan')) {
    return { icon: GraduationCap, bgClass: 'bg-indigo-500/14 dark:bg-indigo-500/24', textClass: 'text-indigo-600 dark:text-indigo-400' };
  }
  if (combined.includes('gaji') || combined.includes('upah') || combined.includes('penghasilan') || combined.includes('income')) {
    return { icon: Banknote, bgClass: 'bg-emerald-500/14 dark:bg-emerald-500/24', textClass: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (combined.includes('invest') || combined.includes('saham') || combined.includes('crypto') || combined.includes('reksadana') || combined.includes('emas') || combined.includes('tabungan')) {
    return { icon: TrendingUp, bgClass: 'bg-teal-500/14 dark:bg-teal-500/24', textClass: 'text-teal-600 dark:text-teal-400' };
  }
  if (combined.includes('sampingan') || combined.includes('freelance') || combined.includes('proyek') || combined.includes('komisi') || combined.includes('side')) {
    return { icon: Laptop, bgClass: 'bg-cyan-500/14 dark:bg-cyan-500/24', textClass: 'text-cyan-600 dark:text-cyan-400' };
  }
  if (combined.includes('sedekah') || combined.includes('zakat') || combined.includes('amal') || combined.includes('donasi') || combined.includes('infaq') || combined.includes('infak')) {
    return { icon: HandHeart, bgClass: 'bg-emerald-500/14 dark:bg-emerald-500/24', textClass: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (combined.includes('hadiah') || combined.includes('gift') || combined.includes('kado') || combined.includes('bonus')) {
    return { icon: Gift, bgClass: 'bg-teal-500/14 dark:bg-teal-500/24', textClass: 'text-teal-600 dark:text-teal-400' };
  }
  if (combined.includes('rumah') || combined.includes('kos') || combined.includes('kost') || combined.includes('kontrakan') || combined.includes('apartemen')) {
    return { icon: House, bgClass: 'bg-sky-500/14 dark:bg-sky-500/24', textClass: 'text-sky-600 dark:text-sky-400' };
  }
  if (combined.includes('keluarga') || combined.includes('anak') || combined.includes('bayi') || combined.includes('ortu')) {
    return { icon: Users, bgClass: 'bg-violet-500/14 dark:bg-violet-500/24', textClass: 'text-violet-600 dark:text-violet-400' };
  }
  if (combined.includes('elektronik') || combined.includes('gadget') || combined.includes('hp')) {
    return { icon: Smartphone, bgClass: 'bg-blue-500/14 dark:bg-blue-500/24', textClass: 'text-blue-600 dark:text-blue-400' };
  }
  
  // Fallback default
  return { icon: Sparkles, bgClass: 'bg-slate-500/14 dark:bg-slate-500/24', textClass: 'text-slate-600 dark:text-slate-400' };
};
