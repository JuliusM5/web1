// src/components/Weather/__tests__/WeatherForecast.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WeatherForecast from '../WeatherForecast';
import { getWeatherForecast, geocodeLocation } from '../../../services';

// Mock the service functions
jest.mock('../../../services', () => ({
  getWeatherForecast: jest.fn(),
  geocodeLocation: jest.fn(),
}));

describe('WeatherForecast Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<WeatherForecast destination="Paris" />);
    expect(screen.getByText('Loading weather forecast...')).toBeInTheDocument();
  });

  it('shows enter destination message when no destination is provided', async () => {
    render(<WeatherForecast destination="" />);
    
    await waitFor(() => {
      expect(screen.getByText('Enter a destination to see weather forecast.')).toBeInTheDocument();
    });
  });

  it('renders weather data when successfully fetched', async () => {
    // Mock successful API calls
    const mockGeoData = { lat: 48.8566, lon: 2.3522 };
    geocodeLocation.mockResolvedValue(mockGeoData);
    
    const mockWeatherData = {
      city: { name: 'Paris' },
      current_weather: {
        temperature: 25,
        weather: [{ description: 'sunny' }],
        windspeed: 10
      },
      list: [
        {
          dt_txt: '2024-04-13',
          main: { temp_max: 26, temp_min: 20 },
          weather: [{ main: 'Clear' }]
        },
        {
          dt_txt: '2024-04-14',
          main: { temp_max: 27, temp_min: 21 },
          weather: [{ main: 'Clear' }]
        },
        {
          dt_txt: '2024-04-15',
          main: { temp_max: 28, temp_min: 22 },
          weather: [{ main: 'Rain' }]
        },
        {
          dt_txt: '2024-04-16',
          main: { temp_max: 29, temp_min: 23 },
          weather: [{ main: 'Clear' }]
        },
        {
          dt_txt: '2024-04-17',
          main: { temp_max: 30, temp_min: 24 },
          weather: [{ main: 'Clear' }]
        }
      ]
    };
    getWeatherForecast.mockResolvedValue(mockWeatherData);

    render(<WeatherForecast destination="Paris" />);

    // Verify the API calls were made correctly
    expect(geocodeLocation).toHaveBeenCalledWith('Paris');
    expect(getWeatherForecast).toHaveBeenCalledWith(mockGeoData.lat, mockGeoData.lon);

    // Wait for the weather data to be displayed
    await waitFor(() => {
      expect(screen.getByText('Weather Forecast for Paris')).toBeInTheDocument();
      expect(screen.getByText('25°C')).toBeInTheDocument();
      expect(screen.getByText('sunny')).toBeInTheDocument();
      expect(screen.getByText('Data from Open-Meteo API')).toBeInTheDocument();
    });
  });

  it('handles error when fetching weather data', async () => {
    // Mock API failure
    geocodeLocation.mockRejectedValue(new Error('Failed to geocode'));

    render(<WeatherForecast destination="Invalid Location" />);

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to load weather for Invalid Location/)).toBeInTheDocument();
    });
  });
});