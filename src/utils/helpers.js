import { generateTripPdf as generateTripPDF } from './enhancedPdfGenerator';
import { useState, useEffect } from 'react';



// Add this export to the file
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Calculate trip duration in days
export function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.abs(end - start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Format currency
export function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

// Calculate daily budget
export function calculateDailyBudget(totalBudget, days) {
  if (!days || days === 0) return 0;
  return totalBudget / days;
}

// Calculate total budget from budget categories
export function calculateTotalBudget(budgetCategories) {
  return Object.values(budgetCategories).reduce((total, value) => total + value, 0);
}

// Generate unique ID
export function generateId() {
  return Date.now();
}

// Mock functions for external sharing/exporting
export function shareTrip(trip, method) {
  alert(`Sharing trip to ${trip.destination} via ${method}. This would open a sharing dialog in a real application.`);
}

export function exportTripToPDF(trip) {
  // We're now using the enhanced PDF generator
  // This is a simple pass-through to the enhanced version
  import('./enhancedPdfGenerator').then(module => {
    module.exportTripToPDF(trip);
  }).catch(error => {
    console.error('Error exporting trip to PDF:', error);
    alert(`Failed to export trip to ${trip.destination} as PDF. Please try again.`);
  });
}

export function emailTripDetails(trip, email) {
  alert(`Sending trip details for ${trip.destination} to ${email}. In a real application, this would send an email.`);
}

export function importBooking(email) {
  alert(`Importing booking from email: ${email}. In a real application, this would connect to your email and import confirmation details.`);
}

// Compare two trips and return the differences
export function compareTrips(trip1, trip2) {
  const comparison = {
    destination: {
      trip1: trip1.destination,
      trip2: trip2.destination,
      different: trip1.destination !== trip2.destination
    },
    duration: {
      trip1: calculateDuration(trip1.startDate, trip1.endDate),
      trip2: calculateDuration(trip2.startDate, trip2.endDate),
      different: calculateDuration(trip1.startDate, trip1.endDate) !== calculateDuration(trip2.startDate, trip2.endDate)
    },
    budget: {
      trip1: trip1.budget,
      trip2: trip2.budget,
      different: trip1.budget !== trip2.budget,
      difference: trip1.budget - trip2.budget
    },
    transportOptions: {
      trip1: trip1.transports?.length || 0,
      trip2: trip2.transports?.length || 0,
      different: (trip1.transports?.length || 0) !== (trip2.transports?.length || 0)
    },
    tasksCount: {
      trip1: trip1.tasks?.length || 0,
      trip2: trip2.tasks?.length || 0,
      different: (trip1.tasks?.length || 0) !== (trip2.tasks?.length || 0)
    },
    notesCount: {
      trip1: trip1.notes?.length || 0,
      trip2: trip2.notes?.length || 0,
      different: (trip1.notes?.length || 0) !== (trip2.notes?.length || 0)
    },
    photosCount: {
      trip1: trip1.photos?.length || 0,
      trip2: trip2.photos?.length || 0,
      different: (trip1.photos?.length || 0) !== (trip2.photos?.length || 0)
    }
  };
  
  // Budget breakdown comparison if available
  if (trip1.budgetBreakdown && trip2.budgetBreakdown) {
    comparison.budgetBreakdown = {
      accommodation: {
        trip1: trip1.budgetBreakdown.accommodation,
        trip2: trip2.budgetBreakdown.accommodation,
        different: trip1.budgetBreakdown.accommodation !== trip2.budgetBreakdown.accommodation,
        difference: trip1.budgetBreakdown.accommodation - trip2.budgetBreakdown.accommodation
      },
      food: {
        trip1: trip1.budgetBreakdown.food,
        trip2: trip2.budgetBreakdown.food,
        different: trip1.budgetBreakdown.food !== trip2.budgetBreakdown.food,
        difference: trip1.budgetBreakdown.food - trip2.budgetBreakdown.food
      },
      transportation: {
        trip1: trip1.budgetBreakdown.transportation,
        trip2: trip2.budgetBreakdown.transportation,
        different: trip1.budgetBreakdown.transportation !== trip2.budgetBreakdown.transportation,
        difference: trip1.budgetBreakdown.transportation - trip2.budgetBreakdown.transportation
      },
      activities: {
        trip1: trip1.budgetBreakdown.activities,
        trip2: trip2.budgetBreakdown.activities,
        different: trip1.budgetBreakdown.activities !== trip2.budgetBreakdown.activities,
        difference: trip1.budgetBreakdown.activities - trip2.budgetBreakdown.activities
      },
      other: {
        trip1: trip1.budgetBreakdown.other,
        trip2: trip2.budgetBreakdown.other,
        different: trip1.budgetBreakdown.other !== trip2.budgetBreakdown.other,
        difference: trip1.budgetBreakdown.other - trip2.budgetBreakdown.other
      }
    };
  }
  
  return comparison;
}