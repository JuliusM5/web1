import React from 'react';

function BudgetChart({ budgetData }) {
  // Format the data for the chart
  const chartData = Object.entries(budgetData)
    .filter(([_, value]) => value > 0)
    .map(([category, value]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      value,
      percentage: 0, // We'll calculate this
      color: getCategoryColor(category)
    }));
  
  // Calculate total and percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach(item => {
    item.percentage = Math.round((item.value / total) * 100);
  });
  
  // Sort by value (largest first)
  chartData.sort((a, b) => b.value - a.value);

  // Get color for category
  function getCategoryColor(category) {
    switch (category) {
      case 'accommodation':
        return '#3b82f6'; // blue-500
      case 'food':
        return '#f59e0b'; // amber-500
      case 'transportation':
        return '#10b981'; // emerald-500
      case 'activities':
        return '#8b5cf6'; // violet-500
      case 'other':
        return '#6b7280'; // gray-500
      default:
        return '#d1d5db'; // gray-300
    }
  }

  return (
    <div>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-center">
            No budget data to display.<br />
            <span className="text-sm">Add budget items to see the chart.</span>
          </p>
        </div>
      ) : (
        <div>
          {/* Pie Chart Visualization */}
          <div className="relative h-48 w-48 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Create pie slices */}
              {renderPieSlices(chartData)}
              
              {/* Center circle (empty space) */}
              <circle cx="50" cy="50" r="25" fill="white" />
              
              {/* Total amount in center */}
              <text x="50" y="46" textAnchor="middle" fontSize="10" fontWeight="bold">
                ${total}
              </text>
              <text x="50" y="58" textAnchor="middle" fontSize="6">
                Total Budget
              </text>
            </svg>
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-sm mr-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.category}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">${item.value}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to render pie slices
function renderPieSlices(data) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let startAngle = 0;
  
  return data.map((item, index) => {
    // Calculate angles for the slice
    const percentage = item.value / total;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;
    
    // Convert angles to radians and calculate coordinates
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    // Create SVG arc path
    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ');
    
    // Update the start angle for the next slice
    startAngle = endAngle;
    
    return (
      <path 
        key={index}
        d={pathData} 
        fill={item.color}
        stroke="white"
        strokeWidth="1"
      />
    );
  });
}

export default BudgetChart;