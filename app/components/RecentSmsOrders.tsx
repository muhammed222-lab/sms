import React from "react";

const RecentSmsOrders = () => {
  const data: any[] = []; // Replace with your data array

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm mt-5">
      <h2 className="text-xl font-bold mb-4">Recent SMS Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse border border-gray-300">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border border-gray-300 p-3">Order ID</th>
              <th className="border border-gray-300 p-3">Number</th>
              <th className="border border-gray-300 p-3">Code</th>
              <th className="border border-gray-300 p-3">Country</th>
              <th className="border border-gray-300 p-3">Service</th>
              <th className="border border-gray-300 p-3">Provider</th>
              <th className="border border-gray-300 p-3">Amount</th>
              <th className="border border-gray-300 p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No results.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">{item.orderId}</td>
                  <td className="border border-gray-300 p-3">{item.number}</td>
                  <td className="border border-gray-300 p-3">{item.code}</td>
                  <td className="border border-gray-300 p-3">{item.country}</td>
                  <td className="border border-gray-300 p-3">{item.service}</td>
                  <td className="border border-gray-300 p-3">
                    {item.provider}
                  </td>
                  <td className="border border-gray-300 p-3">{item.amount}</td>
                  <td className="border border-gray-300 p-3">{item.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>0 of 0 row(s) selected.</span>
        <div className="space-x-2">
          <button className="px-4 py-2 rounded border border-gray-300 text-gray-500 bg-white hover:bg-gray-100">
            Previous
          </button>
          <button className="px-4 py-2 rounded border border-gray-300 text-gray-500 bg-white hover:bg-gray-100">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentSmsOrders;
