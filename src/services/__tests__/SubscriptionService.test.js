// src/services/__tests__/SubscriptionService.test.js
import SubscriptionService from '../SubscriptionService';
import dataProvider from '../../data/dataProvider';
import stripeService from '../stripeService';
import analyticsService from '../analyticsService';

// Mock dependencies
jest.mock('../../data/dataProvider');
jest.mock('../stripeService');
jest.mock('../analyticsService');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-device-id')
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SubscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('getOrCreateDeviceId', () => {
    it('should create a new device ID if none exists', () => {
      const deviceId = SubscriptionService.getOrCreateDeviceId();
      
      expect(deviceId).toBe('test-device-id');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('deviceId', 'test-device-id');
    });

    it('should return existing device ID if one exists', () => {
      localStorageMock.getItem.mockReturnValueOnce('existing-device-id');
      
      const deviceId = SubscriptionService.getOrCreateDeviceId();
      
      expect(deviceId).toBe('existing-device-id');
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription successfully', async () => {
      // Mock Stripe response
      stripeService.createSubscription.mockResolvedValueOnce({
        id: 'stripe-sub-id',
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days in the future
        plan: { amount: 999 } // $9.99
      });

      // Mock data provider response
      const mockSubscription = {
        accessCode: 'TEST-CODE-123',
        platform: 'web',
        status: 'active'
      };
      dataProvider.createSubscription.mockResolvedValueOnce(mockSubscription);

      // Generate access code (will be mocked implicitly)
      jest.spyOn(SubscriptionService, 'generateAccessCode').mockReturnValueOnce('TEST-CODE-123');

      const result = await SubscriptionService.createSubscription('premium-monthly', 'pm_test_12345');

      expect(stripeService.createSubscription).toHaveBeenCalledWith('pm_test_12345', 'premium-monthly');
      expect(dataProvider.createSubscription).toHaveBeenCalledWith(expect.objectContaining({
        accessCode: 'TEST-CODE-123',
        platform: 'web',
        originalTransactionId: 'stripe-sub-id',
        status: 'active',
        planId: 'premium-monthly'
      }));
      expect(analyticsService.trackSubscriptionStarted).toHaveBeenCalledWith(
        'premium-monthly', 
        9.99, // $9.99
        'web'
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessCode', 'TEST-CODE-123');
      expect(result).toEqual(mockSubscription);
    });

    it('should handle errors during subscription creation', async () => {
      stripeService.createSubscription.mockRejectedValueOnce(new Error('Payment failed'));
      
      await expect(SubscriptionService.createSubscription('premium-monthly', 'pm_test_12345'))
        .rejects.toThrow('Payment failed');
        
      expect(dataProvider.createSubscription).not.toHaveBeenCalled();
      expect(analyticsService.trackSubscriptionStarted).not.toHaveBeenCalled();
    });
  });

  describe('activateWithCode', () => {
    it('should activate a subscription with a valid code', async () => {
      const mockSubscription = {
        accessCode: 'VALID-CODE-123',
        status: 'active',
        expiresAt: new Date(Date.now() + 86400 * 1000 * 30) // 30 days in the future
      };
      
      dataProvider.getSubscriptionByAccessCode.mockResolvedValueOnce(mockSubscription);
      dataProvider.activateSubscriptionOnDevice.mockResolvedValueOnce(mockSubscription);
      
      const result = await SubscriptionService.activateWithCode('VALID-CODE-123');
      
      expect(dataProvider.getSubscriptionByAccessCode).toHaveBeenCalledWith('VALID-CODE-123');
      expect(dataProvider.activateSubscriptionOnDevice).toHaveBeenCalledWith(
        'VALID-CODE-123',
        'test-device-id',
        'web'
      );
      expect(analyticsService.trackCodeActivated).toHaveBeenCalledWith('web', 30);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessCode', 'VALID-CODE-123');
      expect(result).toEqual(mockSubscription);
    });

    it('should reject with invalid access code', async () => {
      dataProvider.getSubscriptionByAccessCode.mockResolvedValueOnce(null);
      
      await expect(SubscriptionService.activateWithCode('INVALID-CODE'))
        .rejects.toThrow('Invalid access code');
        
      expect(dataProvider.activateSubscriptionOnDevice).not.toHaveBeenCalled();
      expect(analyticsService.trackCodeActivated).not.toHaveBeenCalled();
    });

    it('should reject with inactive subscription', async () => {
      const mockSubscription = {
        accessCode: 'EXPIRED-CODE',
        status: 'expired',
      };
      
      dataProvider.getSubscriptionByAccessCode.mockResolvedValueOnce(mockSubscription);
      
      await expect(SubscriptionService.activateWithCode('EXPIRED-CODE'))
        .rejects.toThrow('Subscription is not active');
        
      expect(dataProvider.activateSubscriptionOnDevice).not.toHaveBeenCalled();
      expect(analyticsService.trackCodeActivated).not.toHaveBeenCalled();
    });
  });

  // More tests for other methods...
});