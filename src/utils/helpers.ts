import React from 'react';
import {
  ForkKnife,
  CarFront,
  FuelPump,
  Bag,
  Receipt,
  Tv,
  Controller,
  HeartPulse,
  Capsule,
  Mortarboard,
  Book,
  Briefcase,
  CashStack,
  GraphUpArrow,
  PiggyBank,
  Laptop,
  LightningCharge,
  Trophy,
  Heart,
  Gift,
  HouseDoor,
  People,
  Phone,
  CupHot,
  Film,
  QuestionCircle,
  type Icon as BootstrapIcon
} from 'react-bootstrap-icons';

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

// Map category or brand string to visual representation using Bootstrap Icons (https://icons.getbootstrap.com/)
export interface CategoryStyle {
  icon: BootstrapIcon | React.ComponentType<any>;
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
      icon: CupHot,
      bgClass: 'bg-[#00704A]/12 text-[#00704A] dark:bg-[#00704A]/25 dark:text-[#34D399]',
      textClass: 'text-[#00704A] dark:text-[#34D399]'
    };
  }
  if (combined.includes('uber') || combined.includes('grab') || combined.includes('gojek')) {
    return {
      icon: CarFront,
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

  // 2. BBM / Bahan Bakar / Fuel (Bootstrap Icons FuelPump: https://icons.getbootstrap.com/icons/fuel-pump/)
  if (
    normCat === 'bbm' || 
    combined.includes('bbm') || 
    combined.includes('bensin') || 
    combined.includes('pertamax') || 
    combined.includes('pertalite') || 
    combined.includes('solar') || 
    combined.includes('spbu') || 
    combined.includes('fuel') || 
    combined.includes('shell') ||
    combined.includes('gas')
  ) {
    return {
      icon: FuelPump,
      bgClass: 'bg-[#FFF8E1] dark:bg-amber-950/40',
      textClass: 'text-[#F57F17] dark:text-[#FFB74D]'
    };
  }

  // 3. Category matching with official Bootstrap Icons (https://icons.getbootstrap.com/)
  if (combined.includes('makan') || combined.includes('minum') || combined.includes('food') || combined.includes('restoran') || combined.includes('kuliner') || combined.includes('snack')) {
    return { icon: ForkKnife, bgClass: 'bg-[#FBE9E7] dark:bg-orange-950/40', textClass: 'text-[#D84315] dark:text-[#FF8A65]' };
  }
  if (combined.includes('trans') || combined.includes('mobil') || combined.includes('motor') || combined.includes('ojek') || combined.includes('taksi') || combined.includes('taxi') || combined.includes('kereta') || combined.includes('bus') || combined.includes('parkir') || combined.includes('tol')) {
    return { icon: CarFront, bgClass: 'bg-[#E3F2FD] dark:bg-blue-950/40', textClass: 'text-[#1976D2] dark:text-[#64B5F6]' };
  }
  if (combined.includes('belanja') || combined.includes('shopping') || combined.includes('baju') || combined.includes('mall') || combined.includes('pasar') || combined.includes('minimarket') || combined.includes('supermarket')) {
    return { icon: Bag, bgClass: 'bg-[#FCE4EC] dark:bg-pink-950/40', textClass: 'text-[#C2185B] dark:text-[#F48FB1]' };
  }
  if (combined.includes('tagihan') || combined.includes('utilitas') || combined.includes('listrik') || combined.includes('pulsa') || combined.includes('air') || combined.includes('internet') || combined.includes('pdam') || combined.includes('pln') || combined.includes('wifi') || combined.includes('bpjs')) {
    return { icon: Receipt, bgClass: 'bg-[#FFF8E1] dark:bg-amber-950/40', textClass: 'text-[#F57F17] dark:text-[#FFD54F]' };
  }
  if (combined.includes('hiburan') || combined.includes('game') || combined.includes('gaming') || combined.includes('steam') || combined.includes('wisata') || combined.includes('rekreasi') || combined.includes('liburan')) {
    return { icon: Controller, bgClass: 'bg-[#F3E5F5] dark:bg-purple-950/40', textClass: 'text-[#7B1FA2] dark:text-[#CE93D8]' };
  }
  if (combined.includes('film') || combined.includes('bioskop') || combined.includes('cinema') || combined.includes('movie') || combined.includes('tv')) {
    return { icon: Tv, bgClass: 'bg-[#F3E5F5] dark:bg-purple-950/40', textClass: 'text-[#7B1FA2] dark:text-[#CE93D8]' };
  }
  if (combined.includes('sehat') || combined.includes('kesehatan') || combined.includes('dokter') || combined.includes('klinik') || combined.includes('hospital') || combined.includes('rumah sakit')) {
    return { icon: HeartPulse, bgClass: 'bg-[#FCE4EC] dark:bg-rose-950/40', textClass: 'text-[#D81B60] dark:text-[#F06292]' };
  }
  if (combined.includes('obat') || combined.includes('apotek') || combined.includes('vitamin') || combined.includes('medis')) {
    return { icon: Capsule, bgClass: 'bg-[#FCE4EC] dark:bg-rose-950/40', textClass: 'text-[#D81B60] dark:text-[#F06292]' };
  }
  if (combined.includes('olahraga') || combined.includes('gym') || combined.includes('fitness') || combined.includes('workout') || combined.includes('sport')) {
    return { icon: Trophy, bgClass: 'bg-[#F1F8E9] dark:bg-lime-950/40', textClass: 'text-[#558B2F] dark:text-[#AED581]' };
  }
  if (combined.includes('didik') || combined.includes('sekolah') || combined.includes('kuliah') || combined.includes('buku') || combined.includes('kursus') || combined.includes('pendidikan')) {
    return { icon: Mortarboard, bgClass: 'bg-[#E8EAF6] dark:bg-indigo-950/40', textClass: 'text-[#3949AB] dark:text-[#7986CB]' };
  }
  if (combined.includes('gaji') || combined.includes('upah') || combined.includes('penghasilan') || combined.includes('income')) {
    return { icon: CashStack, bgClass: 'bg-[#123628]/12 dark:bg-[#4ADE80]/20', textClass: 'text-[#123628] dark:text-[#4ADE80]' };
  }
  if (combined.includes('invest') || combined.includes('saham') || combined.includes('crypto') || combined.includes('reksadana') || combined.includes('emas') || combined.includes('tabungan')) {
    return { icon: GraphUpArrow, bgClass: 'bg-[#E0F2F1] dark:bg-teal-950/40', textClass: 'text-[#00796B] dark:text-[#4DB6AC]' };
  }
  if (combined.includes('sampingan') || combined.includes('freelance') || combined.includes('proyek') || combined.includes('komisi') || combined.includes('side')) {
    return { icon: Laptop, bgClass: 'bg-[#E0F7FA] dark:bg-cyan-950/40', textClass: 'text-[#0097A7] dark:text-[#4DD0E1]' };
  }
  if (combined.includes('sedekah') || combined.includes('zakat') || combined.includes('amal') || combined.includes('donasi') || combined.includes('infaq') || combined.includes('infak')) {
    return { icon: Heart, bgClass: 'bg-[#E8F5E9] dark:bg-emerald-950/40', textClass: 'text-[#2E7D32] dark:text-[#81C784]' };
  }
  if (combined.includes('hadiah') || combined.includes('gift') || combined.includes('kado') || combined.includes('bonus')) {
    return { icon: Gift, bgClass: 'bg-[#E0F2F1] dark:bg-teal-950/40', textClass: 'text-[#00796B] dark:text-[#80CBC4]' };
  }
  if (combined.includes('rumah') || combined.includes('kos') || combined.includes('kost') || combined.includes('kontrakan') || combined.includes('apartemen')) {
    return { icon: HouseDoor, bgClass: 'bg-[#E1F5FE] dark:bg-sky-950/40', textClass: 'text-[#0288D1] dark:text-[#4FC3F7]' };
  }
  if (combined.includes('keluarga') || combined.includes('anak') || combined.includes('bayi') || combined.includes('ortu')) {
    return { icon: People, bgClass: 'bg-[#EDE7F6] dark:bg-violet-950/40', textClass: 'text-[#512DA8] dark:text-[#B39DDB]' };
  }
  if (combined.includes('elektronik') || combined.includes('gadget') || combined.includes('hp')) {
    return { icon: Phone, bgClass: 'bg-[#E8EAF6] dark:bg-blue-950/40', textClass: 'text-[#283593] dark:text-[#9FA8DA]' };
  }
  
  // Fallback default (Bootstrap Icons QuestionCircle: https://icons.getbootstrap.com/icons/question-circle/)
  return { icon: QuestionCircle, bgClass: 'bg-slate-100 dark:bg-slate-800', textClass: 'text-slate-600 dark:text-slate-400' };
};
