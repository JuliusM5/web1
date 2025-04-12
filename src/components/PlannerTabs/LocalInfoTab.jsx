import React from 'react';
import WeatherForecast from '../Weather/WeatherForecast';

function LocalInfoTab({ getDestinationInfo, setTab, destination }) {
  const destinationInfo = getDestinationInfo();
  
  return (
    <div>
      {destinationInfo ? (
        <div className="space-y-4">
          {/* Weather Forecast */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Weather Forecast</h3>
            <WeatherForecast destination={destination} />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Emergency Contact</h3>
            <p>{destinationInfo.emergency}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Currency</h3>
            <p>{destinationInfo.currency}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Language & Phrases</h3>
            <p><strong>Language:</strong> {destinationInfo.language}</p>
            <p className="mt-1">{destinationInfo.phrases}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Local Tips</h3>
            <ul className="list-disc pl-5 space-y-1">
              {destinationInfo.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          
          {destinationInfo && (
            <div className="mt-4 border-t border-blue-200 pt-4">
              <h4 className="font-semibold">External Resources</h4>
              <div className="space-y-2 mt-2">
                <a 
                  href={destinationInfo.mapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="mr-2">📍</span> View on Maps
                </a>
                <a 
                  href={destinationInfo.advisoryLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="mr-2">🔔</span> Travel Advisory
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Please select a supported destination first.</p>
          <p className="text-sm text-gray-500 mt-1">Currently supported: Paris, Tokyo, New York City</p>
          <button
            onClick={() => setTab('basic')}
            className="mt-3 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Back to Basic Info
          </button>
        </div>
      )}
    </div>
  );
}

export default LocalInfoTab;