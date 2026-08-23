import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceDot, Label, LabelList, ReferenceLine } from 'recharts';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatDistanceToNow } from 'date-fns';
import { parseTimestamp } from '../../utils/helpers';
import { 
  TrendingUp, TrendingDown, Activity, Wrench, ShoppingBag, 
  PlusCircle, Clock, CheckCircle2, AlertCircle, ShoppingCart, Users, RefreshCw, PieChart as PieChartIcon,
  ChevronDown, ChevronRight, Zap, Target, ArrowRight, UserX, AlertTriangle, ShieldAlert, Package, HelpCircle, LayoutDashboard
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
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-2xl">
        <p className="text-slate-200 font-bold mb-3 border-b border-slate-700/50 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => {
             if (!entry.value) return null;
             return (
               <div key={index} className="flex justify-between items-center gap-6 text-sm">
                 <span style={{ color: entry.color }} className="font-medium">{entry.name}</span>
                 <span className="text-slate-100 font-bold">Rs {entry.value.toFixed(0)}</span>
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

      const repairsQ = query(collection(db, 'repairs'), orderBy('createdAt', 'desc'));
      const repairsSnap = await getDocs(repairsQ);
      const repairsData = repairsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRepairs(repairsData);
      localStorage.setItem('dashboardRepairs', JSON.stringify(repairsData));

      const expensesQ = query(collection(db, 'shop_expenses'), orderBy('timestamp', 'desc'));
      const expensesSnap = await getDocs(expensesQ);
      const expensesData = expensesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
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

  // -- REPAIR METRICS --
  const activeRepairs = repairs.filter(r => r.status === 'Pending' || r.status === 'In Progress');
  const readyDeliveries = repairs.filter(r => r.status === 'Ready');

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
  chartDays.forEach(d => salesIncomeMap[d] = { sales: 0, income: 0, expenses: 0 });

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

  const salesIncomeChartData = chartDays.map(date => ({
    date: date.split(' ')[1], // show day number on x-axis
    fullDate: date,
    sales: salesIncomeMap[date].sales,
    income: salesIncomeMap[date].income,
    expenses: salesIncomeMap[date].expenses
  }));

  // -- CHART: This Month's Revenue by Hour --
  const monthHoursMap = {};
  for (let i = 8; i <= 20; i += 2) {
    const period = i >= 12 ? 'PM' : 'AM';
    const hour = i > 12 ? i - 12 : i;
    monthHoursMap[`${hour}:00 ${period}`] = 0;
  }
  monthHoursMap['Later'] = 0;

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

      if (monthHoursMap[timeKey] !== undefined) {
        monthHoursMap[timeKey] += Number(sale.amount || 0);
      }
    }
  });

  const monthHoursData = Object.keys(monthHoursMap).map(time => ({
    time,
    revenue: monthHoursMap[time]
  })).filter(d => d.time !== 'Later' || d.revenue > 0);

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
      return (
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl min-w-[120px]">
          <p className="text-slate-300 text-xs font-semibold mb-2 border-b border-white/10 pb-1">{isDate || label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between gap-4 mb-1">
              <span className="text-slate-400 text-[11px] uppercase font-bold">{entry.name || 'Value'}:</span>
              <span className="font-black text-[11px]" style={{ color: entry.color }}>
                {entry.name === 'Orders' ? entry.value : `Rs ${entry.value?.toFixed(2) || '0.00'}`}
              </span>
            </div>
          ))}
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
    <div className="p-4 space-y-4 w-full relative z-10 h-full flex flex-col pb-24 overflow-y-auto custom-scrollbar">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 md:px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-blue-400" /> DASHBOARD
          </h1>
          <div className="relative group cursor-help mt-1">
            <HelpCircle className="w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors" />
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 w-max max-w-xs px-3 py-2 bg-slate-800/95 backdrop-blur text-slate-200 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl border border-slate-700 z-50">
              Here's what's happening at your store today.
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex items-center bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-slate-300">
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {loading ? 'UPDATING...' : (lastRefreshed ? `UPDATED: ${formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true }).toUpperCase()}` : 'UPDATED: JUST NOW')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-4">
        {/* Card 1: Today */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-4 relative overflow-hidden group hover:bg-slate-900/80 transition-all shadow-xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Today
            </h3>
          </div>
          <div className="flex justify-between items-end relative z-10">
            <h3 className="text-xl lg:text-2xl font-black text-slate-100"><span className="text-xs lg:text-sm font-bold text-slate-500">Rs.</span> {todaySalesTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            {todaySalesDiff !== 0 && (
              <div className={`hidden lg:flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${todaySalesDiff > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {todaySalesDiff > 0 ? '+' : '-'} {Math.abs(todaySalesDiff).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Card 2: This Week */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-4 relative overflow-hidden group hover:bg-slate-900/80 transition-all shadow-xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" /> This Week
            </h3>
          </div>
          <div className="relative z-10">
            <h3 className="text-xl lg:text-2xl font-black text-slate-100"><span className="text-xs lg:text-sm font-bold text-slate-500">Rs.</span> {weekSalesTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
          </div>
        </motion.div>

        {/* Card 3: This Month */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-4 relative overflow-hidden group hover:bg-slate-900/80 transition-all shadow-xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" /> This Month
            </h3>
          </div>
          <div className="flex justify-between items-end relative z-10">
            <h3 className="text-xl lg:text-2xl font-black text-slate-100"><span className="text-xs lg:text-sm font-bold text-slate-500">Rs.</span> {monthSalesTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            <div className={`hidden lg:flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${revenueGrowth >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`} title="MoM Revenue Growth">
              {revenueGrowth >= 0 ? '+' : ''}{Math.abs(revenueGrowth).toFixed(1)}%
            </div>
          </div>
        </motion.div>

        {/* Card 4: Total All-Time */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.4, delay: 0.4 }} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-4 relative overflow-hidden group hover:bg-slate-900/80 transition-all shadow-xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-purple-400" /> All-Time
            </h3>
          </div>
          <div className="relative z-10">
            <h3 className="text-xl lg:text-2xl font-black text-slate-100"><span className="text-xs lg:text-sm font-bold text-slate-500">Rs.</span> {totalSalesTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
          </div>
        </motion.div>

        {/* Card 5: Pending Dues */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.4, delay: 0.5 }} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-4 relative overflow-hidden group hover:bg-slate-900/80 transition-all shadow-xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-400" /> Total Dues
            </h3>
          </div>
          <div className="flex justify-between items-end relative z-10">
            <h3 className="text-xl lg:text-2xl font-black text-orange-400"><span className="text-xs lg:text-sm font-bold text-orange-700/50">Rs.</span> {totalPendingDues?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || 0}</h3>
            {uniqueDebtorsCount > 0 && (
              <div className="hidden lg:flex text-[10px] font-bold text-orange-500/80 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                {uniqueDebtorsCount} {uniqueDebtorsCount === 1 ? 'Customer' : 'Customers'}
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Card 6: Monthly Expenses */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.4, delay: 0.6 }} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-4 relative overflow-hidden group hover:bg-slate-900/80 transition-all shadow-xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-red-400" /> Expenses
            </h3>
          </div>
          <div className="relative z-10">
            <h3 className="text-xl lg:text-2xl font-black text-red-400"><span className="text-xs lg:text-sm font-bold text-red-700/50">Rs.</span> {monthExpensesTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
          </div>
        </motion.div>
      </div>

      {/* WIDGET: SALES VS INCOME & INCOME SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col h-[380px] lg:col-span-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Sales vs Income ({revenueTimeFilter === 'week' ? 'This Week' : revenueTimeFilter === 'lastMonth' ? 'Last Month' : 'This Month'})</h3>
              <div className="flex bg-slate-950/50 p-1 rounded-lg border border-white/5 w-fit">
                <button 
                  onClick={() => setRevenueTimeFilter('week')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${revenueTimeFilter === 'week' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  This Week
                </button>
                <button 
                  onClick={() => setRevenueTimeFilter('month')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${revenueTimeFilter === 'month' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  This Month
                </button>
                <button 
                  onClick={() => setRevenueTimeFilter('lastMonth')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${revenueTimeFilter === 'lastMonth' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Last Month
                </button>
              </div>
            </div>
            <div className="flex gap-4 md:gap-6 bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sales</p>
                <p className="text-sm font-black text-slate-200">Rs {(revenueTimeFilter === 'week' ? weekSalesTotal : revenueTimeFilter === 'lastMonth' ? lastMonthSalesTotal : monthSalesTotal).toFixed(2)}</p>
              </div>
              <div className="text-right border-l border-white/10 pl-4 md:pl-6">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Total Income</p>
                <p className="text-sm font-black text-emerald-400">Rs {(revenueTimeFilter === 'week' ? weekIncomeTotal : revenueTimeFilter === 'lastMonth' ? lastMonthIncomeTotal : monthIncomeTotal).toFixed(2)}</p>
              </div>
              <div className="text-right border-l border-white/10 pl-4 md:pl-6">
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Total Expenses</p>
                <p className="text-sm font-black text-red-400">Rs {(revenueTimeFilter === 'week' ? weekExpensesTotal : revenueTimeFilter === 'lastMonth' ? lastMonthExpensesTotal : monthExpensesTotal).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesIncomeChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs ${val}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `Rs ${val}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                <Bar yAxisId="left" dataKey="sales" name="Sales" fill="url(#colorSales)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Line yAxisId="right" type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#020617' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line yAxisId="left" type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <ReferenceLine y={1000} yAxisId="left" stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Daily Target (Rs 1,000)', fill: '#f59e0b', fontSize: 10, fontWeight: 'bold' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Income Summary Widget */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col h-[380px]">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-6 flex items-center justify-between">
            Income Summary
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </h3>
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-1">
            {(() => {
              const goals = [
                { label: 'This Week Income', current: weekIncomeTotal, target: 5000 },
                { label: 'This Month Income', current: monthIncomeTotal, target: 20000 },
                { label: 'This Year Income', current: yearIncomeTotal, target: 240000 }
              ];

              return goals.map((goal, idx) => {
                const percent = Math.min(100, Math.max(0, (goal.current / goal.target) * 100));
                const themeColors = [
                  { bg: 'bg-teal-500/30', fill: 'bg-teal-500/80' },
                  { bg: 'bg-indigo-500/30', fill: 'bg-indigo-500/80' },
                  { bg: 'bg-orange-500/30', fill: 'bg-orange-500/80' }
                ];
                const theme = themeColors[idx % themeColors.length];

                return (
                  <div key={idx} className={`relative overflow-hidden rounded-2xl mb-3 flex flex-col justify-center p-4 ${theme.bg}`}>
                    {/* The Progress Bar Fill */}
                    <div className={`absolute top-0 left-0 h-full ${theme.fill} transition-all duration-1000 z-0`} style={{ width: `${percent}%` }}></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-white drop-shadow-sm">{goal.label}</span>
                      <span className="text-[11px] text-white/90 font-medium drop-shadow-sm">
                        Achieved: Rs {goal.current.toLocaleString('en-US', { maximumFractionDigits: 0 })} / Rs {goal.target.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              });
            })()}

            {/* Total All-Time (Compact) */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 flex items-center justify-between mt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total All-Time</span>
              <span className="text-sm font-black text-emerald-400">Rs {totalIncomeTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CHARTS */}
      {/* ROW 3: Donut, Top Customers, Fast Moving Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Revenue by Category Donut */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-lg flex flex-col h-[360px]">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-2 flex items-center justify-between">
            Revenue By Category
            <PieChartIcon className="w-4 h-4 text-indigo-400" />
          </h3>
          <div className="flex-1 min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
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
                    fontSize={20} 
                    fontWeight="black" 
                  />
                </Pie>
                <Tooltip 
                  content={({active, payload}) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl">
                          <p className="text-slate-300 text-xs font-semibold mb-1">{payload[0].name}</p>
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
          <div className="grid grid-cols-2 gap-2 mt-2 h-16 overflow-y-auto no-scrollbar">
             {donutChartData.map((entry, idx) => (
               <div key={idx} className="flex items-center gap-2 text-[10px]">
                 <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS_EXTENDED[idx % COLORS_EXTENDED.length] }}></div>
                 <span className="text-slate-300 truncate">{entry.name}</span>
               </div>
             ))}
          </div>
        </motion.div>

        {/* Premium Top 5 Customers */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col h-[360px]">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center justify-between">
            Top Spenders
            <Users className="w-4 h-4 text-emerald-400" />
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
            {top5Customers.length === 0 ? (
               <p className="text-slate-500 text-xs text-center mt-6">No customer data yet</p>
            ) : (
               top5Customers.map((cust, i) => (
                 <div key={i} className="flex gap-3 items-center p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-all border border-white/5">
                   <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                     #{i + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-slate-200 truncate">{cust.name}</p>
                     <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                       <ShoppingCart className="w-3 h-3 text-emerald-400/50" /> {cust.orderCount} Orders
                     </p>
                   </div>
                   <div className="text-xs font-black text-emerald-400 whitespace-nowrap bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                     Rs {cust.totalSpend.toFixed(0)}
                   </div>
                 </div>
               ))
            )}
          </div>
        </motion.div>

        {/* Fast-Moving Items */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col h-[360px]">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center justify-between">
            Fast-Moving Items
            <Zap className="w-4 h-4 text-yellow-400" />
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
            {fastMovingItems.length === 0 ? (
               <p className="text-slate-500 text-xs text-center mt-6">No items sold yet</p>
            ) : (
               fastMovingItems.map((item, i) => (
                 <div key={i} className="flex gap-3 items-center p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-all border border-white/5">
                   <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center font-black text-xs shrink-0 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                     {item.qty}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-slate-200 truncate">{item.name}</p>
                   </div>
                   <div className="text-[10px] uppercase font-black text-yellow-400 whitespace-nowrap bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                     Top Sold
                   </div>
                 </div>
               ))
            )}
          </div>
        </motion.div>
      </div>

      {/* ROW 4: Peak Hours Heatmap & Monthly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Peak Hours (Bar Chart) */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Peak Hours Heatmap (This Month)</h3>
          </div>
          <div className="flex-1 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthHoursData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `Rs${val}`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#1e293b', opacity: 0.5}} content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="url(#colorPeak)" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {
                    monthHoursData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={maxTodayData && entry.time === maxTodayData.time ? '#e11d48' : 'url(#colorPeak)'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Combined Monthly Financials Chart */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Monthly Overview ({currentYear})</h3>
            <div className="flex gap-4 text-[10px] font-semibold uppercase">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> POS</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div> Repair</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Exp</div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={combinedMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#475569" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `Rs${val}`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#1e293b', opacity: 0.5}} content={<CustomTooltip />} />
                <Bar dataKey="posIncome" name="POS Income" fill="#3b82f6" radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="repairProfit" name="Repair Profit" fill="#14b8a6" radius={[2, 2, 0, 0]} stackId="a" />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

        {/* Advanced Income by Category (This Month vs Last Month) */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-400" /> Income Breakdown Comparison
            </h3>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> This Month</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-500"></div> Last Month</div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={categoryComparisonData} margin={{ top: 10, right: 30, left: 40, bottom: 0 }} barSize={12}>
                <XAxis type="number" stroke="#475569" fontSize={11} tickFormatter={(val) => `Rs${val}`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={12} fontWeight="bold" axisLine={false} tickLine={false} width={120} />
                <Tooltip cursor={{fill: '#1e293b'}} content={<BarCustomTooltip />} />
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

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Category</th>
                  <th className="pb-3 text-right">This Month</th>
                  <th className="pb-3 text-right">Last Month</th>
                  <th className="pb-3 text-right pr-2">Growth</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {categoryComparisonData.map((cat, idx) => {
                  const growth = cat.lastMonth > 0 ? ((cat.thisMonth - cat.lastMonth) / cat.lastMonth) * 100 : (cat.thisMonth > 0 ? 100 : 0);
                  const isPositive = growth > 0;
                  const isExpanded = expandedCats[cat.name];
                  
                  return (
                    <React.Fragment key={idx}>
                      <tr className="border-b border-white/5 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => toggleCat(cat.name)}>
                        <td className="py-3 pl-2 font-semibold text-slate-200 flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                          {cat.name}
                        </td>
                        <td className="py-3 text-right text-emerald-400 font-bold">Rs {cat.thisMonth.toFixed(0)}</td>
                        <td className="py-3 text-right text-slate-400 font-semibold">Rs {cat.lastMonth.toFixed(0)}</td>
                        <td className="py-3 text-right pr-2">
                          {growth !== 0 ? (
                            <span className={`inline-flex items-center gap-1 font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
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
                           <tr key={`${idx}-${itemIdx}`} className="bg-slate-800/10 border-b border-white/5 text-xs">
                             <td className="py-2 pl-10 font-medium text-slate-400 border-l-2 border-slate-700">{item.name}</td>
                             <td className="py-2 text-right text-emerald-500/80">Rs {item.thisMonth.toFixed(0)}</td>
                             <td className="py-2 text-right text-slate-500">Rs {item.lastMonth.toFixed(0)}</td>
                             <td className="py-2 text-right pr-2">
                                {itemGrowth !== 0 ? (
                                  <span className={isItemPos ? 'text-emerald-500/80' : 'text-red-500/80'}>
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

      {/* ROW 2: Alerts & Pipeline (Moved to Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Customer Balances */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-lg flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-4 flex items-center justify-between">
            Customer Balances
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
            {activeCustomerBalances.length === 0 ? (
               <p className="text-slate-500 text-xs text-center mt-6 flex flex-col items-center gap-2">
                 <ShieldAlert className="w-8 h-8 text-emerald-500/50" />
                 All clear! No active dues or advances.
               </p>
            ) : (
               activeCustomerBalances.map((customer, i) => {
                 const isAdvance = customer.balance < 0;
                 const amt = Math.abs(customer.balance);
                 const ageDays = customer.oldestPending ? Math.floor((today - customer.oldestPending) / (1000 * 60 * 60 * 24)) : 0;
                 
                 return (
                   <div key={i} className={`flex gap-3 items-center p-2.5 rounded-xl transition-all border ${isAdvance ? 'bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-500/10' : customer.riskLevel === 'High' ? 'bg-red-950/30 hover:bg-red-900/40 border-red-500/10' : 'bg-orange-950/20 hover:bg-orange-900/30 border-orange-500/10'}`}>
                     <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-black text-xs shrink-0 ${isAdvance ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : customer.riskLevel === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                       <UserX className="w-4 h-4" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-slate-200 truncate">{customer.name}</p>
                       <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${isAdvance ? 'text-emerald-400/80' : customer.riskLevel === 'High' ? 'text-red-400/80' : 'text-orange-400/80'}`}>
                         <Clock className="w-3 h-3" /> {isAdvance ? 'Advance Payment' : `${ageDays} Days Overdue`}
                       </p>
                     </div>
                     <div className={`text-xs font-black whitespace-nowrap px-2.5 py-1.5 rounded-lg border ${isAdvance ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : customer.riskLevel === 'High' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-orange-400 bg-orange-500/10 border-orange-500/20'}`}>
                       Rs {amt.toFixed(0)}
                     </div>
                   </div>
                 );
               })
            )}
          </div>
        </motion.div>

        {/* Active Pending Orders Pipeline */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-5%" }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-orange-950/20 backdrop-blur-md border border-orange-500/20 rounded-2xl p-5 shadow-lg flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-orange-100 uppercase tracking-widest mb-4 flex items-center justify-between">
            Active Pending Orders
            <Package className="w-4 h-4 text-orange-400" />
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
            {pendingOrders.length === 0 ? (
               <p className="text-slate-500 text-xs text-center mt-6">No pending orders</p>
            ) : (
               pendingOrders.map((order, i) => (
                 <div key={i} className="flex gap-3 items-center p-2.5 rounded-xl bg-orange-950/30 hover:bg-orange-900/40 transition-all border border-orange-500/10">
                   <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center font-black text-xs shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                     <Target className="w-4 h-4" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-slate-200 truncate">{order.customerName}</p>
                     <p className="text-[11px] text-orange-400/80 mt-0.5 flex items-center gap-1">
                       <Clock className="w-3 h-3" /> {order.timestamp ? formatDistanceToNow(parseTimestamp(order.timestamp), { addSuffix: true }) : 'Unknown'}
                     </p>
                   </div>
                   <div className="text-xs font-black text-orange-400 whitespace-nowrap bg-orange-500/10 px-2.5 py-1.5 rounded-lg border border-orange-500/20">
                     Rs {Number(order.totalAmount || 0).toFixed(0)}
                   </div>
                 </div>
               ))
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
