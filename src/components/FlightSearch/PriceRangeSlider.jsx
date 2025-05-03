import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';

function PriceRangeSlider({ min, max, value, onChange }) {
  const { settings } = useSettings();
  const [range, setRange] = useState(value || [min, max]);
  const [isDragging, setIsDragging] = useState(null); // 'min', 'max', or null
  const sliderRef = useRef(null);
  
  // Currency symbol based on settings
  const getCurrencySymbol = () => {
    const currencyMap = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CNY': '¥',
      'INR': '₹'
    };
    
    const currency = settings?.preferences?.defaultCurrency || 'USD';
    return currencyMap[currency] || '$';
  };
  
  // Update local state when prop changes
  useEffect(() => {
    if (value && (value[0] !== range[0] || value[1] !== range[1])) {
      setRange(value);
    }
  }, [value]);
  
  // Handle mouse up event to stop dragging
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(null);
        
        // Notify parent of change only when drag ends
        if (onChange) {
          onChange(range);
        }
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, range, onChange]);
  
  // Handle mouse move event for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !sliderRef.current) return;
      
      const slider = sliderRef.current;
      const rect = slider.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      
      // Calculate position percentage
      const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newValue = Math.round(min + position * (max - min));
      
      // Update range based on which handle is being dragged
      setRange(prevRange => {
        if (isDragging === 'min') {
          return [Math.min(newValue, prevRange[1]), prevRange[1]];
        } else if (isDragging === 'max') {
          return [prevRange[0], Math.max(newValue, prevRange[0])];
        }
        return prevRange;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleMouseMove);
    };
  }, [isDragging, min, max]);
  
  // Calculate positions for the handles
  const getMinHandlePosition = () => {
    return ((range[0] - min) / (max - min)) * 100;
  };
  
  const getMaxHandlePosition = () => {
    return ((range[1] - min) / (max - min)) * 100;
  };
  
  // Start dragging a handle
  const startDragging = (handle, e) => {
    e.preventDefault();
    setIsDragging(handle);
  };
  
  return (
    <div className="mt-4">
      <div className="flex justify-between mb-2 text-sm">
        <span>{getCurrencySymbol()}{range[0]}</span>
        <span>{getCurrencySymbol()}{range[1]}</span>
      </div>
      
      <div 
        ref={sliderRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
      >
        {/* Range Track */}
        <div 
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${getMinHandlePosition()}%`,
            right: `${100 - getMaxHandlePosition()}%`
          }}
        ></div>
        
        {/* Min Handle */}
        <div 
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full top-1/2 transform -translate-y-1/2 cursor-grab hover:scale-110 transition-transform"
          style={{ left: `calc(${getMinHandlePosition()}% - 8px)` }}
          onMouseDown={(e) => startDragging('min', e)}
          onTouchStart={(e) => startDragging('min', e)}
        ></div>
        
        {/* Max Handle */}
        <div 
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full top-1/2 transform -translate-y-1/2 cursor-grab hover:scale-110 transition-transform"
          style={{ left: `calc(${getMaxHandlePosition()}% - 8px)` }}
          onMouseDown={(e) => startDragging('max', e)}
          onTouchStart={(e) => startDragging('max', e)}
        ></div>
      </div>
      
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{getCurrencySymbol()}{min}</span>
        <span>{getCurrencySymbol()}{max}</span>
      </div>
    </div>
  );
}

export default PriceRangeSlider;