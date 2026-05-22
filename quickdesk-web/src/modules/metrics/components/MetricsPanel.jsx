

export default function MetricsPanel({ data }) {
  if (!data) return null;

  const metrics = [
    {
      label: 'Total Tickets',
      value: data.total || 0,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Open Tickets',
      value: data.open || 0,
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Resolved',
      value: data.resolved || 0,
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Avg Resolution Time',
      value: data.avgResolutionTime ? `${data.avgResolutionTime}h` : 'N/A',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((item, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${item.bgColor} mr-4`}>
            {item.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
