// src/components/Subscription/__tests__/MobileCodeActivation.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileCodeActivation from '../MobileCodeActivation';
import { SubscriptionContext } from '../../../context/SubscriptionContext';
import subscriptionService from '../../../services/SubscriptionService';

// Mock the subscription service
jest.mock('../../../services/SubscriptionService');

describe('MobileCodeActivation', () => {
  const mockActivateWithCode = jest.fn();
  const mockSetSubscription = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const renderWithContext = (ui, { subscription = null } = {}) => {
    return render(
      <SubscriptionContext.Provider 
        value={{ 
          subscription, 
          setSubscription: mockSetSubscription,
          activateWithCode: mockActivateWithCode
        }}
      >
        {ui}
      </SubscriptionContext.Provider>
    );
  };

  it('renders the activation form', () => {
    renderWithContext(<MobileCodeActivation />);
    
    expect(screen.getByText(/Enter your activation code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Activate/i })).toBeInTheDocument();
  });

  it('allows entering an access code', () => {
    renderWithContext(<MobileCodeActivation />);
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'ABCD' } });
    fireEvent.change(inputs[1], { target: { value: 'EFGH' } });
    fireEvent.change(inputs[2], { target: { value: 'IJKL' } });
    
    expect(inputs[0].value).toBe('ABCD');
    expect(inputs[1].value).toBe('EFGH');
    expect(inputs[2].value).toBe('IJKL');
  });

  it('submits the code when activate button is clicked', async () => {
    mockActivateWithCode.mockResolvedValueOnce({ status: 'active' });
    
    renderWithContext(<MobileCodeActivation />);
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'ABCD' } });
    fireEvent.change(inputs[1], { target: { value: 'EFGH' } });
    fireEvent.change(inputs[2], { target: { value: 'IJKL' } });
    
    const activateButton = screen.getByRole('button', { name: /Activate/i });
    fireEvent.click(activateButton);
    
    await waitFor(() => {
      expect(mockActivateWithCode).toHaveBeenCalledWith('ABCD-EFGH-IJKL');
      expect(mockSetSubscription).toHaveBeenCalledWith({ status: 'active' });
    });
  });

  it('displays an error message when activation fails', async () => {
    mockActivateWithCode.mockRejectedValueOnce(new Error('Invalid code'));
    
    renderWithContext(<MobileCodeActivation />);
    
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'ABCD' } });
    fireEvent.change(inputs[1], { target: { value: 'EFGH' } });
    fireEvent.change(inputs[2], { target: { value: 'IJKL' } });
    
    const activateButton = screen.getByRole('button', { name: /Activate/i });
    fireEvent.click(activateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid code/i)).toBeInTheDocument();
      expect(mockSetSubscription).not.toHaveBeenCalled();
    });
  });

  it('redirects if user already has an active subscription', () => {
    const mockOnSuccess = jest.fn();
    
    renderWithContext(
      <MobileCodeActivation onSuccess={mockOnSuccess} />,
      { subscription: { status: 'active' } }
    );
    
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(screen.queryByText(/Enter your activation code/i)).not.toBeInTheDocument();
  });
});