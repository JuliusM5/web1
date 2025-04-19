import React from 'react';

function TransportTab({ 
  transportType, setTransportType, transportFrom, setTransportFrom,
  transportTo, setTransportTo, transportPrice, setTransportPrice,
  transports, setTransports, addTransport
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-3">Add Transportation</h3>
        
        <div className="space-y-3 bg-white border border-gray-200 p-4 rounded-lg">
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Type</label>
            <select
              value={transportType}
              onChange={e => setTransportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select type</option>
              <option value="Flight">Flight</option>
              <option value="Train">Train</option>
              <option value="Bus">Bus</option>
              <option value="Ferry">Ferry</option>
              <option value="Rental Car">Rental Car</option>
              <option value="Taxi/Rideshare">Taxi/Rideshare</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 text-sm">From</label>
            <input
              type="text"
              value={transportFrom}
              onChange={e => setTransportFrom(e.target.value)}
              placeholder="Departure point"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 text-sm">To</label>
            <input
              type="text"
              value={transportTo}
              onChange={e => setTransportTo(e.target.value)}
              placeholder="Arrival point"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Price ($)</label>
            <input
              type="number"
              value={transportPrice}
              onChange={e => setTransportPrice(e.target.value)}
              placeholder="Cost"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <button
            onClick={addTransport}
            disabled={!transportType || !transportFrom || !transportTo}
            className={`w-full py-2 rounded ${
              !transportType || !transportFrom || !transportTo
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Add Transportation
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-3">Your Transportation</h3>
        
        {transports.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500">No transportation options added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transports.map(t => (
              <div key={t.id} className="bg-blue-50 p-3 rounded-lg relative">
                <button
                  onClick={() => setTransports(transports.filter(item => item.id !== t.id))}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
                
                <div className="font-medium">{t.type}</div>
                <div className="text-sm">From: {t.from}</div>
                <div className="text-sm">To: {t.to}</div>
                {t.price && <div className="text-sm">Price: ${t.price}</div>}
              </div>
            ))}
            
            <div className="mt-4 bg-blue-100 p-3 rounded-lg">
              <p><strong>Total options:</strong> {transports.length}</p>
              <p><strong>Total cost:</strong> $
                {transports.reduce((sum, t) => sum + (Number(t.price) || 0), 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransportTab;
