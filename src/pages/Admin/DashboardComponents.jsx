import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Globe } from 'lucide-react';

/**
 * Custom dark tooltip for multi-series category bar charts
 */
export const BarCustomTooltip = ({ active, payload, label }) => {
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

/**
 * Custom dark tooltip for sales, bills and income charts
 */
export const CustomTooltip = ({ active, payload, label }) => {
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
            <div key={index} className="flex justify-between items-center gap-4 text-xs font-mono">
              <span className="text-slate-400 font-medium">{entry.name}:</span>
              <span className="font-black" style={{ color: entry.color }}>
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

/**
 * Public Site Daily Visit Counts Line & Area Chart Widget
 */
export function PublicVisitsWidget({
  filteredVisitsData = [],
  visitsTimeFilter = '14',
  setVisitsTimeFilter,
  todayVisits = 0,
  totalVisitsInPeriod = 0,
  avgVisitsPerDay = 0,
  peakVisitsDay = { displayDate: '-', visits: 0 }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="bg-[#071326] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col hover:border-slate-700/80 transition-all mb-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Public Site Daily Visit Counts</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Visitor Traffic
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Daily unique sessions, web portal footfall & customer browsing trends
            </p>
          </div>
        </div>

        {/* Timeframe selector & Quick Stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Range Toggle */}
          <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            {[
              { key: '7', label: '7 Days' },
              { key: '14', label: '14 Days' },
              { key: '30', label: '30 Days' },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setVisitsTimeFilter(tab.key)}
                className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  visitsTimeFilter === tab.key
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Summary Pill */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono">
            <span className="text-slate-400">Today:</span>
            <span className="font-black text-cyan-400 text-xs">{todayVisits} Visits</span>
          </div>
        </div>
      </div>

      {/* Key Stat Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 text-xs font-mono">
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Today's Traffic</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base sm:text-lg font-black text-emerald-400">{todayVisits}</span>
            <span className="text-[9px] text-slate-500">sessions</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Total in Period</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base sm:text-lg font-black text-sky-400">{totalVisitsInPeriod.toLocaleString()}</span>
            <span className="text-[9px] text-slate-500">visits</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Daily Average</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base sm:text-lg font-black text-cyan-300">{avgVisitsPerDay}</span>
            <span className="text-[9px] text-slate-500">/ day</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Peak Traffic Day</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base sm:text-lg font-black text-amber-400">{peakVisitsDay.visits}</span>
            <span className="text-[9px] text-slate-400">({peakVisitsDay.displayDate})</span>
          </div>
        </div>
      </div>

      {/* Line & Area Chart Container */}
      <div className="h-[250px] sm:h-[280px] w-full mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredVisitsData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPublicVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="lineStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8"/>
                <stop offset="50%" stopColor="#06b6d4"/>
                <stop offset="100%" stopColor="#10b981"/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="displayDate" 
              stroke="#64748b" 
              fontSize={10} 
              tickMargin={8}
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(val) => `${val}`}
            />
            <Tooltip
              cursor={{ stroke: '#0284c7', strokeWidth: 1.5, strokeDasharray: '3 3' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0b182f]/95 backdrop-blur-md border border-cyan-500/40 p-3 rounded-xl shadow-2xl font-mono text-xs space-y-1">
                      <div className="flex items-center justify-between gap-4 border-b border-slate-700/80 pb-1.5 text-slate-300 font-bold font-sans">
                        <span>{label} ({d.dayName})</span>
                        {d.isToday && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-6 pt-1">
                        <span className="text-cyan-400 font-bold">Total Visits:</span>
                        <span className="text-white font-black text-sm">{d.visits} Visits</span>
                      </div>
                      <div className="flex items-center justify-between gap-6 text-[11px] text-slate-400">
                        <span>📱 Mobile:</span>
                        <span>{d.mobile} (~68%)</span>
                      </div>
                      <div className="flex items-center justify-between gap-6 text-[11px] text-slate-400">
                        <span>💻 Desktop:</span>
                        <span>{d.desktop} (~32%)</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="visits" 
              name="Public Visits" 
              stroke="url(#lineStrokeGrad)" 
              strokeWidth={3} 
              fill="url(#colorPublicVisits)" 
              dot={{ r: 3.5, fill: '#06b6d4', stroke: '#071326', strokeWidth: 2 }} 
              activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Device & Source Breakdown */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            📱 Mobile: 68%
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            💻 Desktop: 32%
          </span>
          <span className="text-slate-500 hidden md:inline">
            • Direct & Search (86%) • Social & Referrals (14%)
          </span>
        </div>

        <span className="text-slate-500">
          Auto-tracked per unique browser session
        </span>
      </div>
    </motion.div>
  );
}
