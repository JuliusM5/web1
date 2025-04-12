import React from 'react';
import { importBooking } from '../../utils/helpers';

function ExternalTab({ 
  serviceType, setServiceType, serviceUrl, setServiceUrl, 
  serviceNote, setServiceNote, externalServices, setExternalServices,
  addExternalService, getDestinationInfo, destination
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">External Services & Integration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Add External Service</h4>
          
          <div className="space-y-3 bg-white border border-gray-200 p-4 rounded-lg">
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Service Type</label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select type</option>
                <option value="Map">Map/Direction</option>
                <option value="Booking">Booking Confirmation</option>
                <option value="Weather">Weather Service</option>
                <option value="Translation">Translation Tool</option>
                <option value="Advisory">Travel Advisory</option>
                <option value="Other">Other Service</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Service URL or Reference</label>
              <input
                type="text"
                value={serviceUrl}
                onChange={e => setServiceUrl(e.target.value)}
                placeholder="Link or reference number"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Notes</label>
              <textarea
                value={serviceNote}
                onChange={e => setServiceNote(e.target.value)}
                placeholder="Any additional information about this service"
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
              Add Service
            </button>
          </div>
          
          {/* Import from Email feature */}
          <div className="mt-4 bg-white border border-gray-200 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Import Booking from Email</h4>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => importBooking('user@example.com')}
                className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Import Confirmation
              </button>
              <p className="text-xs text-gray-500">
                We'll connect to your email and import your travel bookings
              </p>
            </div>
          </div>
          
          <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
            <h4 className="font-semibold text-yellow-800">Integration Tips:</h4>
            <ul className="mt-1 ml-4 list-disc text-yellow-800">
              <li>Save booking confirmations for easy access during your trip</li>
              <li>Link to custom Google Maps with your saved locations</li>
              <li>Add translation tools specific to your destination</li>
              <li>Save weather forecasts to help with packing</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-3">Your External Services</h4>
          
          {externalServices.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-500">No external services added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {externalServices.map(service => (
                <div key={service.id} className="bg-blue-50 p-3 rounded-lg relative">
                  <button
                    onClick={() => setExternalServices(externalServices.filter(s => s.id !== service.id))}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                  
                  <div className="font-medium flex items-center">
                    {service.type === 'Map' && <span className="mr-2">🗺️</span>}
                    {service.type === 'Booking' && <span className="mr-2">🏨</span>}
                    {service.type === 'Weather' && <span className="mr-2">🌤️</span>}
                    {service.type === 'Translation' && <span className="mr-2">🔤</span>}
                    {service.type === 'Advisory' && <span className="mr-2">⚠️</span>}
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
          
          {/* Travel Advisory Section */}
          {getDestinationInfo() && (
            <div className="mt-6 bg-orange-50 border border-orange-200 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-orange-800 flex items-center">
                <span className="mr-2">⚠️</span> Travel Advisory
              </h4>
              <p className="text-orange-800 mb-3">
                Always check the latest travel advisories before your trip.
              </p>
              <a
                href={getDestinationInfo().advisoryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 text-white py-2 px-4 rounded inline-block hover:bg-orange-700"
              >
                View Advisory for {destination}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExternalTab;
