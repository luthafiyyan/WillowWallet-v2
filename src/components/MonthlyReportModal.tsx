import React, { useMemo, useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Sprout, 
  ShieldCheck,
  CheckCircle2
} from './icons';
import { AnimatePresence, motion } from 'motion/react';
import { Transaction, Budget } from '../types';
import { formatRupiah, getCategoryStyle } from '../utils/helpers';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string; // "YYYY-MM"
  transactions: Transaction[];
  budgets: Budget[];
  userName?: string;
  lang?: 'ID' | 'EN';
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  transactions,
  budgets,
  userName = 'Pengguna',
  lang = 'ID',
}) => {
  const slipRef = useRef<HTMLDivElement>(null);

  // Month and period formatting
  const formattedPeriod = useMemo(() => {
    try {
      const [yStr, mStr] = selectedMonth.split('-');
      const year = parseInt(yStr, 10);
      const monthIndex = parseInt(mStr, 10) - 1;
      const monthsID = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthsEN = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const name = lang === 'ID' ? monthsID[monthIndex] : monthsEN[monthIndex];
      return `${name} ${year}`;
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth, lang]);

  const generatedDate = useMemo(() => {
    return new Date().toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [lang]);

  // Financial calculations for the selected month
  const reportData = useMemo(() => {
    let income = 0;
    let expense = 0;
    let txCount = 0;
    const categoryMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.date.startsWith(selectedMonth)) {
        txCount++;
        if (tx.type === 'income') {
          income += tx.amount;
        } else {
          expense += tx.amount;
          categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        }
      }
    });

    const net = income - expense;
    const savingRate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;

    // Top 5 categories
    const topCategories = Object.keys(categoryMap)
      .map((cat) => ({
        name: cat,
        amount: categoryMap[cat],
        percentage: expense > 0 ? Math.round((categoryMap[cat] / expense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Total budget limit comparison
    const totalBudget = budgets.reduce((acc, b) => acc + (b.limit || 0), 0);
    const budgetPct = totalBudget > 0 ? Math.round((expense / totalBudget) * 100) : null;
    const underBudgetPct = totalBudget > 0 && expense < totalBudget
      ? Math.round(((totalBudget - expense) / totalBudget) * 100)
      : null;

    return {
      income,
      expense,
      net,
      savingRate,
      txCount,
      topCategories,
      totalBudget,
      budgetPct,
      underBudgetPct
    };
  }, [transactions, budgets, selectedMonth]);

  // Export to High-Resolution PNG Image using HTML5 Canvas
  const handleDownloadImage = () => {
    const width = 640;
    const height = 980;
    const canvas = document.createElement('canvas');
    const scale = 2; // 2x DPI for ultra-crisp retina output
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);

    // 1. Background Fill
    ctx.fillStyle = '#F8FAF8';
    ctx.fillRect(0, 0, width, height);

    // 2. White Card with Rounded Corners & Subtle Border
    const cX = 24;
    const cY = 24;
    const cW = width - 48;
    const cH = height - 48;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(cX, cY, cW, cH, 28);
    ctx.fill();
    ctx.strokeStyle = '#E4ECE6';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Header & Brand Title
    ctx.fillStyle = '#123628';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WILLOW WALLET', cX + 28, cY + 46);

    ctx.fillStyle = '#5C7065';
    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(lang === 'ID' ? 'SLIP LAPORAN KEUANGAN BULANAN' : 'MONTHLY FINANCIAL STATEMENT', cX + 28, cY + 64);

    // Right header metadata
    ctx.fillStyle = '#8DA799';
    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(generatedDate, cX + cW - 28, cY + 46);
    ctx.fillText(userName, cX + cW - 28, cY + 64);
    ctx.textAlign = 'left';

    // Divider line
    ctx.strokeStyle = '#F0F4F1';
    ctx.beginPath();
    ctx.moveTo(cX + 28, cY + 80);
    ctx.lineTo(cX + cW - 28, cY + 80);
    ctx.stroke();

    // 4. Period Pill Badge
    ctx.fillStyle = '#E8F4EC';
    ctx.beginPath();
    ctx.roundRect(cX + 28, cY + 96, 160, 26, 13);
    ctx.fill();
    ctx.fillStyle = '#123628';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Periode: ${formattedPeriod}`, cX + 40, cY + 113);

    // 5. Hero Card: Net Cashflow (Deep Forest Green Box)
    const heroY = cY + 134;
    const heroH = 130;
    ctx.fillStyle = '#123628';
    ctx.beginPath();
    ctx.roundRect(cX + 28, heroY, cW - 56, heroH, 20);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(lang === 'ID' ? 'SALDO BERSIH (NET CASHFLOW)' : 'NET CASHFLOW', cX + 48, heroY + 34);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const netFormatted = (reportData.net >= 0 ? '+ ' : '- ') + formatRupiah(Math.abs(reportData.net));
    ctx.fillText(netFormatted, cX + 48, heroY + 70);

    // Status Pill inside Hero
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(cX + 48, heroY + 88, 120, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(reportData.net >= 0 ? (lang === 'ID' ? 'SURPLUS KAS' : 'CASH SURPLUS') : (lang === 'ID' ? 'DEFISIT KAS' : 'CASH DEFICIT'), cX + 62, heroY + 104);

    // 6. Two-Column Metric Grid: Income & Expense
    const metricY = heroY + heroH + 16;
    const metricW = (cW - 56 - 12) / 2;
    const metricH = 82;

    // Income box
    ctx.fillStyle = '#F4F9F5';
    ctx.beginPath();
    ctx.roundRect(cX + 28, metricY, metricW, metricH, 16);
    ctx.fill();
    ctx.strokeStyle = '#D8EBDD';
    ctx.stroke();
    ctx.fillStyle = '#5C7065';
    ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(lang === 'ID' ? 'TOTAL PEMASUKAN' : 'TOTAL INCOME', cX + 42, metricY + 28);
    ctx.fillStyle = '#123628';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(formatRupiah(reportData.income), cX + 42, metricY + 54);

    // Expense box
    ctx.fillStyle = '#FFF8F8';
    ctx.beginPath();
    ctx.roundRect(cX + 28 + metricW + 12, metricY, metricW, metricH, 16);
    ctx.fill();
    ctx.strokeStyle = '#FADCDA';
    ctx.stroke();
    ctx.fillStyle = '#7C5C5C';
    ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(lang === 'ID' ? 'TOTAL PENGELUARAN' : 'TOTAL EXPENSE', cX + 42 + metricW + 12, metricY + 28);
    ctx.fillStyle = '#991B1B';
    ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(formatRupiah(reportData.expense), cX + 42 + metricW + 12, metricY + 54);

    // 7. Top Spending Categories Section
    const catY = metricY + metricH + 24;
    ctx.fillStyle = '#123628';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(lang === 'ID' ? 'Kategori Pengeluaran Terbesar' : 'Top Spending Categories', cX + 28, catY);

    let rowY = catY + 20;
    if (reportData.topCategories.length === 0) {
      ctx.fillStyle = '#8DA799';
      ctx.font = 'italic 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(lang === 'ID' ? 'Belum ada data pengeluaran' : 'No expenses recorded', cX + 28, rowY + 16);
      rowY += 40;
    } else {
      reportData.topCategories.forEach((cat, idx) => {
        // Dot indicator
        ctx.fillStyle = idx === 0 ? '#123628' : idx === 1 ? '#2E6F4D' : idx === 2 ? '#52A874' : '#8ED1A7';
        ctx.beginPath();
        ctx.arc(cX + 36, rowY + 12, 5, 0, Math.PI * 2);
        ctx.fill();

        // Category name
        ctx.fillStyle = '#0F1F17';
        ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(cat.name, cX + 50, rowY + 16);

        // Category percentage & amount
        ctx.textAlign = 'right';
        ctx.fillStyle = '#5C7065';
        ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`${cat.percentage}% (${formatRupiah(cat.amount)})`, cX + cW - 28, rowY + 16);
        ctx.textAlign = 'left';

        // Progress bar background & fill
        ctx.fillStyle = '#EEF4EF';
        ctx.beginPath();
        ctx.roundRect(cX + 50, rowY + 24, cW - 78, 6, 3);
        ctx.fill();

        ctx.fillStyle = '#123628';
        ctx.beginPath();
        ctx.roundRect(cX + 50, rowY + 24, ((cW - 78) * cat.percentage) / 100, 6, 3);
        ctx.fill();

        rowY += 40;
      });
    }

    // 8. Smart Insight Banner
    const insightY = rowY + 12;
    ctx.fillStyle = '#EBF5EF';
    ctx.beginPath();
    ctx.roundRect(cX + 28, insightY, cW - 56, 56, 16);
    ctx.fill();
    ctx.strokeStyle = '#D2E9DA';
    ctx.stroke();

    ctx.fillStyle = '#123628';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const insightText = reportData.underBudgetPct !== null
      ? (lang === 'ID' ? `Pengeluaran ${reportData.underBudgetPct}% di bawah anggaran` : `You are ${reportData.underBudgetPct}% under budget`)
      : (lang === 'ID' ? `Laju menabung bulan ini: ${reportData.savingRate}%` : `Monthly saving rate: ${reportData.savingRate}%`);
    ctx.fillText(insightText, cX + 44, insightY + 26);

    ctx.fillStyle = '#2A5E44';
    ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(lang === 'ID' ? 'Laporan terverifikasi sistem offline-first WillowWallet' : 'Verified by WillowWallet offline-first system', cX + 44, insightY + 42);

    // 9. Footer Watermark & Barcode
    const footerY = cY + cH - 44;
    ctx.fillStyle = '#8DA799';
    ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('WILLOW WALLET v2 • PERSONAL FINTECH', cX + 28, footerY + 16);

    // Draw stylized barcode lines on right
    let barX = cX + cW - 120;
    const barW = [2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 2, 1, 4, 2];
    ctx.fillStyle = '#123628';
    barW.forEach((w) => {
      ctx.fillRect(barX, footerY, w, 24);
      barX += w + 2;
    });

    // Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `WillowWallet_Slip_${selectedMonth}_${userName.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Trigger Print dialog for PDF saving
  const handlePrintPdf = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#0E1F17] border border-[#E5ECE7] dark:border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:w-full"
        >
          
          {/* Modal Header (Hidden during Print) */}
          <div className="p-4 sm:p-5 border-b border-[#E5ECE7] dark:border-white/10 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#123628] text-white flex items-center justify-center font-bold text-xs">
                W
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-text-primary dark:text-slate-100">
                  {lang === 'ID' ? 'Slip Ringkasan Bulanan' : 'Monthly Financial Slip'}
                </h3>
                <p className="text-[11px] text-text-secondary dark:text-slate-400">
                  {formattedPeriod}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-text-primary dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Printable Slip Receipt Card Body */}
          <div 
            id="printable-monthly-slip"
            ref={slipRef}
            className="p-5 sm:p-6 space-y-4 bg-white dark:bg-[#0E1F17] text-text-primary dark:text-slate-100"
          >
            
            {/* Slip Top Header */}
            <div className="flex items-start justify-between border-b border-[#F0F4F1] dark:border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest text-[#123628] dark:text-[#4ADE80] uppercase">
                    WILLOW WALLET
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#E8F4EC] dark:bg-[#142920] text-[#123628] dark:text-[#86EFAC] font-bold">
                    v2.2
                  </span>
                </div>
                <p className="text-sm font-bold text-text-primary dark:text-slate-100 mt-1">
                  {formattedPeriod}
                </p>
              </div>

              <div className="text-right text-[11px] text-text-secondary dark:text-slate-400 space-y-0.5">
                <p className="font-semibold text-text-primary dark:text-slate-200">{userName}</p>
                <p>{generatedDate}</p>
              </div>
            </div>

            {/* Hero Net Cashflow Banner */}
            <div className="forest-hero-card rounded-2xl p-4 sm:p-5 text-white space-y-2">
              <p className="text-[11px] font-semibold tracking-wider text-white/70 uppercase">
                {lang === 'ID' ? 'SALDO BERSIH (NET CASHFLOW)' : 'NET CASHFLOW'}
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                {reportData.net >= 0 ? '+ ' : '- '}
                {formatRupiah(Math.abs(reportData.net))}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] uppercase">
                  {reportData.net >= 0 ? (lang === 'ID' ? 'Surplus' : 'Surplus') : (lang === 'ID' ? 'Defisit' : 'Deficit')}
                </span>
                <span className="text-xs text-white/80">
                  {lang === 'ID' ? `Laju menabung: ${reportData.savingRate}%` : `Saving rate: ${reportData.savingRate}%`}
                </span>
              </div>
            </div>

            {/* Income & Expense 2-Column Mini Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#F4F9F5] dark:bg-[#142920] border border-[#D8EBDD] dark:border-white/5 space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-[#123628] dark:text-[#4ADE80] uppercase flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{lang === 'ID' ? 'Pemasukan' : 'Income'}</span>
                </p>
                <p className="text-sm sm:text-base font-extrabold text-[#123628] dark:text-[#4ADE80] tabular-nums">
                  {formatRupiah(reportData.income)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FFF8F8] dark:bg-[#201414] border border-[#FADCDA] dark:border-white/5 space-y-1">
                <p className="text-[10px] font-bold tracking-wider text-red-600 dark:text-red-400 uppercase flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>{lang === 'ID' ? 'Pengeluaran' : 'Expense'}</span>
                </p>
                <p className="text-sm sm:text-base font-extrabold text-red-600 dark:text-red-400 tabular-nums">
                  {formatRupiah(reportData.expense)}
                </p>
              </div>
            </div>

            {/* Top Categories Breakdown */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-text-primary dark:text-slate-100 uppercase tracking-wide">
                {lang === 'ID' ? 'Kategori Terbesar' : 'Top Categories'}
              </p>

              {reportData.topCategories.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  {lang === 'ID' ? 'Tidak ada data pengeluaran' : 'No expense data'}
                </p>
              ) : (
                <div className="space-y-2">
                  {reportData.topCategories.map((cat, idx) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-[#123628] dark:bg-[#4ADE80]' : 'bg-[#52A874]'}`} />
                          <span className="font-semibold text-text-primary dark:text-slate-200">{cat.name}</span>
                        </div>
                        <span className="font-bold text-text-secondary dark:text-slate-400 tabular-nums">
                          {cat.percentage}% ({formatRupiah(cat.amount)})
                        </span>
                      </div>
                      <div className="w-full bg-[#EEF4EF] dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#123628] dark:bg-[#4ADE80] h-full rounded-full" 
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Insight Banner */}
            <div className="sage-insight-card rounded-2xl p-3 flex items-center gap-2.5 text-xs">
              <Sprout className="w-4.5 h-4.5 text-[#123628] dark:text-[#88E5A7] flex-shrink-0" />
              <p className="font-medium text-[#123628] dark:text-[#88E5A7]">
                {reportData.underBudgetPct !== null
                  ? (lang === 'ID' ? `Pengeluaran Anda ${reportData.underBudgetPct}% di bawah limit anggaran bulan ini.` : `You're ${reportData.underBudgetPct}% under your monthly budget limit.`)
                  : (lang === 'ID' ? `Laju tabungan Anda berada pada tingkat ${reportData.savingRate}%.` : `Your saving rate is at ${reportData.savingRate}%.`)}
              </p>
            </div>

            {/* Barcode & Verification Watermark */}
            <div className="pt-2 border-t border-[#F0F4F1] dark:border-white/10 flex items-center justify-between text-[10px] text-text-secondary dark:text-slate-400">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#123628] dark:text-[#4ADE80]" />
                <span>Terverifikasi Sistem Lokal</span>
              </div>
              <div className="font-mono text-[9px] tracking-widest text-[#123628] dark:text-[#4ADE80] uppercase">
                ||| | |||| | ||| || |||
              </div>
            </div>

          </div>

          {/* Modal Actions Footer (Hidden during Print) */}
          <div className="p-4 sm:p-5 bg-[#F8FAF8] dark:bg-[#07100B] border-t border-[#E5ECE7] dark:border-white/10 grid grid-cols-2 gap-2.5 print:hidden">
            <button
              type="button"
              onClick={handleDownloadImage}
              className="py-3 px-3 rounded-2xl bg-[#123628] hover:bg-[#1C4D3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#123628]/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.2]" />
              <span>{lang === 'ID' ? 'Unduh Gambar (PNG)' : 'Download Image'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="py-3 px-3 rounded-2xl bg-white dark:bg-[#142920] border border-[#CCDCD1] dark:border-white/10 hover:bg-[#F0F4F1] text-text-primary dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2.2]" />
              <span>{lang === 'ID' ? 'Cetak / PDF' : 'Print / Save PDF'}</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
