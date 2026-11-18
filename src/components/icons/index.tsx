import React, { forwardRef } from 'react';
import {
  HouseIcon as AnimateHouse,
  ChartBarIcon as AnimateChartBar,
  PlusIcon as AnimatePlus,
  ArrowLeftRightIcon as AnimateArrowLeftRight,
  UserIcon as AnimateUser,
  SearchIcon as AnimateSearch,
  BellIcon as AnimateBell,
  SendIcon as AnimateSend,
  EllipsisIcon as AnimateEllipsis,
  EyeIcon as AnimateEye,
  EyeOffIcon as AnimateEyeOff,
  DownloadIcon as AnimateDownload,
  FileDownIcon as AnimateFileDown,
  PrinterIcon as AnimatePrinter,
  ShareIcon as AnimateShare,
  CalendarIcon as AnimateCalendar,
  TargetIcon as AnimateTarget,
  TrendingUpIcon as AnimateTrendingUp,
  TrendingDownIcon as AnimateTrendingDown,
  SlidersHorizontalIcon as AnimateSlidersHorizontal,
  ChevronRightIcon as AnimateChevronRight,
  ChevronLeftIcon as AnimateChevronLeft,
  ShieldCheckIcon as AnimateShieldCheck,
  WalletIcon as AnimateWallet,
  CircleCheckIcon as AnimateCircleCheck,
  CircleAlertIcon as AnimateCircleAlert,
  TriangleAlertIcon as AnimateTriangleAlert,
  Trash2Icon as AnimateTrash2,
  ClockIcon as AnimateClock,
  PencilIcon as AnimatePencil,
  CopyIcon as AnimateCopy,
  GlobeIcon as AnimateGlobe,
  ArrowRightIcon as AnimateArrowRight,
  ArrowUpRightIcon as AnimateArrowUpRight,
  ArrowDownLeftIcon as AnimateArrowDownLeft,
  SproutIcon as AnimateSprout,
  DatabaseIcon as AnimateDatabase,
  SparklesIcon as AnimateSparkles,
  SunIcon as AnimateSun,
  MoonIcon as AnimateMoon,
  LogOutIcon as AnimateLogOut,
  MailIcon as AnimateMail,
  TagIcon as AnimateTag,
  ReceiptIcon as AnimateReceipt,
  CoinsIcon as AnimateCoins,
  FileCodeIcon as AnimateFileCode,
  FileSpreadsheetIcon as AnimateFileSpreadsheet,
  FileTextIcon as AnimateFileText,
  UploadIcon as AnimateUpload,
  HistoryIcon as AnimateHistory,
  FilterIcon as AnimateFilter,
  CheckIcon as AnimateCheck,
  XIcon as AnimateX,
  RotateCwIcon as AnimateRotateCw,
  LoaderCircleIcon as AnimateLoaderCircle,
  PercentIcon as AnimatePercent,
  UtensilsIcon as AnimateUtensils,
  CarIcon as AnimateCar,
  ShoppingBagIcon as AnimateShoppingBag,
  TvIcon as AnimateTv,
  HeartPulseIcon as AnimateHeartPulse,
  GraduationCapIcon as AnimateGraduationCap,
  BriefcaseIcon as AnimateBriefcase,
  GiftIcon as AnimateGift,
  CoffeeIcon as AnimateCoffee,
  FilmIcon as AnimateFilm,
  ZapIcon as AnimateZap,
  DollarSignIcon as AnimateDollarSign,
  MessageSquareIcon as AnimateMessageSquare,
  SmartphoneIcon as AnimateSmartphone,
  ActivityIcon as AnimateActivity,
  InfoIcon as AnimateInfo,
  FlameIcon as AnimateFlame,
  ReceiptTextIcon as AnimateReceiptText,
  GamepadIcon as AnimateGamepad,
  ClapperboardIcon as AnimateClapperboard,
  MusicIcon as AnimateMusic,
  PillIcon as AnimatePill,
  DumbbellIcon as AnimateDumbbell,
  BookOpenIcon as AnimateBookOpen,
  PiggyBankIcon as AnimatePiggyBank,
  LaptopIcon as AnimateLaptop,
  HandHeartIcon as AnimateHandHeart,
  UsersIcon as AnimateUsers,
  StoreIcon as AnimateStore,
  ShoppingCartIcon as AnimateShoppingCart,
  BikeIcon as AnimateBike,
  DropletIcon as AnimateDroplet,
  DropletsIcon as AnimateDroplets,
  StethoscopeIcon as AnimateStethoscope,
  HospitalIcon as AnimateHospital,
  SchoolIcon as AnimateSchool,
  BanknoteIcon as AnimateBanknote,
} from '@animateicons/react/lucide';
import { HelpCircleIcon as AnimateHelpCircle } from '@animateicons/react/huge';

export interface AnimatedIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
  color?: string;
  strokeWidth?: number | string;
}

export type AnimatedIcon = React.ForwardRefExoticComponent<
  AnimatedIconProps & React.RefAttributes<any>
>;

