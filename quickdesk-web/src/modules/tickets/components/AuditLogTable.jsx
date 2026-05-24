

export default function AuditLogTable({ logs }) {
  if (!logs || logs.length === 0) {
    return <div className="text-sm text-gray-500 py-4 text-center border border-dashed border-slate-200 rounded-lg">No history available</div>;
  }

  return (
    <div className="overflow-hidden border border-slate-200 ">
      <table className="min-w-full divide-y divide-gray-300 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Time</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {logs.map((log, idx) => (
            <tr key={idx}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">
                {log.user || 'System'}
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {log.action}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
