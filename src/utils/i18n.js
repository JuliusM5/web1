// src/utils/i18n.js
import { useState, useEffect, createContext, useContext } from 'react';

// Create a context for internationalization
const I18nContext = createContext();

// Default language
const DEFAULT_LANGUAGE = 'en-US';

// Available languages
export const AVAILABLE_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
];

// Translation dictionaries for each language
const translations = {
  'en-US': {
    // General
    'app.name': 'TravelEase',
    'app.tagline': 'Plan your trips with ease',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.planner': 'Plan Trip',
    'nav.trips': 'My Trips',
    'nav.settings': 'Settings',
    'nav.templates': 'Templates',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.stats.totalTrips': 'Total Trips',
    'dashboard.stats.upcoming': 'Upcoming',
    'dashboard.stats.daysTraveled': 'Days Traveled',
    'dashboard.stats.budgetTotal': 'Budget Total',
    'dashboard.nextAdventure': 'Next Adventure',
    'dashboard.startDate': 'Start Date',
    'dashboard.days': 'Days',
    'dashboard.budget': 'Budget',
    'dashboard.transportation': 'Transportation',
    'dashboard.viewDetails': 'View Trip Details',
    'dashboard.noTrips': 'No upcoming trips planned.',
    'dashboard.planTrip': 'Plan a Trip Now',
    'dashboard.timeline': 'Your Travel Timeline',
    
    // Forms and common actions
    'form.save': 'Save',
    'form.cancel': 'Cancel',
    'form.add': 'Add',
    'form.edit': 'Edit',
    'form.delete': 'Delete',
    'form.close': 'Close',
    
    // Trip planner tabs
    'planner.basicInfo': 'Basic Info',
    'planner.budget': 'Budget',
    'planner.transport': 'Transportation',
    'planner.photos': 'Photos',
    'planner.tasks': 'Tasks',
    'planner.packing': 'Packing',
    'planner.notes': 'Notes',
    'planner.external': 'External',
    'planner.saveTrip': 'Save Trip',
    'planner.updateTrip': 'Update Trip',
    
    // Basic info tab
    'basicInfo.destination': 'Destination',
    'basicInfo.destinationPlaceholder': 'Where are you going?',
    'basicInfo.startDate': 'Start Date',
    'basicInfo.endDate': 'End Date',
    'basicInfo.budget': 'Budget',
    'basicInfo.budgetPlaceholder': 'Estimated budget',
    'basicInfo.duration': 'Duration',
    'basicInfo.days': 'days',
    
    // Error messages
    'error.required': 'This field is required',
    'error.invalidEmail': 'Please enter a valid email address',
    'error.invalidDate': 'Please enter a valid date',
    
    // Success messages
    'success.tripSaved': 'Trip saved successfully',
    'success.tripUpdated': 'Trip updated successfully',
    'success.settingsSaved': 'Settings saved successfully',
  },
  'es-ES': {
    // General
    'app.name': 'TravelEase',
    'app.tagline': 'Planifica tus viajes con facilidad',
    
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.planner': 'Planificar Viaje',
    'nav.trips': 'Mis Viajes',
    'nav.settings': 'Configuración',
    'nav.templates': 'Plantillas',
    
    // Dashboard
    'dashboard.title': 'Panel',
    'dashboard.stats.totalTrips': 'Viajes Totales',
    'dashboard.stats.upcoming': 'Próximos',
    'dashboard.stats.daysTraveled': 'Días Viajados',
    'dashboard.stats.budgetTotal': 'Presupuesto Total',
    'dashboard.nextAdventure': 'Próxima Aventura',
    'dashboard.startDate': 'Fecha de Inicio',
    'dashboard.days': 'Días',
    'dashboard.budget': 'Presupuesto',
    'dashboard.transportation': 'Transporte',
    'dashboard.viewDetails': 'Ver Detalles del Viaje',
    'dashboard.noTrips': 'No hay viajes próximos planificados.',
    'dashboard.planTrip': 'Planificar un Viaje Ahora',
    'dashboard.timeline': 'Tu Línea de Tiempo de Viajes',
    
    // Forms and common actions
    'form.save': 'Guardar',
    'form.cancel': 'Cancelar',
    'form.add': 'Añadir',
    'form.edit': 'Editar',
    'form.delete': 'Eliminar',
    'form.close': 'Cerrar',
    
    // Trip planner tabs
    'planner.basicInfo': 'Información Básica',
    'planner.budget': 'Presupuesto',
    'planner.transport': 'Transporte',
    'planner.photos': 'Fotos',
    'planner.tasks': 'Tareas',
    'planner.packing': 'Equipaje',
    'planner.notes': 'Notas',
    'planner.external': 'Externo',
    'planner.saveTrip': 'Guardar Viaje',
    'planner.updateTrip': 'Actualizar Viaje',
    
    // Basic info tab
    'basicInfo.destination': 'Destino',
    'basicInfo.destinationPlaceholder': '¿A dónde vas?',
    'basicInfo.startDate': 'Fecha de Inicio',
    'basicInfo.endDate': 'Fecha de Fin',
    'basicInfo.budget': 'Presupuesto',
    'basicInfo.budgetPlaceholder': 'Presupuesto estimado',
    'basicInfo.duration': 'Duración',
    'basicInfo.days': 'días',
    
    // Error messages
    'error.required': 'Este campo es obligatorio',
    'error.invalidEmail': 'Por favor, introduce un correo electrónico válido',
    'error.invalidDate': 'Por favor, introduce una fecha válida',
    
    // Success messages
    'success.tripSaved': 'Viaje guardado correctamente',
    'success.tripUpdated': 'Viaje actualizado correctamente',
    'success.settingsSaved': 'Configuración guardada correctamente',
  },
  'fr-FR': {
    // General
    'app.name': 'TravelEase',
    'app.tagline': 'Planifiez vos voyages facilement',
    
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.planner': 'Planifier un Voyage',
    'nav.trips': 'Mes Voyages',
    'nav.settings': 'Paramètres',
    'nav.templates': 'Modèles',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.stats.totalTrips': 'Voyages Totaux',
    'dashboard.stats.upcoming': 'À venir',
    'dashboard.stats.daysTraveled': 'Jours Voyagés',
    'dashboard.stats.budgetTotal': 'Budget Total',
    'dashboard.nextAdventure': 'Prochaine Aventure',
    'dashboard.startDate': 'Date de Début',
    'dashboard.days': 'Jours',
    'dashboard.budget': 'Budget',
    'dashboard.transportation': 'Transport',
    'dashboard.viewDetails': 'Voir les Détails du Voyage',
    'dashboard.noTrips': 'Aucun voyage à venir planifié.',
    'dashboard.planTrip': 'Planifier un Voyage Maintenant',
    'dashboard.timeline': 'Votre Chronologie de Voyage',
    
    // Forms and common actions
    'form.save': 'Enregistrer',
    'form.cancel': 'Annuler',
    'form.add': 'Ajouter',
    'form.edit': 'Modifier',
    'form.delete': 'Supprimer',
    'form.close': 'Fermer',
    
    // Trip planner tabs
    'planner.basicInfo': 'Informations de Base',
    'planner.budget': 'Budget',
    'planner.transport': 'Transport',
    'planner.photos': 'Photos',
    'planner.tasks': 'Tâches',
    'planner.packing': 'Bagages',
    'planner.notes': 'Notes',
    'planner.external': 'Externe',
    'planner.saveTrip': 'Enregistrer le Voyage',
    'planner.updateTrip': 'Mettre à Jour le Voyage',
    
    // Basic info tab
    'basicInfo.destination': 'Destination',
    'basicInfo.destinationPlaceholder': 'Où allez-vous?',
    'basicInfo.startDate': 'Date de Début',
    'basicInfo.endDate': 'Date de Fin',
    'basicInfo.budget': 'Budget',
    'basicInfo.budgetPlaceholder': 'Budget estimé',
    'basicInfo.duration': 'Durée',
    'basicInfo.days': 'jours',
    
    // Error messages
    'error.required': 'Ce champ est requis',
    'error.invalidEmail': 'Veuillez entrer une adresse email valide',
    'error.invalidDate': 'Veuillez entrer une date valide',
    
    // Success messages
    'success.tripSaved': 'Voyage enregistré avec succès',
    'success.tripUpdated': 'Voyage mis à jour avec succès',
    'success.settingsSaved': 'Paramètres enregistrés avec succès',
  },
  // Add more languages as needed
};

