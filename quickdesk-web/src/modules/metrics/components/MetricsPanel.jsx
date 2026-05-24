import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
  RadialBarChart, RadialBar,
} from 'recharts';

const CATEGORY_COLORS = {
  IT: '#3b82f6',
  HR: '#8b5cf6',
  Finance: '#10b981',
  Admin: '#f59e0b',
  Other: '#6b7280',
};

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

const CONFIDENCE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

const cardVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: (i) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
};

function StatCard({ label, value, icon, accent, subtitle, index }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 leading-none">{value}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

function ChartCard({ title, children, className = '', index = 0 }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className={`bg-white rounded-2xl border border-slate-200 p-5 ${className}`}
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function MetricsPanel({ data }) {
  if (!data) return null;

  const {
    totalTickets, openCount, resolvedCount, resolutionRate,
    medianResolutionMinutes, avgResolutionMinutes,
    byCategory, byPriority,
    categoryOverrideRate, priorityOverrideRate,
    aiConfidence, ticketsByDay, topResolvingAgents,
  } = data;

  // Transform data for charts
  const categoryData = Object.entries(byCategory || {}).map(([name, value]) => ({
    name, value, fill: CATEGORY_COLORS[name] || '#6b7280',
  }));

  const priorityData = Object.entries(byPriority || {}).map(([name, value]) => ({
    name, value, fill: PRIORITY_COLORS[name] || '#6b7280',
  }));

  const confidenceDistData = (aiConfidence?.distribution || []).map((d, i) => ({
    ...d, fill: CONFIDENCE_COLORS[i],
  }));

  const avgConfPercent = aiConfidence?.average ? Math.round(aiConfidence.average * 100) : 0;
  const confidenceRadial = [{ name: 'AI Confidence', value: avgConfPercent, fill: avgConfPercent >= 80 ? '#10b981' : avgConfPercent >= 60 ? '#22c55e' : avgConfPercent >= 40 ? '#eab308' : '#ef4444' }];

  const overrideData = [
    { name: 'Category', rate: categoryOverrideRate, fill: '#6366f1' },
    { name: 'Priority', rate: priorityOverrideRate, fill: '#ec4899' },
  ];

  const trendData = (ticketsByDay || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: d.count,
  }));

  return (
    <div className="space-y-6 pb-10">
      {/* ── Row 1: KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          index={0}
          label="Total Tickets"
          value={totalTickets}
          accent="bg-blue-50 text-blue-600"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard
          index={1}
          label="Open"
          value={openCount}
          accent="bg-amber-50 text-amber-600"
          subtitle="Awaiting resolution"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          index={2}
          label="Resolved"
          value={resolvedCount}
          accent="bg-emerald-50 text-emerald-600"
          subtitle={medianResolutionMinutes !== null ? `Median: ${medianResolutionMinutes}m` : undefined}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          index={3}
          label="Resolution Rate"
          value={`${resolutionRate}%`}
          accent="bg-indigo-50 text-indigo-600"
          subtitle={avgResolutionMinutes !== null ? `Avg: ${avgResolutionMinutes}m` : undefined}
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
      </div>

      {/* ── Row 2: Category & Priority Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="📂 Tickets by Category" index={4}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} axisLine={false} tickLine={false} width={65} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Tickets" radius={[0, 6, 6, 0]} barSize={24}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="🔥 Tickets by Priority" index={5}>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs font-medium text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 3: AI Confidence & Override Rates ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="🤖 AI Confidence Score" index={6}>
          <div className="flex items-center gap-6">
            {/* Radial gauge */}
            <div className="w-40 h-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="70%" outerRadius="100%"
                  startAngle={180} endAngle={0}
                  barSize={14}
                  data={confidenceRadial}
                >
                  <RadialBar
                    background={{ fill: '#f1f5f9' }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center -mt-16">
                <span className="text-3xl font-bold text-gray-900">{avgConfPercent}%</span>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Average</p>
              </div>
            </div>

            {/* Stats and distribution */}
            <div className="flex-1 space-y-3">
              <div className="flex gap-4 text-xs">
                <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1 text-center">
                  <p className="text-gray-400 font-medium">Min</p>
                  <p className="text-lg font-bold text-gray-900">{aiConfidence?.min !== null ? `${Math.round((aiConfidence?.min || 0) * 100)}%` : '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1 text-center">
                  <p className="text-gray-400 font-medium">Max</p>
                  <p className="text-lg font-bold text-gray-900">{aiConfidence?.max !== null ? `${Math.round((aiConfidence?.max || 0) * 100)}%` : '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1 text-center">
                  <p className="text-gray-400 font-medium">Scored</p>
                  <p className="text-lg font-bold text-gray-900">{aiConfidence?.total || 0}</p>
                </div>
              </div>

              {/* Mini histogram */}
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Distribution</p>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={confidenceDistData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Tickets" radius={[4, 4, 0, 0]} barSize={20}>
                        {confidenceDistData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="⚡ AI Override Rates" index={7}>
          <div className="space-y-5 pt-2">
            <p className="text-xs text-gray-500">
              How often agents override the AI's classification suggestions.
            </p>
            <div className="space-y-4">
              {overrideData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{item.name} Override</span>
                    <span className="text-sm font-bold" style={{ color: item.fill }}>{item.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.rate}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Time metrics */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3 font-medium">Resolution Time</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-purple-700">{medianResolutionMinutes ?? '—'}</p>
                  <p className="text-[10px] text-purple-400 uppercase tracking-wider font-medium mt-0.5">Median (min)</p>
                </div>
                <div className="bg-sky-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-sky-700">{avgResolutionMinutes ?? '—'}</p>
                  <p className="text-[10px] text-sky-400 uppercase tracking-wider font-medium mt-0.5">Average (min)</p>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Row 4: Ticket Trend ── */}
      <ChartCard title="📈 Ticket Volume — Last 30 Days" className="col-span-full" index={8}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Tickets"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#trendGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* ── Row 5: Top Agents Leaderboard ── */}
      {topResolvingAgents && topResolvingAgents.length > 0 && (
        <ChartCard title="🏆 Top Resolving Agents" index={9}>
          <div className="space-y-3">
            {topResolvingAgents.map((agent, i) => {
              const maxResolved = topResolvingAgents[0]?.resolved || 1;
              const percentage = Math.round((agent.resolved / maxResolved) * 100);
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <motion.div
                  key={agent.agentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-lg w-8 text-center shrink-0">
                    {medals[i] || <span className="text-sm text-gray-400 font-semibold">#{i + 1}</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">{agent.name}</span>
                      <span className="text-xs font-bold text-indigo-600 shrink-0">{agent.resolved} resolved</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ChartCard>
      )}
    </div>
  );
}
