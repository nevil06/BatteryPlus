import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import hi from './locales/hi.json';
import zh from './locales/zh.json';

const LANGUAGE_STORAGE_KEY = 'app_language';

const resources = {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    hi: { translation: hi },
    zh: { translation: zh },
};

// Get saved language or default to English
const getInitialLanguage = async (): Promise<string> => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        return savedLanguage || 'en';
    } catch (error) {
        console.error('Error loading language preference:', error);
        return 'en';
    }
};

// Initialize i18n
const initI18n = async () => {
    const initialLanguage = await getInitialLanguage();

    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: initialLanguage,
            fallbackLng: 'en',
            compatibilityJSON: 'v3',
            interpolation: {
                escapeValue: false,
            },
        });
};

// Save language preference
export const changeLanguage = async (languageCode: string) => {
    try {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
        await i18n.changeLanguage(languageCode);
    } catch (error) {
        console.error('Error saving language preference:', error);
    }
};

initI18n();

export default i18n;
