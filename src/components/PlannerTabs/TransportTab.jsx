import React from 'react';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook
import { useAppSettings } from '../../utils/useAppSettings'; // Import the app settings hook

function TransportTab({ 
  transportType, setTransportType, transportFrom, setTransportFrom,
  transportTo, setTransportTo, transportPrice, setTransportPrice,
  transports, setTransports, addTransport
}) {
  // Get i18n functionality
  const { t } = useI18n();
  // Get currency formatter
  const { currency } = useAppSettings();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-3">{t('transport.addTransportation')}</h3>
        
        <div className="space-y-3 bg-white border border-gray-200 p-4 rounded-lg">
          <div>
            <label className="block text-gray-700 mb-1 text-sm">{t('transport.type')}</label>
            <select
              value={transportType}
              onChange={e => setTransportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">{t('transport.selectType')}</option>
              <option value="Flight">{t('transport.types.Flight')}</option>
              <option value="Train">{t('transport.types.Train')}</option>
              <option value="Bus">{t('transport.types.Bus')}</option>
              <option value="Ferry">{t('transport.types.Ferry')}</option>
              <option value="Rental Car">{t('transport.types.Rental Car')}</option>
              <option value="Taxi/Rideshare">{t('transport.types.Taxi/Rideshare')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 text-sm">{t('transport.from')}</label>
            <input
              type="text"
              value={transportFrom}
              onChange={e => setTransportFrom(e.target.value)}
              placeholder={t('transport.departurePoint')}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 text-sm">{t('transport.to')}</label>
            <input
              type="text"
              value={transportTo}
              onChange={e => setTransportTo(e.target.value)}
              placeholder={t('transport.arrivalPoint')}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 text-sm">{t('transport.price')}</label>
            <input
              type="number"
              value={transportPrice}
              onChange={e => setTransportPrice(e.target.value)}
              placeholder={t('transport.cost')}
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
            {t('transport.addTransportation')}
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-3">{t('transport.yourTransportation')}</h3>
        
        {transports.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500">{t('transport.noOptions')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transports.map(transport => (
              <div key={transport.id} className="bg-blue-50 p-3 rounded-lg relative">
                <button
                  onClick={() => setTransports(transports.filter(item => item.id !== transport.id))}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
                
                <div className="font-medium">{t('transport.types.' + transport.type)}</div>
                <div className="text-sm">{t('transport.from')}: {transport.from}</div>
                <div className="text-sm">{t('transport.to')}: {transport.to}</div>
                {transport.price && <div className="text-sm">{t('transport.price')}: {currency(transport.price)}</div>}
              </div>
            ))}
            
            <div className="mt-4 bg-blue-100 p-3 rounded-lg">
              <p><strong>{t('transport.totalOptions')}:</strong> {transports.length}</p>
              <p><strong>{t('transport.totalCost')}:</strong> {
                currency(transports.reduce((sum, t) => sum + (Number(t.price) || 0), 0))
              }</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransportTab;