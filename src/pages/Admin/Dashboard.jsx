import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceDot, Label, LabelList, ReferenceLine } from 'recharts';
import { repairService, expenseService } from '../../services/supabaseService';
import { formatDistanceToNow } from 'date-fns';
import { parseTimestamp } from '../../utils/helpers';
import { 
  TrendingUp, TrendingDown, Activity, Wrench, ShoppingBag, 
  PlusCircle, Clock, CheckCircle2, AlertCircle, ShoppingCart, Users, RefreshCw, PieChart as PieChartIcon,
  ChevronDown, ChevronRight, Zap, Target, ArrowRight, UserX, AlertTriangle, ShieldAlert, Package, HelpCircle, LayoutDashboard, Filter
} from 'lucide-react';
import { FcPackage, FcPrint, FcTemplate, FcDocument, FcRules, FcImageFile, FcDataBackup, FcCommandLine, FcSettings } from 'react-icons/fc';
import { motion } from 'framer-motion';

const ICON_MAP = {
  'Package': FcPackage,
  'Printer': FcPrint,
  'Layers': FcTemplate,
  'FileText': FcDocument,
  'Type': FcRules,
  'Image': FcImageFile,
  'Download': FcDataBackup,
  'Code': FcCommandLine,
  'Settings': FcSettings
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
const COLORS_EXTENDED = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#0ea5e9', '#d946ef', '#f43f5e', '#eab308', '#22c55e', '#a855f7', '#06b6d4'
];



const BarCustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b182f]/95 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-xl shadow-2xl">
        <p className="text-slate-200 font-bold mb-2.5 border-b border-slate-700/60 pb-1.5 text-xs">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => {
             if (!entry.value) return null;
             return (
               <div key={index} className="flex justify-between items-center gap-6 text-xs">
                 <span style={{ color: entry.color }} className="font-bold">{entry.name}</span>
                 <span className="text-white font-mono font-black">Rs {entry.value.toFixed(0)}</span>
               </div>
             );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ salesHistory, setActiveTab, posCategories = [], totalPendingDues = 0, fetchSales, fetchCustomerDues, pendingOrders = [], customerDuesList = [] }) {
  const [repairs, setRepairs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(() => localStorage.getItem('dashboardLastRefreshed') || null);
  const [revenueTimeFilter, setRevenueTimeFilter] = useState('month');
  const [expandedCats, setExpandedCats] = useState({});
  const [ordersViewMode, setOrdersViewMode] = useState('monthly');
  const [summaryTimeFilter, setSummaryTimeFilter] = useState('today');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCat = (catName) => {
    setExpandedCats(prev => ({ ...prev, [catName]: !prev[catName] }));
  };

  useEffect(() => {
    const savedRepairs = localStorage.getItem('dashboardRepairs');
    const savedExpenses = localStorage.getItem('dashboardExpenses');
    
    if (savedRepairs) setRepairs(JSON.parse(savedRepairs));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    
    if (!savedRepairs || !savedExpenses) {
      // no local data, we just wait for the refresh
    }
    
    // Always fetch fresh data when dashboard mounts
    handleManualRefresh();
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      if (fetchSales) await fetchSales();
      if (fetchCustomerDues) await fetchCustomerDues();

      const repairsData = await repairService.getRepairs();
      setRepairs(repairsData);
      localStorage.setItem('dashboardRepairs', JSON.stringify(repairsData));

      const expensesData = await expenseService.getExpenses();
      setExpenses(expensesData);
      localStorage.setItem('dashboardExpenses', JSON.stringify(expensesData));

      const now = new Date().toISOString();
      setLastRefreshed(now);
      localStorage.setItem('dashboardLastRefreshed', now);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();

  // Helper to calculate Net Income of a single sale
  const getSaleIncome = (sale) => {
    if (sale.isRepair) {
      return Number(sale.amount || 0) - Number(sale.cost || 0);
    }
    let totalCost = 0;
    if (sale.cartItems && Array.isArray(sale.cartItems)) {
      sale.cartItems.forEach(item => {
        totalCost += (Number(item.cost || 0) * Number(item.qty || 1));
      });
    }
    return Number(sale.amount || 0) - totalCost;
  };
  
  // -- NEW SALES & INCOME METRICS --
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(today.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const todaySales = salesHistory.filter(s => s.timestamp && parseTimestamp(s.timestamp).toDateString() === today.toDateString());
  const yesterdaySales = salesHistory.filter(s => s.timestamp && parseTimestamp(s.timestamp).toDateString() === yesterday.toDateString());
  const monthSales = salesHistory.filter(s => s.timestamp && parseTimestamp(s.timestamp).getMonth() === today.getMonth() && parseTimestamp(s.timestamp).getFullYear() === today.getFullYear());
  const weekSales = salesHistory.filter(s => {
    if (!s.timestamp) return false;
    const d = parseTimestamp(s.timestamp);
    return d >= startOfWeek && d <= today;
  });
  const monthExpensesList = expenses.filter(e => e.timestamp && parseTimestamp(e.timestamp).getMonth() === today.getMonth() && parseTimestamp(e.timestamp).getFullYear() === today.getFullYear());
  
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const lastMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const lastMonthSales = salesHistory.filter(s => s.timestamp && parseTimestamp(s.timestamp).getMonth() === lastMonthIndex && parseTimestamp(s.timestamp).getFullYear() === lastMonthYear);
  const lastMonthExpensesList = expenses.filter(e => e.timestamp && parseTimestamp(e.timestamp).getMonth() === lastMonthIndex && parseTimestamp(e.timestamp).getFullYear() === lastMonthYear);
  
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const yesterdaySalesTotal = yesterdaySales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const todaySalesDiff = todaySalesTotal - yesterdaySalesTotal;
  const todayIncomeTotal = todaySales.reduce((sum, s) => sum + getSaleIncome(s), 0);

  const weekSalesTotal = weekSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const weekIncomeTotal = weekSales.reduce((sum, s) => sum + getSaleIncome(s), 0);

  const monthSalesTotal = monthSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const monthIncomeTotal = monthSales.reduce((sum, s) => sum + getSaleIncome(s), 0);
  
  const lastMonthSalesTotal = lastMonthSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const lastMonthIncomeTotal = lastMonthSales.reduce((sum, s) => sum + getSaleIncome(s), 0);

  const totalSalesTotal = salesHistory.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const totalIncomeTotal = salesHistory.reduce((sum, s) => sum + getSaleIncome(s), 0);

  const yearSales = salesHistory.filter(s => s.timestamp && parseTimestamp(s.timestamp).getFullYear() === currentYear);
  const yearIncomeTotal = yearSales.reduce((sum, s) => sum + getSaleIncome(s), 0);

  const monthExpensesTotal = monthExpensesList.reduce((sum, e) => sum + Number(e.amount), 0);
  const lastMonthExpensesTotal = lastMonthExpensesList.reduce((sum, e) => sum + Number(e.amount), 0);
  const weekExpensesTotal = expenses.filter(e => {
    if (!e.timestamp) return false;
    const d = parseTimestamp(e.timestamp);
    return d >= startOfWeek && d <= today;
  }).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const monthNetProfit = monthIncomeTotal - monthExpensesTotal; // If still needed for charts

  const totalOrders = salesHistory.length;

  // -- MOM GROWTH CALCULATIONS --
  const revenueGrowth = lastMonthSalesTotal === 0 ? 100 : ((monthSalesTotal - lastMonthSalesTotal) / lastMonthSalesTotal) * 100;
  const incomeGrowth = lastMonthIncomeTotal === 0 ? 100 : ((monthIncomeTotal - lastMonthIncomeTotal) / lastMonthIncomeTotal) * 100;

  // -- CUSTOMER BALANCES & DEBTORS COUNT --
  const customerBalancesMap = React.useMemo(() => {
    const balances = {};
    (customerDuesList || []).forEach(due => {
      const name = due.name || 'Unknown';
      if (!balances[name]) {
        balances[name] = { name, balance: 0, oldestPending: null };
      }
      
      const amt = Number(due.amount || 0);
      if (due.type === 'Payment') {
        balances[name].balance -= amt;
      } else if (due.status === 'Pending') {
        balances[name].balance += amt;
        const dDate = parseTimestamp(due.timestamp || due.date);
        if (!balances[name].oldestPending || dDate < balances[name].oldestPending) {
          balances[name].oldestPending = dDate;
        }
      }
    });
    return balances;
  }, [customerDuesList]);

  // People who owe money (balance > 0)
  const uniqueDebtorsCount = Object.values(customerBalancesMap).filter(c => c.balance > 0.01).length;

  // -- ACTIVE CUSTOMER BALANCES (DUES & ADVANCES) --
  const activeCustomerBalances = Object.values(customerBalancesMap)
    .filter(c => Math.abs(c.balance) > 0.01) // Has due or advance
    .map(c => {
      let riskLevel = 'Normal';
      if (c.balance > 0 && c.oldestPending) {
        const ageDays = (today - c.oldestPending) / (1000 * 60 * 60 * 24);
        if (ageDays > 14 || c.balance > 5000) riskLevel = 'High';
      }
      return { ...c, riskLevel };
    })
    .sort((a, b) => b.balance - a.balance); // Highest due first, advances at bottom

  // -- DYNAMIC SUMMARY PERFORMANCE TILES (4 TILES WITH TIMEFRAME FILTER) --
  const filteredSummarySales = React.useMemo(() => {
    if (summaryTimeFilter === 'today') return todaySales;
    if (summaryTimeFilter === 'this_week') return weekSales;
    if (summaryTimeFilter === 'this_month') return monthSales;
    if (summaryTimeFilter === 'prev_month') return lastMonthSales;
    return todaySales;
  }, [summaryTimeFilter, todaySales, weekSales, monthSales, lastMonthSales]);

  const filteredSummaryExpenses = React.useMemo(() => {
    if (summaryTimeFilter === 'today') {
      return expenses.filter(e => e.timestamp && parseTimestamp(e.timestamp).toDateString() === today.toDateString());
    }
    if (summaryTimeFilter === 'this_week') {
      return expenses.filter(e => {
        if (!e.timestamp) return false;
        const d = parseTimestamp(e.timestamp);
        return d >= startOfWeek && d <= today;
      });
    }
    if (summaryTimeFilter === 'this_month') return monthExpensesList;
    if (summaryTimeFilter === 'prev_month') return lastMonthExpensesList;
    return [];
  }, [summaryTimeFilter, expenses, today, startOfWeek, monthExpensesList, lastMonthExpensesList]);

  const summarySalesTotal = filteredSummarySales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const summaryBillCount = filteredSummarySales.length;

  // Dynamic targets requested by user: Daily: 1000, This Week: 5000, This Month: 20000, Previous Month: 20000
  const summarySalesTarget = summaryTimeFilter === 'today'
    ? 1000
    : summaryTimeFilter === 'this_week'
      ? 5000
      : summaryTimeFilter === 'this_month'
        ? 20000
        : 20000;

  const salesProgressPercent = summarySalesTarget > 0 
    ? Math.min(100, Math.round((summarySalesTotal / summarySalesTarget) * 100))
    : 0;

  const summaryDuesTotal = totalPendingDues || 0;
  const summaryDuesCustomerCount = uniqueDebtorsCount;

  const summaryExpensesTotal = filteredSummaryExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const summaryExpensesCount = filteredSummaryExpenses.length;

  const summaryIncomeTotal = filteredSummarySales.reduce((sum, s) => sum + getSaleIncome(s), 0);
  const summaryProfitMargin = summarySalesTotal > 0 ? Math.round((summaryIncomeTotal / summarySalesTotal) * 100) : 0;

  const summaryFilterOptions = [
    { key: 'today', label: 'Today', targetLabel: 'Target: Rs 1,000' },
    { key: 'this_week', label: 'This Week', targetLabel: 'Target: Rs 5,000' },
    { key: 'this_month', label: 'This Month', targetLabel: 'Target: Rs 20,000' },
    { key: 'prev_month', label: 'Previous Month', targetLabel: 'Target: Rs 20,000' }
  ];
  const activeFilterObj = summaryFilterOptions.find(f => f.key === summaryTimeFilter) || summaryFilterOptions[0];

  // -- FAST MOVING ITEMS --
  const itemCounts = {};
  monthSales.forEach(sale => {
    if (!sale.isRepair) {
      (sale.cartItems || []).forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + Number(item.qty || 1);
      });
    }
  });
  const fastMovingItems = Object.keys(itemCounts)
    .map(name => ({ name, qty: itemCounts[name] }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  const totalFastMovingQty = fastMovingItems.reduce((sum, item) => sum + item.qty, 0);

  // -- REPAIR METRICS --
  const activeRepairs = repairs.filter(r => r.status === 'Pending' || r.status === 'In Progress');
  const readyDeliveries = repairs.filter(r => r.status === 'Ready');

  // -- CALENDAR DATA (Current Month) --
  const calendarDays = React.useMemo(() => {
    const year = currentYear;
    const month = currentMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = (firstDay === 0 ? 6 : firstDay - 1); // Mon=0, Sun=6
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dDate = new Date(year, month, i);
      const dStr = dDate.toDateString();
      
      const daySales = monthSales.filter(s => s.timestamp && parseTimestamp(s.timestamp).toDateString() === dStr);
      const dayIncome = daySales.reduce((sum, s) => sum + getSaleIncome(s), 0);
      
      const dayExpenses = monthExpensesList.filter(e => e.timestamp && parseTimestamp(e.timestamp).toDateString() === dStr);
      const dayExpTotal = dayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      
      days.push({ 
        day: i, 
        isCurrentMonth: true, 
        income: dayIncome, 
        expenses: dayExpTotal,
        isToday: dStr === today.toDateString()
      });
    }
    
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextDay = 1;
    while (days.length < totalCells) {
      days.push({ day: nextDay++, isCurrentMonth: false });
    }
    return days;
  }, [currentYear, currentMonth, monthSales, monthExpensesList, today]);

  // -- CHART: Sales vs Income (Week/Month toggle) --
  const currentDay = today.getDate();

  const thisWeekDays = [];
  const tempDate = new Date(startOfWeek);
  while (tempDate <= today) {
    thisWeekDays.push(tempDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }));
    tempDate.setDate(tempDate.getDate() + 1);
  }
  
  const thisMonthDays = [...Array(currentDay)].map((_, i) => {
    const d = new Date(currentYear, currentMonth, i + 1);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  });

  const lastMonthDaysCount = new Date(lastMonthYear, lastMonthIndex + 1, 0).getDate();
  const lastMonthDaysArray = [...Array(lastMonthDaysCount)].map((_, i) => {
    const d = new Date(lastMonthYear, lastMonthIndex, i + 1);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  });

  let chartDays = [];
  if (revenueTimeFilter === 'week') chartDays = thisWeekDays;
  else if (revenueTimeFilter === 'lastMonth') chartDays = lastMonthDaysArray;
  else chartDays = thisMonthDays;

  const salesIncomeMap = {};
  chartDays.forEach(d => salesIncomeMap[d] = { sales: 0, income: 0, expenses: 0, billCount: 0 });

  let sourceDataForChart = [];
  if (revenueTimeFilter === 'week') sourceDataForChart = weekSales;
  else if (revenueTimeFilter === 'lastMonth') sourceDataForChart = lastMonthSales;
  else sourceDataForChart = monthSales;

  let sourceExpensesForChart = [];
  if (revenueTimeFilter === 'week') sourceExpensesForChart = expenses.filter(e => e.timestamp && parseTimestamp(e.timestamp) >= startOfWeek && parseTimestamp(e.timestamp) <= today);
  else if (revenueTimeFilter === 'lastMonth') sourceExpensesForChart = lastMonthExpensesList;
  else sourceExpensesForChart = monthExpensesList;

  sourceDataForChart.forEach(sale => {
    if (sale.timestamp) {
      const d = parseTimestamp(sale.timestamp);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      if (salesIncomeMap[dateStr] !== undefined) {
        salesIncomeMap[dateStr].sales += Number(sale.amount || 0);
        salesIncomeMap[dateStr].income += getSaleIncome(sale);
        salesIncomeMap[dateStr].billCount += 1;
      }
    }
  });

  sourceExpensesForChart.forEach(expense => {
    if (expense.timestamp) {
      const d = parseTimestamp(expense.timestamp);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      if (salesIncomeMap[dateStr] !== undefined) {
        salesIncomeMap[dateStr].expenses += Number(expense.amount || 0);
      }
    }
  });

  const todayDateStr = today.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  const salesIncomeChartData = chartDays.map(date => ({
    date: date.split(' ')[1], // show day number on x-axis
    fullDate: date,
    sales: salesIncomeMap[date].sales,
    income: salesIncomeMap[date].income,
    expenses: salesIncomeMap[date].expenses,
    billCount: salesIncomeMap[date].billCount,
    isToday: date === todayDateStr
  }));

  const totalBillsInPeriod = salesIncomeChartData.reduce((sum, d) => sum + d.billCount, 0);
  const avgBillsPerDay = chartDays.length > 0 ? (totalBillsInPeriod / chartDays.length).toFixed(1) : '0';
  const peakBillsDay = salesIncomeChartData.reduce((max, d) => d.billCount > max.billCount ? d : max, { billCount: 0, date: '-' });

  // -- CHART: This Month's Revenue & Orders by Hour (Peak Hours Heatmap) --
  const monthHoursMap = {};
  for (let i = 8; i <= 20; i += 2) {
    const period = i >= 12 ? 'PM' : 'AM';
    const hour = i > 12 ? i - 12 : i;
    monthHoursMap[`${hour}:00 ${period}`] = { time: `${hour}:00 ${period}`, revenue: 0, orders: 0 };
  }
  monthHoursMap['Later'] = { time: 'Later', revenue: 0, orders: 0 };

  monthSales.forEach(sale => {
    if (sale.timestamp) {
      const d = parseTimestamp(sale.timestamp);
      const h = d.getHours();
      
      let timeKey = 'Later';
      if (h >= 8 && h < 10) timeKey = '8:00 AM';
      else if (h >= 10 && h < 12) timeKey = '10:00 AM';
      else if (h >= 12 && h < 14) timeKey = '12:00 PM';
      else if (h >= 14 && h < 16) timeKey = '2:00 PM';
      else if (h >= 16 && h < 18) timeKey = '4:00 PM';
      else if (h >= 18 && h < 20) timeKey = '6:00 PM';
      else if (h >= 20 && h < 22) timeKey = '8:00 PM';

      if (monthHoursMap[timeKey]) {
        monthHoursMap[timeKey].revenue += Number(sale.amount || 0);
        monthHoursMap[timeKey].orders += 1;
      }
    }
  });

  const monthHoursData = Object.values(monthHoursMap).filter(d => d.time !== 'Later' || d.revenue > 0);
  const peakHourData = monthHoursData.length > 0 
    ? monthHoursData.reduce((prev, curr) => curr.revenue > prev.revenue ? curr : prev, monthHoursData[0])
    : null;
  const maxHourRevenue = monthHoursData.reduce((max, h) => Math.max(max, h.revenue), 1);

  // -- Prepare Category Mapping --
  const itemToCategory = {};
  posCategories.forEach(cat => {
    (cat.items || []).forEach(item => {
      itemToCategory[item.name] = cat.category;
    });
  });

  // -- CHART: Income Comparison by Category (This vs Last Month) --
  const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const comparisonMap = {};
  const allServicesSet = new Set();

  salesHistory.forEach(sale => {
    if (sale.timestamp) {
      const d = parseTimestamp(sale.timestamp);
      const isThisMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      const isLastMonth = d.getMonth() === prevMonthIndex && d.getFullYear() === prevMonthYear;
      
      if (isThisMonth || isLastMonth) {
        if (sale.isRepair) {
          if (!comparisonMap['PC Repairs']) comparisonMap['PC Repairs'] = { thisMonth: 0, lastMonth: 0, itemsMap: {} };
          const repairIncome = (Number(sale.amount || 0) - Number(sale.cost || 0));
          const itemName = sale.device || 'Other Repair';
          allServicesSet.add(itemName);
          
          if (!comparisonMap['PC Repairs'].itemsMap[itemName]) comparisonMap['PC Repairs'].itemsMap[itemName] = { thisMonth: 0, lastMonth: 0 };
          
          if (isThisMonth) {
            comparisonMap['PC Repairs'].thisMonth += repairIncome;
            comparisonMap['PC Repairs'].itemsMap[itemName].thisMonth += repairIncome;
          }
          if (isLastMonth) {
            comparisonMap['PC Repairs'].lastMonth += repairIncome;
            comparisonMap['PC Repairs'].itemsMap[itemName].lastMonth += repairIncome;
          }
        } else {
          (sale.cartItems || []).forEach(item => {
            const catName = itemToCategory[item.name] || 'Other';
            if (!comparisonMap[catName]) comparisonMap[catName] = { thisMonth: 0, lastMonth: 0, itemsMap: {} };
            const itemIncome = (Number(item.price || 0) - Number(item.cost || 0)) * Number(item.qty || 1);
            const itemName = item.name;
            allServicesSet.add(itemName);

            if (!comparisonMap[catName].itemsMap[itemName]) comparisonMap[catName].itemsMap[itemName] = { thisMonth: 0, lastMonth: 0 };
            
            if (isThisMonth) {
              comparisonMap[catName].thisMonth += itemIncome;
              comparisonMap[catName].itemsMap[itemName].thisMonth += itemIncome;
            }
            if (isLastMonth) {
              comparisonMap[catName].lastMonth += itemIncome;
              comparisonMap[catName].itemsMap[itemName].lastMonth += itemIncome;
            }
          });
        }
      }
    }
  });

  const categoryComparisonData = Object.keys(comparisonMap)
    .filter(name => comparisonMap[name].thisMonth > 0 || comparisonMap[name].lastMonth > 0)
    .map(name => {
       const catData = {
         name,
         thisMonth: comparisonMap[name].thisMonth,
         lastMonth: comparisonMap[name].lastMonth,
         itemsList: Object.keys(comparisonMap[name].itemsMap).map(itemName => ({
             name: itemName,
             thisMonth: comparisonMap[name].itemsMap[itemName].thisMonth,
             lastMonth: comparisonMap[name].itemsMap[itemName].lastMonth
         })).sort((a, b) => b.thisMonth - a.thisMonth)
       };
       
       Object.keys(comparisonMap[name].itemsMap).forEach(itemName => {
           catData[`${itemName}_thisMonth`] = comparisonMap[name].itemsMap[itemName].thisMonth;
           catData[`${itemName}_lastMonth`] = comparisonMap[name].itemsMap[itemName].lastMonth;
       });

       return catData;
    })
    .sort((a, b) => b.thisMonth - a.thisMonth);

  const uniqueServices = Array.from(allServicesSet);

  // -- DONUT CHART: REVENUE BY CATEGORY --
  const donutChartData = Object.keys(comparisonMap)
    .filter(name => comparisonMap[name].thisMonth > 0)
    .map(name => ({
      name,
      value: comparisonMap[name].thisMonth
    }))
    .sort((a, b) => b.value - a.value);

  // -- CHART: Repair Status --
  const statusMap = { Pending: 0, 'In Progress': 0, Ready: 0, Delivered: 0, Cancelled: 0 };
  repairs.forEach(r => {
    if (statusMap[r.status] !== undefined) {
      statusMap[r.status] += 1;
    }
  });
  const repairStatusData = Object.keys(statusMap)
    .filter(k => statusMap[k] > 0)
    .map(name => ({ name, value: statusMap[name] }))
    .sort((a, b) => b.value - a.value);

  // -- CHART: Combined Monthly Financials (Repair Profit, POS Income, Expenses) --
  const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyDataMap = {};
  monthsList.forEach(m => {
    monthlyDataMap[m] = { month: m, repairProfit: 0, posIncome: 0, expenses: 0 };
  });

  salesHistory.forEach(sale => {
    if (sale.timestamp) {
      const d = parseTimestamp(sale.timestamp);
      if (d.getFullYear() === currentYear) {
        const monthStr = monthsList[d.getMonth()];
        if (sale.isRepair) {
          const profit = Number(sale.amount || 0) - Number(sale.cost || 0);
          if (profit > 0) {
            monthlyDataMap[monthStr].repairProfit += profit;
          }
        } else {
          let posProfit = 0;
          (sale.cartItems || []).forEach(item => {
             posProfit += (Number(item.price || 0) - Number(item.cost || 0)) * Number(item.qty || 1);
          });
          if (posProfit > 0) {
            monthlyDataMap[monthStr].posIncome += posProfit;
          }
        }
      }
    }
  });

  expenses.forEach(expense => {
    if (expense.timestamp) {
      const d = parseTimestamp(expense.timestamp);
      if (d.getFullYear() === currentYear) {
         const monthStr = monthsList[d.getMonth()];
         monthlyDataMap[monthStr].expenses += Number(expense.amount || 0);
      }
    }
  });

  const combinedMonthlyData = monthsList.map(month => monthlyDataMap[month]);

  // -- CHART: Daily Orders Counts (This Month) --
  const dailyOrdersMap = {};
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    dailyOrdersMap[i] = { day: i.toString(), orders: 0 };
  }

  salesHistory.forEach(sale => {
    if (sale.timestamp) {
      const d = parseTimestamp(sale.timestamp);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        dailyOrdersMap[d.getDate()].orders += 1;
      }
    }
  });

  const dailyOrdersData = Object.values(dailyOrdersMap);

  // -- CHART: Monthly Orders Counts ({currentYear}) --
  const monthlyOrdersMap = {};
  monthsList.forEach(m => {
    monthlyOrdersMap[m] = {
      month: m,
      orders: 0,
      posOrders: 0,
      repairOrders: 0,
      revenue: 0
    };
  });

  salesHistory.forEach(sale => {
    if (sale.timestamp) {
      const d = parseTimestamp(sale.timestamp);
      if (d.getFullYear() === currentYear) {
        const mStr = monthsList[d.getMonth()];
        if (monthlyOrdersMap[mStr]) {
          monthlyOrdersMap[mStr].orders += 1;
          if (sale.isRepair) {
            monthlyOrdersMap[mStr].repairOrders += 1;
          } else {
            monthlyOrdersMap[mStr].posOrders += 1;
          }
          monthlyOrdersMap[mStr].revenue += Number(sale.amount || 0);
        }
      }
    }
  });

  const monthlyOrdersData = monthsList.map(m => monthlyOrdersMap[m]);
  const thisMonthOrderCount = monthSales.length;
  const lastMonthOrderCount = lastMonthSales.length;
  const orderGrowth = lastMonthOrderCount === 0 
    ? (thisMonthOrderCount > 0 ? 100 : 0) 
    : (((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount) * 100);
  const avgOrdersPerDay = today.getDate() > 0 ? (thisMonthOrderCount / today.getDate()).toFixed(1) : 0;
  const yearOrdersCount = yearSales.length;

  // -- CHART: Daily Comparison (This Month vs Last Month) --
  const dailyComparisonMap = {};
  for (let i = 1; i <= 31; i++) {
    dailyComparisonMap[i] = { 
      day: i.toString(), 
      thisMonthSales: 0, 
      thisMonthIncome: 0, 
      lastMonthSales: 0, 
      lastMonthIncome: 0 
    };
  }
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonth = prevMonthDate.getMonth();
  const yearOfLastMonth = prevMonthDate.getFullYear();

  salesHistory.forEach(sale => {
    if (sale.timestamp) {
      const d = parseTimestamp(sale.timestamp);
      const day = d.getDate();
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const saleAmount = Number(sale.amount || 0);
      const saleIncome = getSaleIncome(sale);

      if (m === currentMonth && y === currentYear) {
        dailyComparisonMap[day].thisMonthSales += saleAmount;
        dailyComparisonMap[day].thisMonthIncome += saleIncome;
      } else if (m === lastMonth && y === yearOfLastMonth) {
        dailyComparisonMap[day].lastMonthSales += saleAmount;
        dailyComparisonMap[day].lastMonthIncome += saleIncome;
      }
    }
  });
  
  const dailyComparisonData = Object.values(dailyComparisonMap).filter(d => 
     Number(d.day) <= 28 || d.thisMonthSales > 0 || d.lastMonthSales > 0 || d.thisMonthIncome > 0 || d.lastMonthIncome > 0
  );

  // -- TOP 5 CUSTOMERS (THIS MONTH) --
  const customerSpendMap = {};
  salesHistory.forEach(sale => {
    if (sale.timestamp) {
      const d = parseTimestamp(sale.timestamp);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const custName = sale.customerName?.trim() || 'Walk-in Customer';
        if (!customerSpendMap[custName]) {
          customerSpendMap[custName] = { name: custName, totalSpend: 0, orderCount: 0 };
        }
        customerSpendMap[custName].totalSpend += Number(sale.amount || 0);
        customerSpendMap[custName].orderCount += 1;
      }
    }
  });
  
  const top5Customers = Object.values(customerSpendMap)
    .filter(c => c.name !== 'Walk-in Customer' && !c.name.toLowerCase().startsWith('customer '))
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5);

  // -- RECENT ACTIVITY --
  // Merge sales and repairs, sort by date
  const allActivities = [
    ...salesHistory.map(s => {
      let categories = [];
      if (s.isRepair) {
        categories = ['PC Repairs'];
      } else {
        categories = (s.cartItems || []).map(item => itemToCategory[item.name] || 'Other');
        categories = [...new Set(categories)];
      }
      return {
        id: s.id,
        type: 'SALE',
        title: categories.length > 0 ? categories.join(', ') : 'POS Sale',
        amount: s.amount,
        date: s.timestamp ? parseTimestamp(s.timestamp) : new Date(),
        items: s.cartItems?.length || 0
      };
    }),
    ...repairs.map(r => ({
      id: r.id,
      type: 'REPAIR',
      title: `Repair Job: ${r.deviceType || 'Device'}`,
      status: r.status,
      customer: r.customerName,
      date: r.createdAt ? parseTimestamp(r.createdAt) : new Date()
    }))
  ].sort((a, b) => b.date - a.date).slice(0, 8);


  // Data for High Labels
  const maxRevenueData = salesIncomeChartData.length > 0 ? salesIncomeChartData.reduce((prev, current) => (prev.sales > current.sales) ? prev : current) : null;
  const maxTodayData = monthHoursData.length > 0 ? monthHoursData.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current) : null;

  // Render Helpers
  const renderHorizontalBarLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    if (index !== 0) return null; // Since topItems is sorted descending
    return (
      <text x={x + width + 8} y={y + height / 2} fill="#e2e8f0" fontSize={11} fontWeight="bold" dominantBaseline="central">
        High: {value}
      </text>
    );
  };



  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isDate = payload[0].payload.fullDate;
      const dataObj = payload[0].payload;
      return (
        <div className="bg-[#0b182f] border border-slate-700/80 p-3 rounded-xl shadow-2xl min-w-[150px]">
          <p className="text-slate-200 text-xs font-black mb-2 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>{isDate || label}</span>
            {dataObj.billCount !== undefined && (
              <span className="text-[10px] text-cyan-400 font-mono font-bold">
                {dataObj.billCount} {dataObj.billCount === 1 ? 'Bill' : 'Bills'}
              </span>
            )}
          </p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex justify-between items-center gap-4 text-xs">
                <span className="text-slate-400 font-medium">{entry.name}:</span>
                <span className="font-black font-mono" style={{ color: entry.color }}>
                  {entry.name?.includes('Order') || entry.name?.includes('Count') || entry.name?.includes('Bill') 
                    ? entry.value 
                    : `Rs ${Number(entry.value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = (props) => {
    const { cx, cy, midAngle, outerRadius, index, name } = props;
    if (index !== 0) return null;

    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius) * cos;
    const sy = cy + (outerRadius) * sin;
    const mx = cx + (outerRadius + 15) * cos;
    const my = cy + (outerRadius + 15) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 12;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#94a3b8" fill="none" />
        <circle cx={ex} cy={ey} r={2} fill="#94a3b8" stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill="#e2e8f0" fontSize={11} fontWeight="bold" dominantBaseline="central">
          {name}
        </text>
      </g>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-2 overflow-hidden text-slate-100">
      
      {/* Top Header Control Strip */}
      <div className="relative z-20 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
        
        {/* Left: Title & Live indicator */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
            <LayoutDashboard className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
              <span>Store Performance & Analytics</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/25">Live Feed</span>
            </h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Real-time revenue, repair pipeline, customer dues, and financial growth metrics
            </p>
          </div>
        </div>

        {/* Right: Actions & Sync Status */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-1.5 shadow-sm">
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
            )}
            <span className="text-[10px] font-bold text-slate-300 font-mono">
              {loading ? 'SYNCING...' : (lastRefreshed ? `SYNCED: ${formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true }).toUpperCase()}` : 'SYNCED: JUST NOW')}
            </span>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Sync all data from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 pb-16">
        
        {/* SUMMARY FILTER PILLS STRIP */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1 px-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">Performance Summary</span>
          </div>

          {/* Timeframe Pill Buttons */}
          <div className="flex items-center bg-[#071326] p-0.5 rounded-xl border border-slate-800/90 shadow-sm">
            {summaryFilterOptions.map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSummaryTimeFilter(opt.key)}
                className={`px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  summaryTimeFilter === opt.key 
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 DYNAMIC SUMMARY TILES (COMPACT SINGLE ROW) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3 mb-3">
          
          {/* Tile 1: Total Sales (with bill count & progress bar) */}
          <motion.div 
            key={`sales-${summaryTimeFilter}`}
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-500 p-3 text-white shadow-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/90">
                Total Sales
              </span>
              <div className="w-6 h-6 rounded-full border border-white/30 bg-white/10 flex items-center justify-center shrink-0 text-[9px] font-black font-mono shadow-inner">
                {salesProgressPercent}%
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-1 my-0.5">
              <h4 className="text-base sm:text-lg font-black font-mono tracking-tight">
                Rs. {summarySalesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/25 border border-white/15 whitespace-nowrap">
                Count: {summaryBillCount}
              </span>
            </div>

            {/* Compact Progress Bar against dynamic target (daily 1000, week 5000, month 20000) */}
            <div className="mt-1.5 pt-1 border-t border-white/15">
              <div className="flex justify-between items-center text-[9px] font-mono text-white/80 mb-0.5">
                <span>{activeFilterObj.targetLabel}</span>
                <span>{salesProgressPercent}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-black/30 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${salesProgressPercent}%` }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* Tile 2: Total Dues (with customer count, NO progress bar) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.2, delay: 0.04 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 p-3 text-white shadow-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/90">
                Total Dues
              </span>
              <div className="w-6 h-6 rounded-full border border-white/30 bg-white/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-100" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-1 my-0.5">
              <h4 className="text-base sm:text-lg font-black font-mono tracking-tight">
                Rs. {summaryDuesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/25 border border-white/15 whitespace-nowrap">
                {summaryDuesCustomerCount} Customers
              </span>
            </div>

            <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[9px] text-white/80 font-mono">
              <span>Customer Ledger</span>
              <span className="font-bold">{summaryDuesCustomerCount > 0 ? 'Action Req' : 'Clear'}</span>
            </div>
          </motion.div>

          {/* Tile 3: Expenses Sum */}
          <motion.div 
            key={`exp-${summaryTimeFilter}`}
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.2, delay: 0.08 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-700 via-red-600 to-rose-700 p-3 text-white shadow-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/90">
                Expenses
              </span>
              <div className="w-6 h-6 rounded-full border border-white/30 bg-white/10 flex items-center justify-center shrink-0">
                <TrendingDown className="w-3.5 h-3.5 text-rose-100" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-1 my-0.5">
              <h4 className="text-base sm:text-lg font-black font-mono tracking-tight">
                Rs. {summaryExpensesTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/25 border border-white/15 whitespace-nowrap">
                {summaryExpensesCount} Bills
              </span>
            </div>

            <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[9px] text-white/80 font-mono">
              <span>{activeFilterObj.label} Expenses</span>
              <span className="font-bold">
                {summarySalesTotal > 0 ? `${Math.round((summaryExpensesTotal / summarySalesTotal) * 100)}% of Sales` : '0%'}
              </span>
            </div>
          </motion.div>

          {/* Tile 4: Income */}
          <motion.div 
            key={`inc-${summaryTimeFilter}`}
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.2, delay: 0.12 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 p-3 text-white shadow-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/90">
                Net Income
              </span>
              <div className="w-6 h-6 rounded-full border border-white/30 bg-white/10 flex items-center justify-center shrink-0 text-[9px] font-black font-mono shadow-inner">
                {summaryProfitMargin}%
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-1 my-0.5">
              <h4 className="text-base sm:text-lg font-black font-mono tracking-tight">
                Rs. {summaryIncomeTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/25 border border-white/15 whitespace-nowrap">
                Margin: {summaryProfitMargin}%
              </span>
            </div>

            <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[9px] text-white/80 font-mono">
              <span>{activeFilterObj.label} Income</span>
              <span className="font-bold">Realized Net</span>
            </div>
          </motion.div>

        </div>

        {/* ROW: SALES VS INCOME (LEFT) & DAILY BILL COUNT (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          
          {/* Sales vs Income Composed Chart (lg:col-span-8) */}
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="lg:col-span-8 bg-[#071326] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-[390px] hover:border-slate-700/80 transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    Sales vs Income Analysis
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                    {revenueTimeFilter === 'week' ? 'This Week' : revenueTimeFilter === 'lastMonth' ? 'Last Month' : 'This Month'}
                  </span>
                </div>

                {/* Week / Month / Last Month toggle */}
                <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 w-fit">
                  <button 
                    onClick={() => setRevenueTimeFilter('week')}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${revenueTimeFilter === 'week' ? 'bg-sky-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setRevenueTimeFilter('month')}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${revenueTimeFilter === 'month' ? 'bg-sky-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    This Month
                  </button>
                  <button 
                    onClick={() => setRevenueTimeFilter('lastMonth')}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${revenueTimeFilter === 'lastMonth' ? 'bg-sky-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    Last Month
                  </button>
                </div>
              </div>

              {/* Legends & Financial Totals */}
              <div className="flex flex-wrap gap-2 sm:gap-3.5 bg-slate-950/80 p-2 sm:p-2.5 rounded-xl border border-slate-800/80 text-[10px] font-mono font-bold">
                <div className="flex items-center gap-1.5 text-sky-400">
                  <div className="w-2.5 h-2.5 rounded-sm bg-sky-400"></div>
                  <span>Sales: Rs {(revenueTimeFilter === 'week' ? weekSalesTotal : revenueTimeFilter === 'lastMonth' ? lastMonthSalesTotal : monthSalesTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 border-l border-slate-800 pl-2 sm:pl-3.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span>Income: Rs {(revenueTimeFilter === 'week' ? weekIncomeTotal : revenueTimeFilter === 'lastMonth' ? lastMonthIncomeTotal : monthIncomeTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400 border-l border-slate-800 pl-2 sm:pl-3.5">
                  <div className="w-2.5 h-1 border-t-2 border-dashed border-rose-400"></div>
                  <span>Exp: Rs {(revenueTimeFilter === 'week' ? weekExpensesTotal : revenueTimeFilter === 'lastMonth' ? lastMonthExpensesTotal : monthExpensesTotal).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* Clear, Unified Composed Chart */}
            <div className="flex-1 min-h-0 w-full mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={salesIncomeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSalesClear" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.85}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.25}/>
                    </linearGradient>
                    <linearGradient id="colorIncomeAreaClear" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs ${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#0f172a', opacity: 0.5 }} />
                  {/* Sales Bar */}
                  <Bar dataKey="sales" name="Sales" fill="url(#colorSalesClear)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  {/* Income Area & Line on the exact same scale */}
                  <Area type="monotone" dataKey="income" name="Net Income" fill="url(#colorIncomeAreaClear)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981', strokeWidth: 1.5, stroke: '#071326' }} activeDot={{ r: 5 }} />
                  {/* Expenses Dashed Line */}
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right: Daily Bill Count Chart (lg:col-span-4) */}
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.1 }} className="lg:col-span-4 bg-[#071326] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-[390px] hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    Daily Bill Count
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Daily transaction volume</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Bills</span>
                <span className="text-sm font-black text-cyan-400 font-mono">{totalBillsInPeriod} Bills</span>
              </div>
            </div>

            {/* Daily Bars */}
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesIncomeChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDailyBills" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#0f172a', opacity: 0.5 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#0b182f] border border-slate-700/80 p-2.5 rounded-xl shadow-xl text-xs font-mono">
                            <p className="text-slate-300 font-bold mb-1 font-sans">{d.fullDate}</p>
                            <p className="text-cyan-400 font-black">{d.billCount} {d.billCount === 1 ? 'Bill' : 'Bills'}</p>
                            <p className="text-[10px] text-emerald-400 font-bold mt-1 pt-1 border-t border-slate-800">
                              Sales: Rs {Number(d.sales || 0).toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="billCount" name="Bills" radius={[4, 4, 0, 0]} maxBarSize={22}>
                    {salesIncomeChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-bill-${index}`} 
                        fill={entry.isToday ? '#10b981' : 'url(#colorDailyBills)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Metrics Footer */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60 flex items-center justify-between">
                <span className="text-slate-400">Avg / Day:</span>
                <span className="font-bold text-white">{avgBillsPerDay} Bills</span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60 flex items-center justify-between">
                <span className="text-slate-400">Peak Day:</span>
                <span className="font-bold text-cyan-400">Day {peakBillsDay.date} ({peakBillsDay.billCount})</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ROW 3: TOP SPENDERS & FAST-MOVING ITEMS (PIE CHART) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          
          {/* Top Spenders */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="bg-[#071326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col h-[360px] hover:border-slate-700/80 transition-all">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Top Spenders (This Month)
              </span>
              <Users className="w-4 h-4 text-emerald-400" />
            </h3>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
              {top5Customers.length === 0 ? (
                <p className="text-slate-500 text-xs text-center mt-6">No customer data yet</p>
              ) : (
                top5Customers.map((cust, i) => (
                  <div key={i} className="flex gap-3 items-center p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/40 transition-all border border-slate-800/80 hover:border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xs shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.15)] font-mono">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-200 truncate">{cust.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                        <ShoppingCart className="w-3 h-3 text-emerald-400/70" /> {cust.orderCount} Orders
                      </p>
                    </div>
                    <div className="text-xs font-black text-emerald-400 whitespace-nowrap bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 font-mono">
                      Rs {cust.totalSpend.toFixed(0)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Fast-Moving Items (Pie / Donut Chart) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-[#071326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col h-[360px] hover:border-slate-700/80 transition-all">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Fast-Moving Items (Top Sold)
              </span>
              <Zap className="w-4 h-4 text-amber-400" />
            </h3>

            {fastMovingItems.length === 0 ? (
              <p className="text-slate-500 text-xs text-center mt-12">No sales logged for this month</p>
            ) : (
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Donut Chart */}
                <div className="h-[180px] w-full sm:w-[48%] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fastMovingItems}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={4}
                        dataKey="qty"
                        nameKey="name"
                        stroke="none"
                      >
                        {fastMovingItems.map((entry, index) => (
                          <Cell key={`cell-fast-${index}`} fill={COLORS_EXTENDED[index % COLORS_EXTENDED.length]} />
                        ))}
                        <Label 
                          value={`${totalFastMovingQty} Sold`} 
                          position="center" 
                          fill="#f1f5f9" 
                          fontSize={13} 
                          fontWeight="black" 
                        />
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const share = totalFastMovingQty > 0 ? ((data.value / totalFastMovingQty) * 100).toFixed(1) : 0;
                            return (
                              <div className="bg-[#0b182f] border border-slate-700/80 p-2.5 rounded-xl shadow-xl font-mono text-xs">
                                <p className="text-slate-200 font-bold mb-1 font-sans">{data.name}</p>
                                <p className="font-black" style={{ color: data.payload.fill }}>
                                  {data.value} Units ({share}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend List */}
                <div className="w-full sm:w-[52%] space-y-1.5 max-h-[190px] overflow-y-auto no-scrollbar pr-1">
                  {fastMovingItems.map((item, idx) => {
                    const color = COLORS_EXTENDED[idx % COLORS_EXTENDED.length];
                    const share = totalFastMovingQty > 0 ? ((item.qty / totalFastMovingQty) * 100).toFixed(0) : 0;
                    return (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
                          <span className="text-slate-300 font-medium truncate">{item.name}</span>
                        </div>
                        <span className="font-black font-mono text-amber-400 shrink-0">
                          {item.qty} <span className="text-[10px] text-slate-500 font-normal">({share}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

        </div>

        {/* ROW 4: PEAK HOURS HEATMAP & MONTHLY FINANCIALS OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          
          {/* Peak Hours Heatmap (Attractive Design) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="bg-[#071326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Peak Hours Heatmap (This Month)
              </h3>
              {peakHourData && peakHourData.revenue > 0 && (
                <div className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[10px] font-mono font-black text-rose-400 flex items-center gap-1.5 shadow-sm">
                  <span>🔥 Rush Hour:</span>
                  <span className="text-white">{peakHourData.time}</span>
                  <span className="text-rose-300">(Rs {peakHourData.revenue.toLocaleString()})</span>
                </div>
              )}
            </div>

            {/* Hourly Heatmap Bar Chart */}
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPeakHeat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.95}/>
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.25}/>
                    </linearGradient>
                    <linearGradient id="colorRushBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb7185" stopOpacity={1}/>
                      <stop offset="95%" stopColor="#be123c" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickMargin={8} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `Rs ${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#0f172a', opacity: 0.6 }} 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#0b182f] border border-slate-700/80 p-2.5 rounded-xl shadow-xl font-mono text-xs">
                            <p className="text-slate-300 font-bold mb-1 font-sans">{label}</p>
                            <p className="text-rose-400 font-black">Revenue: Rs {d.revenue.toLocaleString()}</p>
                            <p className="text-slate-400 font-semibold mt-0.5">Orders: {d.orders || 0}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {monthHoursData.map((entry, index) => (
                      <Cell 
                        key={`cell-hour-${index}`} 
                        fill={peakHourData && entry.time === peakHourData.time ? 'url(#colorRushBar)' : 'url(#colorPeakHeat)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Traffic Heat Intensity Ribbon */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-mono mb-1.5 flex justify-between items-center">
                <span>Hourly Traffic Density</span>
                <span className="text-[9px] text-slate-500 font-bold">Low ➔ Rush Hour</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthHoursData.map((h, i) => {
                  const ratio = maxHourRevenue > 0 ? (h.revenue / maxHourRevenue) : 0;
                  let heatClass = 'bg-slate-900 text-slate-500 border-slate-800';
                  if (ratio > 0.75) heatClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.2)] font-bold';
                  else if (ratio > 0.4) heatClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                  else if (ratio > 0.15) heatClass = 'bg-sky-500/15 text-sky-300 border-sky-500/30';

                  return (
                    <div key={i} className={`p-1.5 rounded-lg border text-center transition-all ${heatClass}`}>
                      <p className="text-[9px] font-mono leading-tight">{h.time.split(' ')[0]}</p>
                      <p className="text-[8px] font-black mt-0.5">{ratio > 0 ? `${(ratio * 100).toFixed(0)}%` : '0%'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Combined Monthly Financials Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.1 }} className="bg-[#071326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Monthly Overview ({currentYear})
              </h3>
              <div className="flex gap-3 text-[10px] font-black uppercase font-mono">
                <div className="flex items-center gap-1.5 text-blue-400"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> POS</div>
                <div className="flex items-center gap-1.5 text-teal-400"><div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div> Repair</div>
                <div className="flex items-center gap-1.5 text-rose-400"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Exp</div>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={combinedMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickMargin={8} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `Rs ${val >= 1000 ? (val/1000).toFixed(0)+'k' : val}`} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#0f172a', opacity: 0.6}} content={<CustomTooltip />} />
                  <Bar dataKey="posIncome" name="POS Income" fill="#3b82f6" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="repairProfit" name="Repair Profit" fill="#14b8a6" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>

        {/* ROW 5: CATEGORY BREAKDOWN COMPARISON & REVENUE DONUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Income Breakdown Comparison (lg:col-span-8) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="lg:col-span-8 bg-[#071326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col hover:border-slate-700/80 transition-all">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-indigo-400" /> Income Breakdown Comparison
              </h3>
              <div className="flex gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div> This Month</div>
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]"><div className="w-2.5 h-2.5 rounded-sm bg-slate-500"></div> Last Month</div>
              </div>
            </div>
            
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={categoryComparisonData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }} barSize={12}>
                  <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(val) => `Rs ${val}`} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={11} fontWeight="bold" axisLine={false} tickLine={false} width={110} />
                  <Tooltip cursor={{fill: '#0f172a'}} content={<BarCustomTooltip />} />
                  {uniqueServices.map((serviceName, idx) => {
                    const color = COLORS_EXTENDED[idx % COLORS_EXTENDED.length];
                    return (
                      <React.Fragment key={idx}>
                        <Bar dataKey={`${serviceName}_thisMonth`} stackId="thisMonth" name={`${serviceName} (This Month)`} fill={color} />
                        <Bar dataKey={`${serviceName}_lastMonth`} stackId="lastMonth" name={`${serviceName} (Last Month)`} fill={color} fillOpacity={0.4} />
                      </React.Fragment>
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5 pl-2">Category</th>
                    <th className="pb-2.5 text-right">This Month</th>
                    <th className="pb-2.5 text-right">Last Month</th>
                    <th className="pb-2.5 text-right pr-2">Growth</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {categoryComparisonData.map((cat, idx) => {
                    const growth = cat.lastMonth > 0 ? ((cat.thisMonth - cat.lastMonth) / cat.lastMonth) * 100 : (cat.thisMonth > 0 ? 100 : 0);
                    const isPositive = growth > 0;
                    const isExpanded = expandedCats[cat.name];
                    
                    return (
                      <React.Fragment key={idx}>
                        <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => toggleCat(cat.name)}>
                          <td className="py-2.5 pl-2 font-semibold text-slate-200 flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                            {cat.name}
                          </td>
                          <td className="py-2.5 text-right text-emerald-400 font-bold font-mono">Rs {cat.thisMonth.toFixed(0)}</td>
                          <td className="py-2.5 text-right text-slate-400 font-semibold font-mono">Rs {cat.lastMonth.toFixed(0)}</td>
                          <td className="py-2.5 text-right pr-2 font-mono">
                            {growth !== 0 ? (
                              <span className={`inline-flex items-center gap-1 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? '+' : ''}{growth.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-slate-500 font-bold">-</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && cat.itemsList && cat.itemsList.map((item, itemIdx) => {
                           const itemGrowth = item.lastMonth > 0 ? ((item.thisMonth - item.lastMonth) / item.lastMonth) * 100 : (item.thisMonth > 0 ? 100 : 0);
                           const isItemPos = itemGrowth > 0;
                           return (
                             <tr key={`${idx}-${itemIdx}`} className="bg-slate-950/60 border-b border-slate-800/40 text-xs">
                               <td className="py-2 pl-10 font-medium text-slate-300 border-l-2 border-cyan-500/60">{item.name}</td>
                               <td className="py-2 text-right text-emerald-400/90 font-mono">Rs {item.thisMonth.toFixed(0)}</td>
                               <td className="py-2 text-right text-slate-400 font-mono">Rs {item.lastMonth.toFixed(0)}</td>
                               <td className="py-2 text-right pr-2 font-mono">
                                  {itemGrowth !== 0 ? (
                                    <span className={isItemPos ? 'text-emerald-400' : 'text-rose-400'}>
                                      {isItemPos ? '+' : ''}{itemGrowth.toFixed(1)}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                               </td>
                             </tr>
                           );
                        })}
                      </React.Fragment>
                    );
                  })}
                  {categoryComparisonData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-slate-500 py-6 text-sm">No comparison data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Revenue by Category Donut (lg:col-span-4) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.1 }} className="lg:col-span-4 bg-[#071326] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Revenue By Category
              </span>
              <PieChartIcon className="w-4 h-4 text-indigo-400" />
            </h3>
            
            <div className="h-[210px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_EXTENDED[index % COLORS_EXTENDED.length]} />
                    ))}
                    <Label 
                      value={`Rs ${monthSalesTotal >= 1000 ? (monthSalesTotal/1000).toFixed(1)+'k' : monthSalesTotal}`} 
                      position="center" 
                      fill="#f1f5f9" 
                      fontSize={15} 
                      fontWeight="black" 
                    />
                  </Pie>
                  <Tooltip 
                    content={({active, payload}) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#0b182f] border border-slate-700/80 p-3 rounded-xl shadow-xl font-mono">
                            <p className="text-slate-300 text-xs font-semibold mb-1 font-sans">{payload[0].name}</p>
                            <p className="font-black text-sm" style={{ color: payload[0].payload.fill }}>
                              Rs {payload[0].value.toFixed(0)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 mt-2">
               {donutChartData.map((entry, idx) => (
                 <div key={idx} className="flex items-center justify-between gap-2 text-[10px]">
                   <div className="flex items-center gap-2 min-w-0">
                     <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS_EXTENDED[idx % COLORS_EXTENDED.length] }}></div>
                     <span className="text-slate-300 truncate">{entry.name}</span>
                   </div>
                   <span className="font-mono font-bold text-white shrink-0">Rs {entry.value.toFixed(0)}</span>
                 </div>
               ))}
            </div>
          </motion.div>

        </div>

      </div> {/* Scrollable container end */}
    </div>
  );
}