function parseSizeFromClass(className?: string, fallback = 24): number {
  if (!className) return fallback;
  if (className.includes('w-3.5') || className.includes('h-3.5')) return 14;
  if (className.includes('w-3') || className.includes('h-3')) return 12;
  if (className.includes('w-4') || className.includes('h-4')) return 16;
  if (className.includes('w-5') || className.includes('h-5')) return 20;
  if (className.includes('w-6') || className.includes('h-6')) return 24;
  if (className.includes('w-7') || className.includes('h-7')) return 28;
  if (className.includes('w-8') || className.includes('h-8')) return 32;
  if (className.includes('w-10') || className.includes('h-10')) return 40;
  if (className.includes('w-12') || className.includes('h-12')) return 48;
  return fallback;
}

export function createAnimatedIcon(
  BaseComponent: React.ComponentType<any>,
  displayName: string
): AnimatedIcon {
  const Icon = forwardRef<any, AnimatedIconProps>(
    ({ className = '', size, color = 'currentColor', isAnimated = true, strokeWidth: _sw, ...props }, ref) => {
      const computedSize = size ?? parseSizeFromClass(className);
      return (
        <BaseComponent
          ref={ref}
          size={computedSize}
          color={color}
          isAnimated={isAnimated}
          className={`inline-flex items-center justify-center [&>svg]:w-full [&>svg]:h-full shrink-0 ${className}`}
          {...props}
        />
      );
    }
  );
  Icon.displayName = displayName;
  return Icon;
}

// 21st.dev community animated icons - Navigation
export const Home = createAnimatedIcon(AnimateHouse, 'Home');
export const House = Home;
export const BarChart2 = createAnimatedIcon(AnimateChartBar, 'BarChart2');
export const ChartBar = BarChart2;
export const Plus = createAnimatedIcon(AnimatePlus, 'Plus');
export const ArrowLeftRight = createAnimatedIcon(AnimateArrowLeftRight, 'ArrowLeftRight');
export const User = createAnimatedIcon(AnimateUser, 'User');

// Actions & Headers
export const Search = createAnimatedIcon(AnimateSearch, 'Search');
export const Bell = createAnimatedIcon(AnimateBell, 'Bell');
export const Send = createAnimatedIcon(AnimateSend, 'Send');
export const MoreHorizontal = createAnimatedIcon(AnimateEllipsis, 'MoreHorizontal');
export const Ellipsis = MoreHorizontal;
export const Eye = createAnimatedIcon(AnimateEye, 'Eye');
export const EyeOff = createAnimatedIcon(AnimateEyeOff, 'EyeOff');
export const Download = createAnimatedIcon(AnimateDownload, 'Download');
export const FileDown = createAnimatedIcon(AnimateFileDown, 'FileDown');
export const Printer = createAnimatedIcon(AnimatePrinter, 'Printer');
export const Share2 = createAnimatedIcon(AnimateShare, 'Share2');
export const Share = Share2;
export const Calendar = createAnimatedIcon(AnimateCalendar, 'Calendar');
export const Target = createAnimatedIcon(AnimateTarget, 'Target');
export const TrendingUp = createAnimatedIcon(AnimateTrendingUp, 'TrendingUp');
export const TrendingDown = createAnimatedIcon(AnimateTrendingDown, 'TrendingDown');
export const SlidersHorizontal = createAnimatedIcon(AnimateSlidersHorizontal, 'SlidersHorizontal');
export const ChevronRight = createAnimatedIcon(AnimateChevronRight, 'ChevronRight');
export const ChevronLeft = createAnimatedIcon(AnimateChevronLeft, 'ChevronLeft');
export const ShieldCheck = createAnimatedIcon(AnimateShieldCheck, 'ShieldCheck');
export const Wallet = createAnimatedIcon(AnimateWallet, 'Wallet');
export const CheckCircle2 = createAnimatedIcon(AnimateCircleCheck, 'CheckCircle2');
export const CircleCheck = CheckCircle2;
export const AlertCircle = createAnimatedIcon(AnimateCircleAlert, 'AlertCircle');
export const CircleAlert = AlertCircle;
export const AlertTriangle = createAnimatedIcon(AnimateTriangleAlert, 'AlertTriangle');
export const TriangleAlert = AlertTriangle;
export const Trash2 = createAnimatedIcon(AnimateTrash2, 'Trash2');
export const Clock = createAnimatedIcon(AnimateClock, 'Clock');
export const Edit3 = createAnimatedIcon(AnimatePencil, 'Edit3');
export const Pencil = Edit3;
export const Copy = createAnimatedIcon(AnimateCopy, 'Copy');
export const Globe = createAnimatedIcon(AnimateGlobe, 'Globe');
export const ArrowRight = createAnimatedIcon(AnimateArrowRight, 'ArrowRight');
export const ArrowUpRight = createAnimatedIcon(AnimateArrowUpRight, 'ArrowUpRight');
export const ArrowDownLeft = createAnimatedIcon(AnimateArrowDownLeft, 'ArrowDownLeft');
export const Sprout = createAnimatedIcon(AnimateSprout, 'Sprout');
export const Database = createAnimatedIcon(AnimateDatabase, 'Database');
export const Sparkles = createAnimatedIcon(AnimateSparkles, 'Sparkles');
export const Sun = createAnimatedIcon(AnimateSun, 'Sun');
export const Moon = createAnimatedIcon(AnimateMoon, 'Moon');
export const LogOut = createAnimatedIcon(AnimateLogOut, 'LogOut');
export const Mail = createAnimatedIcon(AnimateMail, 'Mail');
export const Tag = createAnimatedIcon(AnimateTag, 'Tag');
export const Receipt = createAnimatedIcon(AnimateReceipt, 'Receipt');
export const Scale = createAnimatedIcon(AnimateCoins, 'Scale');
export const Coins = Scale;
export const FileCode = createAnimatedIcon(AnimateFileCode, 'FileCode');
export const FileJson = FileCode;
export const FileSpreadsheet = createAnimatedIcon(AnimateFileSpreadsheet, 'FileSpreadsheet');
export const FileText = createAnimatedIcon(AnimateFileText, 'FileText');
export const Upload = createAnimatedIcon(AnimateUpload, 'Upload');
export const History = createAnimatedIcon(AnimateHistory, 'History');
export const Filter = createAnimatedIcon(AnimateFilter, 'Filter');
export const Check = createAnimatedIcon(AnimateCheck, 'Check');
export const X = createAnimatedIcon(AnimateX, 'X');
export const RefreshCw = createAnimatedIcon(AnimateRotateCw, 'RefreshCw');
export const RotateCw = RefreshCw;
export const Loader2 = createAnimatedIcon(AnimateLoaderCircle, 'Loader2');
export const Percent = createAnimatedIcon(AnimatePercent, 'Percent');
export const MessageSquare = createAnimatedIcon(AnimateMessageSquare, 'MessageSquare');
export const Smartphone = createAnimatedIcon(AnimateSmartphone, 'Smartphone');
export const Activity = createAnimatedIcon(AnimateActivity, 'Activity');
export const Info = createAnimatedIcon(AnimateInfo, 'Info');

