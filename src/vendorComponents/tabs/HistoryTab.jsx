import React from 'react';

const HistoryTab = ({ history }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-800">Job History</h3></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Completed On</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Earning</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {history.map(item => (
                            <tr key={item._id} className="hover:bg-slate-50/50">
                                <td className="px-8 py-5 font-bold text-sm text-slate-900">{item.packageName}</td>
                                <td className="px-8 py-5 text-sm text-slate-600 font-medium">{item.bookingDate}</td>
                                <td className="px-8 py-5 text-right font-bold text-emerald-600 text-sm">₹{item.totalPrice}</td>
                            </tr>
                        ))}
                        {history.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-8 py-12 text-center text-slate-400 text-sm font-medium">No history available yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryTab;
