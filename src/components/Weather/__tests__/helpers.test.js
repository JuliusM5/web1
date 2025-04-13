// src/utils/__tests__/helpers.test.js
import { 
    calculateDuration, 
    formatCurrency, 
    calculateDailyBudget,
    calculateTotalBudget,
    generateId,
    compareTrips
  } from '../helpers';
  
  describe('Helper Functions', () => {
    describe('calculateDuration', () => {
      it('calculates the correct number of days between two dates', () => {
        const startDate = '2023-01-01';
        const endDate = '2023-01-10';
        expect(calculateDuration(startDate, endDate)).toBe(10);
      });
  
      it('returns 0 when either date is missing', () => {
        expect(calculateDuration(null, '2023-01-10')).toBe(0);
        expect(calculateDuration('2023-01-01', null)).toBe(0);
        expect(calculateDuration(null, null)).toBe(0);
      });
  
      it('handles same day trip (1 day)', () => {
        const date = '2023-01-01';
        expect(calculateDuration(date, date)).toBe(1);
      });
    });
  
    describe('formatCurrency', () => {
      it('formats a number as currency with $ symbol and 2 decimal places', () => {
        expect(formatCurrency(1000)).toBe('$1000.00');
        expect(formatCurrency(1000.5)).toBe('$1000.50');
        expect(formatCurrency(1000.555)).toBe('$1000.56'); // Rounds up
      });
  
      it('handles 0 value', () => {
        expect(formatCurrency(0)).toBe('$0.00');
      });
    });
  
    describe('calculateDailyBudget', () => {
      it('calculates daily budget correctly', () => {
        expect(calculateDailyBudget(1000, 10)).toBe(100);
        expect(calculateDailyBudget(1500, 3)).toBe(500);
      });
  
      it('returns 0 when days is 0 or not provided', () => {
        expect(calculateDailyBudget(1000, 0)).toBe(0);
        expect(calculateDailyBudget(1000, null)).toBe(0);
      });
    });
  
    describe('calculateTotalBudget', () => {
      it('sums all budget categories', () => {
        const budgetCategories = {
          accommodation: 500,
          food: 300,
          transportation: 200,
          activities: 150,
          other: 50
        };
        expect(calculateTotalBudget(budgetCategories)).toBe(1200);
      });
  
      it('handles empty object', () => {
        expect(calculateTotalBudget({})).toBe(0);
      });
  
      it('ignores non-numeric values', () => {
        const badBudget = {
          accommodation: 500,
          food: '300', // String should be converted to number
          transportation: null,
          activities: undefined,
          other: NaN
        };
        // Only accommodation and food (converted to number) should be summed
        expect(calculateTotalBudget(badBudget)).toBe(500);
      });
    });
  
    describe('generateId', () => {
      it('returns a numeric ID', () => {
        const id = generateId();
        expect(typeof id).toBe('number');
      });
  
      it('returns a unique ID each time', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
      });
    });
  
    describe('compareTrips', () => {
      const trip1 = {
        destination: 'Paris',
        startDate: '2023-01-01',
        endDate: '2023-01-10',
        budget: 2000,
        budgetBreakdown: {
          accommodation: 800,
          food: 500,
          transportation: 400,
          activities: 200,
          other: 100
        },
        transports: [{}, {}, {}],
        tasks: [{}, {}, {}, {}],
        notes: [{}, {}]
      };
  
      const trip2 = {
        destination: 'London',
        startDate: '2023-02-01',
        endDate: '2023-02-05',
        budget: 1500,
        budgetBreakdown: {
          accommodation: 600,
          food: 400,
          transportation: 300,
          activities: 150,
          other: 50
        },
        transports: [{}, {}],
        tasks: [{}, {}],
        notes: [{}, {}, {}]
      };
  
      it('compares basic trip attributes correctly', () => {
        const comparison = compareTrips(trip1, trip2);
        
        expect(comparison.destination.trip1).toBe('Paris');
        expect(comparison.destination.trip2).toBe('London');
        expect(comparison.destination.different).toBe(true);
        
        expect(comparison.duration.trip1).toBe(10);
        expect(comparison.duration.trip2).toBe(5);
        expect(comparison.duration.different).toBe(true);
        
        expect(comparison.budget.trip1).toBe(2000);
        expect(comparison.budget.trip2).toBe(1500);
        expect(comparison.budget.different).toBe(true);
        expect(comparison.budget.difference).toBe(500);
      });
  
      it('compares counts correctly', () => {
        const comparison = compareTrips(trip1, trip2);
        
        expect(comparison.transportOptions.trip1).toBe(3);
        expect(comparison.transportOptions.trip2).toBe(2);
        expect(comparison.transportOptions.different).toBe(true);
        
        expect(comparison.tasksCount.trip1).toBe(4);
        expect(comparison.tasksCount.trip2).toBe(2);
        expect(comparison.tasksCount.different).toBe(true);
        
        expect(comparison.notesCount.trip1).toBe(2);
        expect(comparison.notesCount.trip2).toBe(3);
        expect(comparison.notesCount.different).toBe(true);
      });
  
      it('compares budget breakdowns correctly', () => {
        const comparison = compareTrips(trip1, trip2);
        
        expect(comparison.budgetBreakdown.accommodation.trip1).toBe(800);
        expect(comparison.budgetBreakdown.accommodation.trip2).toBe(600);
        expect(comparison.budgetBreakdown.accommodation.different).toBe(true);
        expect(comparison.budgetBreakdown.accommodation.difference).toBe(200);
        
        expect(comparison.budgetBreakdown.food.trip1).toBe(500);
        expect(comparison.budgetBreakdown.food.trip2).toBe(400);
        expect(comparison.budgetBreakdown.food.difference).toBe(100);
      });
    });
  });