// Category & Brand Icons
export const Utensils = createAnimatedIcon(AnimateUtensils, 'Utensils');
export const Car = createAnimatedIcon(AnimateCar, 'Car');
export const ShoppingBag = createAnimatedIcon(AnimateShoppingBag, 'ShoppingBag');
export const Tv = createAnimatedIcon(AnimateTv, 'Tv');
export const HeartPulse = createAnimatedIcon(AnimateHeartPulse, 'HeartPulse');
export const GraduationCap = createAnimatedIcon(AnimateGraduationCap, 'GraduationCap');
export const Briefcase = createAnimatedIcon(AnimateBriefcase, 'Briefcase');
export const Gift = createAnimatedIcon(AnimateGift, 'Gift');
export const Coffee = createAnimatedIcon(AnimateCoffee, 'Coffee');
export const Film = createAnimatedIcon(AnimateFilm, 'Film');
export const Zap = createAnimatedIcon(AnimateZap, 'Zap');
export const DollarSign = createAnimatedIcon(AnimateDollarSign, 'DollarSign');
export const HelpCircle = createAnimatedIcon(AnimateHelpCircle, 'HelpCircle');

// Additional 21st.dev category icons
export const Flame = createAnimatedIcon(AnimateFlame, 'Flame');
export const ReceiptText = createAnimatedIcon(AnimateReceiptText, 'ReceiptText');
export const Gamepad = createAnimatedIcon(AnimateGamepad, 'Gamepad');
export const Clapperboard = createAnimatedIcon(AnimateClapperboard, 'Clapperboard');
export const Music = createAnimatedIcon(AnimateMusic, 'Music');
export const Pill = createAnimatedIcon(AnimatePill, 'Pill');
export const Dumbbell = createAnimatedIcon(AnimateDumbbell, 'Dumbbell');
export const BookOpen = createAnimatedIcon(AnimateBookOpen, 'BookOpen');
export const PiggyBank = createAnimatedIcon(AnimatePiggyBank, 'PiggyBank');
export const Laptop = createAnimatedIcon(AnimateLaptop, 'Laptop');
export const HandHeart = createAnimatedIcon(AnimateHandHeart, 'HandHeart');
export const Users = createAnimatedIcon(AnimateUsers, 'Users');
export const Store = createAnimatedIcon(AnimateStore, 'Store');
export const ShoppingCart = createAnimatedIcon(AnimateShoppingCart, 'ShoppingCart');
export const Bike = createAnimatedIcon(AnimateBike, 'Bike');
export const Droplet = createAnimatedIcon(AnimateDroplet, 'Droplet');
export const Droplets = createAnimatedIcon(AnimateDroplets, 'Droplets');
export const Stethoscope = createAnimatedIcon(AnimateStethoscope, 'Stethoscope');
export const Hospital = createAnimatedIcon(AnimateHospital, 'Hospital');
export const School = createAnimatedIcon(AnimateSchool, 'School');
export const Banknote = createAnimatedIcon(AnimateBanknote, 'Banknote');
