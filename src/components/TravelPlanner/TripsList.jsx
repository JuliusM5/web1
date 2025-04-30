import React from 'react';
import { calculateDuration } from '../../utils/helpers';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook

function TripsList({ trips, viewTrip, editTrip, deleteTrip, compareTrips }) {
  // Get i18n functionality
  const { t } = useI18n();
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{t('trips.myTrips', 'My Trips')}</h2>
        {trips.length >= 2 && (
          <button
            onClick={compareTrips}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
          >
            <span className="mr-2">⚖️</span> {t('trips.compareTrips', 'Compare Trips')}
          </button>
        )}
      </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white rounded-lg shadow overflow-hidden hover-card">
                <div className="bg-blue-600 text-white p-3">
                  <h3 className="text-xl font-bold">{trip.destination}</h3>
                </div>
                <div className="p-4">
                  <p className="mb-1"><strong>{t('trips.dates', 'Dates')}:</strong> {trip.startDate} {t('trips.to', 'to')} {trip.endDate}</p>
                  <p><strong>{t('trips.duration', 'Duration')}:</strong> {calculateDuration(trip.startDate, trip.endDate)} {t('trips.days', 'days')}</p>
                  {trip.budget && <p><strong>{t('trips.budget', 'Budget')}:</strong> ${trip.budget}</p>}
                  
                  {trip.transports && trip.transports.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p><strong>{t('trips.transportation', 'Transportation')}:</strong> {trip.transports.length} {t('trips.options', 'options')}</p>
                    </div>
                  )}
                  
                  {trip.notes && trip.notes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p><strong>{t('trips.notes', 'Notes')}:</strong> {trip.notes.length} {t('trips.items', 'items')}</p>
                    </div>
                  )}
                  
                  {trip.photos && trip.photos.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p><strong>{t('trips.photos', 'Photos')}:</strong> {trip.photos.length} {t('trips.saved', 'saved')}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => viewTrip(trip)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      {t('trips.viewDetails', 'View Details')}
                    </button>
                    <button
                      onClick={() => editTrip(trip)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                    >
                      {t('trips.editTrip', 'Edit Trip')}
                    </button>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      {t('trips.delete', 'Delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
}

export default TripsList;