// Provider component for internationalization
export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  
  // Function to set the language
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      // Update HTML lang attribute
      document.documentElement.setAttribute('lang', lang.split('-')[0]);
      // Store in local storage for persistence
      localStorage.setItem('userLanguage', lang);
    }
  };
  
  // Get translation for a key
  const t = (key, replacements = {}) => {
    // Get the translation from the current language
    let translation = translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
    
    // Replace placeholders with actual values
    Object.entries(replacements).forEach(([placeholder, value]) => {
      translation = translation.replace(`{${placeholder}}`, value);
    });
    
    return translation;
  };
  
  // Initialize language from localStorage or settings
  useEffect(() => {
    const storedLanguage = localStorage.getItem('userLanguage');
    if (storedLanguage && translations[storedLanguage]) {
      setLanguage(storedLanguage);
      document.documentElement.setAttribute('lang', storedLanguage.split('-')[0]);
    } else {
      // Try to get language from user settings
      try {
        const userSettings = JSON.parse(localStorage.getItem('userSettings'));
        const settingsLanguage = userSettings?.preferences?.language;
        
        if (settingsLanguage && translations[settingsLanguage]) {
          setLanguage(settingsLanguage);
          document.documentElement.setAttribute('lang', settingsLanguage.split('-')[0]);
        }
      } catch (error) {
        console.error('Error loading language from settings:', error);
      }
    }
  }, []);
  
  // Listen for settings changes to sync language
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userSettings') {
        try {
          const userSettings = JSON.parse(e.newValue);
          const settingsLanguage = userSettings?.preferences?.language;
          
          if (settingsLanguage && translations[settingsLanguage] && settingsLanguage !== language) {
            setLanguage(settingsLanguage);
            document.documentElement.setAttribute('lang', settingsLanguage.split('-')[0]);
          }
        } catch (error) {
          console.error('Error syncing language from settings:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [language]);
  
  return (
    <I18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use the internationalization context
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Connect the settings language preference with the i18n system
export const syncLanguageWithSettings = (userSettings) => {
  if (userSettings?.preferences?.language) {
    const settingsLanguage = userSettings.preferences.language;
    if (translations[settingsLanguage]) {
      localStorage.setItem('userLanguage', settingsLanguage);
      document.documentElement.setAttribute('lang', settingsLanguage.split('-')[0]);
      return true;
    }
  }
  return false;
};