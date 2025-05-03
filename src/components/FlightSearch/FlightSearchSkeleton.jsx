import React from 'react';

function FlightSearchSkeleton() {
  // Create an array of 5 skeleton items
  const skeletonItems = Array(5).fill(0);
  
  return (
    <div className="space-y-4">
      {/* Best Options Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-200 animate-pulse">
          <div className="flex justify-between items-start">
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-16 bg-gray-300 rounded mb-1"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-200 animate-pulse">
          <div className="flex justify-between items-start">
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-16 bg-gray-300 rounded mb-1"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Flight Cards Skeleton */}
      {skeletonItems.map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow animate-pulse">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-300 rounded mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-6 w-16 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            <div className="flex justify-between mb-2">
              <div className="text-center">
                <div className="h-6 w-12 bg-gray-300 rounded mb-1 mx-auto"></div>
                <div className="h-3 w-16 bg-gray-200 rounded mb-1 mx-auto"></div>
                <div className="h-4 w-8 bg-gray-200 rounded mx-auto"></div>
              </div>
              
              <div className="flex flex-col items-center justify-center flex-1 px-4">
                <div className="h-3 w-16 bg-gray-200 rounded mb-1 mx-auto"></div>
                <div className="relative w-full">
                  <div className="absolute w-full h-0.5 bg-gray-200 top-1/2 transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <div className="h-3 w-20 bg-gray-200 rounded mt-1 mx-auto"></div>
              </div>
              
              <div className="text-center">
                <div className="h-6 w-12 bg-gray-300 rounded mb-1 mx-auto"></div>
                <div className="h-3 w-16 bg-gray-200 rounded mb-1 mx-auto"></div>
                <div className="h-4 w-8 bg-gray-200 rounded mx-auto"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              
              <div className="flex space-x-2">
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FlightSearchSkeleton;