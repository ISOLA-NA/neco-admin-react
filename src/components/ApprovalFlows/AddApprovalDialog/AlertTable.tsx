import React, { useEffect, useState } from 'react';
import AppServices from '../../../services/api.services';
import { TailSpin } from 'react-loader-spinner';

const sensitivityOptions = [
  { value: 'time', label: 'Time Based' },
  { value: 'change', label: 'Change Based' },
];

const sensitiveItemOptions = [
  { value: 'DateRun', label: 'DateRun' },
  { value: 'DateComplete', label: 'DateComplete' },
];

const sendTypeOptions = [
  { value: 'email', label: 'Email' },
  { value: 'sms',   label: 'SMS' },
  { value: 'push',  label: 'Push Notification' },
];

export default function AlertTable({ rows, onChange }) {
  const [receiverOptions, setReceiverOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AppServices.getAllRoles()
      .then(roles => {
        setReceiverOptions(
          roles.map(r => ({ value: r.ID, label: r.Name || '—' }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <TailSpin height={50} width={50} color="#6366f1" />
      </div>
    );
  }

  return (
    <div className="border rounded shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              {['Sensitivity','Sensitive Item','Step','Day','Send Type','Receiver','Comment'].map(col => (
                <th
                  key={col}
                  className="px-2 py-1 text-left text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      <div className="max-h-60 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="whitespace-nowrap">
                <td className="px-2 py-1">
                  <select
                    value={row.sensitivity}
                    onChange={e => onChange(idx, 'sensitivity', e.target.value)}
                    className="w-full border rounded px-1 py-0.5 text-sm"
                  >
                    <option value="">—</option>
                    {sensitivityOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <select
                    value={row.sensitiveItem}
                    onChange={e => onChange(idx, 'sensitiveItem', e.target.value)}
                    className="w-full border rounded px-1 py-0.5 text-sm"
                  >
                    <option value="">—</option>
                    {sensitiveItemOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    value={row.step}
                    onChange={e => onChange(idx, 'step', e.target.value)}
                    className="w-full border rounded px-1 py-0.5 text-sm"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    value={row.day}
                    onChange={e => onChange(idx, 'day', e.target.value)}
                    className="w-full border rounded px-1 py-0.5 text-sm"
                  />
                </td>
                <td className="px-2 py-1">
                  <select
                    value={row.sendType}
                    onChange={e => onChange(idx, 'sendType', e.target.value)}
                    className="w-full border rounded px-1 py-0.5 text-sm"
                  >
                    <option value="">—</option>
                    {sendTypeOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <select
                    value={row.receiver}
                    onChange={e => onChange(idx, 'receiver', e.target.value)}
                    className="w-full border rounded px-1 py-0.5 text-sm"
                  >
                    <option value="">—</option>
                    {receiverOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    value={row.comment}
                    onChange={e => onChange(idx, 'comment', e.target.value)}
                    className="w-full border rounded px-1 py-0.5 text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
