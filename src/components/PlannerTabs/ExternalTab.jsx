import React from 'react';
import { importBooking } from '../../utils/helpers';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook

function ExternalTab({ 
  serviceType, setServiceType, serviceUrl, setServiceUrl, 
  serviceNote, setServiceNote, externalServices, setExternalServices,
  addExternalService, destination
}) {
  // Get i18n functionality
  const { t } = useI18n();
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{t('external.title', 'External Services & Integration')}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">{t('external.addService', 'Add External Service')}</h4>
          
          <div className="space-y-3 bg-white border border-gray-200 p-4 rounded-lg">
            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t('external.serviceType', 'Service Type')}</label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">{t('external.selectType', 'Select type')}</option>
                <option value="Map">{t('external.map', 'Map/Direction')}</option>
                <option value="Booking">{t('external.booking', 'Booking Confirmation')}</option>
                <option value="Translation">{t('external.translation', 'Translation Tool')}</option>
                <option value="Other">{t('external.other', 'Other Service')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t('external.serviceUrl', 'Service URL or Reference')}</label>
              <input
                type="text"
                value={serviceUrl}
                onChange={e => setServiceUrl(e.target.value)}
                placeholder={t('external.urlPlaceholder', 'Link or reference number')}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">{t('external.notes', 'Notes')}</label>
              <textarea
                value={serviceNote}
                onChange={e => setServiceNote(e.target.value)}
                placeholder={t('external.notesPlaceholder', 'Any additional information about this service')}
                className="w-full p-2 border border-gray-300 rounded h-20"
              />
            </div>
            
            <button
              onClick={addExternalService}
              disabled={!serviceType || !serviceUrl}
              className={`w-full py-2 rounded ${
                !serviceType || !serviceUrl
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {t('external.addButton', 'Add Service')}
            </button>
          </div>
          
          {/* Import from Email feature */}
          <div className="mt-4 bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{t('external.importFromEmail', 'Import Booking from Email')}</h4>
            <div className="space-y-3">
              <input
                type="email"
                placeholder={t('external.enterEmail', 'Enter your email address')}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => importBooking('user@example.com')}
                className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {t('external.importButton', 'Import Confirmation')}
              </button>
              <p className="text-xs text-gray-500">
                {t('external.importHelp', "We'll connect to your email and import your travel bookings")}
              </p>
            </div>
          </div>
          
          <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
            <h4 className="font-semibold text-yellow-800">{t('external.integrationTips', 'Integration Tips')}:</h4>
            <ul className="mt-1 ml-4 list-disc text-yellow-800">
              <li>{t('external.tip1', 'Save booking confirmations for easy access during your trip')}</li>
              <li>{t('external.tip2', 'Link to custom Google Maps with your saved locations')}</li>
              <li>{t('external.tip3', 'Add translation tools specific to your destination')}</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">{t('external.yourServices', 'Your External Services')}</h4>
          
          {externalServices.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500">{t('external.noServices', 'No external services added yet.')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {externalServices.map(service => (
                <div key={service.id} className="bg-blue-50 p-3 rounded-lg relative">
                  <button
                    onClick={() => setExternalServices(externalServices.filter(s => s.id !== service.id))}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    aria-label={t('external.remove', 'Remove service')}
                  >
                    ✕
                  </button>
                  
                  <div className="font-medium flex items-center">
                    {service.type === 'Map' && <span className="mr-2">🗺️</span>}
                    {service.type === 'Booking' && <span className="mr-2">🏨</span>}
                    {service.type === 'Translation' && <span className="mr-2">🔤</span>}
                    {service.type === 'Other' && <span className="mr-2">🔗</span>}
                    {service.type}
                  </div>
                  
                  <div className="text-sm mt-1">
                    <a 
                      href={service.url.startsWith('http') ? service.url : `https://${service.url}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-words"
                    >
                      {service.url}
                    </a>
                  </div>
                  
                  {service.note && (
                    <div className="text-sm mt-1 text-gray-600">
                      {service.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExternalTab;