import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceDot, Label, LabelList } from 'recharts';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatDistanceToNow } from 'date-fns';
import { 
  TrendingUp, Activity, Wrench, ShoppingBag, 
  PlusCircle, Clock, CheckCircle2, AlertCircle, ShoppingCart, Users, RefreshCw
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const parseTimestamp = (ts) => {
  if (!ts) return new Date();
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

export default function Dashboard({ salesHistory, setActiveTab, posCategories = [], totalPendingDues = 0, fetchSales, fetchCustomerDues }) {
  const [repairs, setRepairs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(() => localStorage.getItem('dashboardLastRefreshed') || null);

  useEffect(() => {
    const savedRepairs = localStorage.getItem('dashboardRepairs');
    const savedExpenses = localStorage.getItem('dashboardExpenses');
    
    if (savedRepairs) setRepairs(JSON.parse(savedRepairs));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    
    if (!savedRepairs || !savedExpenses) {
      handleManualRefresh();
    } else {
      setLoading(false);
    }
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
  const todaySales = salesHistory.filter(s => s.timestamp && parseTimestamp(s.timestamp).toDateString() === today.toDateString());
  const monthSales = salesHistory.filter(s => s.timestamp && parseTimestamp(s.timestamp).getMonth() === today.getMonth() && parseTimestamp(s.timestamp).getFullYear() === today.getFullYear());
  const monthExpensesList = expenses.filter(e => e.timestamp && parseTimestamp(e.timestamp).getMonth() === today.getMonth() && parseTimestamp(e.timestamp).getFullYear() === today.getFullYear());
  
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const todayIncomeTotal = todaySales.reduce((sum, s) => sum + getSaleIncome(s), 0);

  const monthSalesTotal = monthSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const monthIncomeTotal = monthSales.reduce((sum, s) => sum + getSaleIncome(s), 0);
  
  const totalSalesTotal = salesHistory.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const totalIncomeTotal = salesHistory.reduce((sum, s) => sum + getSaleIncome(s), 0);

  const monthExpensesTotal = monthExpensesList.reduce((sum, e) => sum + Number(e.amount), 0);
  const monthNetProfit = monthIncomeTotal - monthExpensesTotal; // If still needed for charts

  const totalOrders = salesHistory.length;

  // -- REPAIR METRICS --
  const activeRepairs = repairs.filter(r => r.status === 'Pending' || r.status === 'In Progress');
  const readyDeliveries = repairs.filter(r => r.status === 'Ready');

  // -- CHART: This Month Sales vs Income --
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  
  const thisMonthDays = [...Array(currentDay)].map((_, i) => {
    const d = new Date(currentYear, currentMonth, i + 1);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  });

  const salesIncomeMap = {};
  thisMonthDays.forEach(d => salesIncomeMap[d] = { sales: 0, income: 0 });

  salesHistory.forEach(sale => {
    if (sale.timestamp) {
      const d = parseTimestamp(sale.timestamp);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        if (salesIncomeMap[dateStr] !== undefined) {
          salesIncomeMap[dateStr].sales += Number(sale.amount || 0);
          salesIncomeMap[dateStr].income += getSaleIncome(sale);
        }
      }
    }
  });

  const salesIncomeChartData = thisMonthDays.map(date => ({
    date: date.split(' ')[1], // show day number on x-axis
    fullDate: date,
    sales: salesIncomeMap[date].sales,
    income: salesIncomeMap[date].income
  }));

  // -- CHART: Today's Revenue by Hour --
  const todayHoursMap = {};
  for (let i = 8; i <= 20; i += 2) {
    const period = i >= 12 ? 'PM' : 'AM';
    const hour = i > 12 ? i - 12 : i;
    todayHoursMap[`${hour}:00 ${period}`] = 0;
  }
  todayHoursMap['Later'] = 0;

  todaySales.forEach(sale => {
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

      if (todayHoursMap[timeKey] !== undefined) {
        todayHoursMap[timeKey] += Number(sale.amount);
      }
    }
  });

  const todayHoursData = Object.keys(todayHoursMap).map(time => ({
    time,
    revenue: todayHoursMap[time]
  })).filter(d => d.time !== 'Later' || d.revenue > 0);

  // -- Prepare Category Mapping --
  const itemToCategory = {};
  posCategories.forEach(cat => {
    (cat.items || []).forEach(item => {
      itemToCategory[item.name] = cat.category;
    });
  });

  // -- CHART: Income by Category (This Month) --
  const incomeCategoryMap = {};
  salesHistory.forEach(sale => {
    if (sale.timestamp) {
      const d = parseTimestamp(sale.timestamp);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (sale.isRepair) {
          if (!incomeCategoryMap['PC Repairs']) incomeCategoryMap['PC Repairs'] = 0;
          incomeCategoryMap['PC Repairs'] += (Number(sale.amount || 0) - Number(sale.cost || 0));
        } else {
          (sale.cartItems || []).forEach(item => {
            const catName = itemToCategory[item.name] || 'Other';
            if (!incomeCategoryMap[catName]) incomeCategoryMap[catName] = 0;
            const itemIncome = (Number(item.price || 0) - Number(item.cost || 0)) * Number(item.qty || 1);
            incomeCategoryMap[catName] += itemIncome;
          });
        }
      }
    }
  });
  const incomeByCategoryData = Object.keys(incomeCategoryMap)
    .filter(name => incomeCategoryMap[name] > 0)
    .map(name => ({ name, value: incomeCategoryMap[name] }))
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
  const maxTodayData = todayHoursData.length > 0 ? todayHoursData.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current) : null;

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
              <span className="font-black text-[11px]" style={{ color: entry.color }}>Rs {entry.value?.toFixed(2) || '0.00'}</span>
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
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-400 text-sm mt-1">Here's what's happening at your store today.</p>
        </div>
        <div className="flex items-center">
          <button 
            onClick={handleManualRefresh}
            className="flex items-center bg-slate-900/50 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-slate-900/80 transition-all rounded-full px-5 py-2 shadow-lg group"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                UPDATED: {lastRefreshed ? formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true }).toUpperCase() : 'JUST NOW'}
              </span>
            </div>
            <div className="w-px h-4 bg-white/10 mx-4"></div>
            <div className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="text-[11px] font-black tracking-widest">REFRESH</span>
            </div>
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Today */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-900/80 transition-all shadow-xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-slate-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Today's Metrics
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Sales (Revenue)</p>
              <h3 className="text-xl font-black text-slate-100">{todaySalesTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Income (Profit)</p>
              <h3 className="text-xl font-black text-emerald-400">{todayIncomeTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            </div>
          </div>
        </div>

        {/* Card 2: This Month */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-900/80 transition-all shadow-xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-slate-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" /> This Month
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Sales (Revenue)</p>
              <h3 className="text-xl font-black text-slate-100">{monthSalesTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Income (Profit)</p>
              <h3 className="text-xl font-black text-blue-400">{monthIncomeTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            </div>
          </div>
        </div>

        {/* Card 3: Total */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-900/80 transition-all shadow-xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-slate-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-400" /> Total All-Time
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Sales</p>
              <h3 className="text-xl font-black text-slate-100">{totalSalesTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            </div>
            <div className="border-l border-white/10 pl-4">
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">Total Income</p>
              <h3 className="text-xl font-black text-purple-400">{totalIncomeTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            </div>
          </div>
        </div>
      </div>

        {/* Card 4: Pending Dues */}
        <div 
          onClick={() => setActiveTab && setActiveTab('customers')}
          className="w-full lg:w-72 shrink-0 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:bg-slate-900/80 transition-all shadow-xl cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-slate-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Users className="w-5 h-5 text-red-400" /> Customer Accounts
            </h3>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] text-red-400/80 font-bold uppercase tracking-wider mb-1">Total Pending</p>
            <h3 className="text-xl font-black text-red-400">{totalPendingDues.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
          </div>
        </div>
      </div>

      {/* RECENT SALES & WIDGET: SALES VS INCOME */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Sales */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col h-[380px]">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4">Recent Sales</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
            {allActivities.filter(a => a.type === 'SALE').length === 0 ? (
              <p className="text-slate-500 text-sm text-center mt-10">No recent sales</p>
            ) : (
              allActivities.filter(a => a.type === 'SALE').slice(0, 8).map((act, i) => (
                <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-white/5">
                  <div className="p-2 rounded-lg shrink-0 bg-emerald-500/10 text-emerald-400">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{act.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {act.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.items} items
                    </p>
                  </div>
                  <div className="text-xs font-black text-emerald-400 whitespace-nowrap mt-1">
                    Rs {act.amount?.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* WIDGET: SALES VS INCOME (THIS MONTH) */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col h-[380px]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Sales vs Income (This Month)</h3>
            <div className="flex gap-4 md:gap-6 bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sales</p>
                <p className="text-sm font-black text-slate-200">Rs {monthSalesTotal.toFixed(2)}</p>
              </div>
              <div className="text-right border-l border-white/10 pl-4 md:pl-6">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Total Income</p>
                <p className="text-sm font-black text-emerald-400">Rs {monthIncomeTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesIncomeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={(val) => `Rs${val}`} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Main Chart */}
        <div className="flex flex-col gap-6">

          <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col flex-1">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-2">Today's Revenue (By Time)</h3>
            <div className="flex-1 w-full min-h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={todayHoursData} margin={{ top: 35, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickFormatter={(val) => `Rs${val}`} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorToday)" />
                  {maxTodayData && maxTodayData.revenue > 0 && (
                    <ReferenceDot x={maxTodayData.time} y={maxTodayData.revenue} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={2}>
                      <Label value={`High: Rs ${maxTodayData.revenue.toFixed(0)}`} position="top" fill="#e2e8f0" fontSize={11} fontWeight="bold" offset={10} />
                    </ReferenceDot>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top 5 Customers */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col h-full min-h-[320px]">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-4 flex items-center justify-between">
            Top 5 Customers (This Month)
            <Users className="w-4 h-4 text-indigo-400" />
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
            {top5Customers.length === 0 ? (
               <p className="text-slate-500 text-xs text-center mt-6">No customer data yet</p>
            ) : (
               top5Customers.map((cust, i) => (
                 <div key={i} className="flex gap-3 items-center p-2.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 transition-all border border-white/5">
                   <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-black text-xs shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                     {i + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-slate-200 truncate">{cust.name}</p>
                     <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                       <ShoppingCart className="w-3 h-3" /> {cust.orderCount} Orders
                     </p>
                   </div>
                   <div className="text-xs font-black text-emerald-400 whitespace-nowrap bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                     Rs {cust.totalSpend.toFixed(0)}
                   </div>
                 </div>
               ))
            )}
          </div>
        </div>


        {/* Secondary Charts */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-6">Income by Category (This Month)</h3>
          <div className="flex-1 w-full border border-white/5 rounded-xl bg-slate-900/20 p-2 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeByCategoryData} layout="vertical" margin={{ top: 0, right: 60, left: -20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#1e293b'}} content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="value" position="right" fill="#e2e8f0" fontSize={11} formatter={(val) => `Rs ${val.toFixed(0)}`} />
                  {incomeByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>



        {/* Combined Monthly Financials Chart */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Monthly Overview ({currentYear})</h3>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500"></div> POS Income</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-teal-500"></div> Repair Profit</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500"></div> Expenses</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={combinedMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={(val) => `Rs${val}`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#1e293b'}} content={<CustomTooltip />} />
                <Bar dataKey="posIncome" name="POS Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="repairProfit" name="Repair Profit" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Comparison (This vs Last Month) */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-lg lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Daily Comparison (This vs Last Month)</h3>
            <div className="flex flex-wrap gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400"></div> This Month Income</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-emerald-400 border-dashed"></div> Last Month Income</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-400"></div> This Month Sales</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full border-2 border-blue-400 border-dashed"></div> Last Month Sales</div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#475569" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} tickFormatter={(val) => `Day ${val}`} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={(val) => `Rs${val}`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4'}} content={<CustomTooltip />} />
                <Line type="monotone" dataKey="thisMonthIncome" name="This Month Income" stroke="#34d399" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="lastMonthIncome" name="Last Month Income" stroke="#34d399" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="thisMonthSales" name="This Month Sales" stroke="#60a5fa" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="lastMonthSales" name="Last Month Sales" stroke="#60a5fa" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
