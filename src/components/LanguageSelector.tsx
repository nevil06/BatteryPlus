import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n/i18n';
import { COLORS } from '../utils/constants';

interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
];

export const LanguageSelector: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    const handleLanguageChange = async (languageCode: string) => {
        await changeLanguage(languageCode);
        setIsVisible(false);
    };

    const currentLanguage = SUPPORTED_LANGUAGES.find(
        (lang) => lang.code === i18n.language
    ) || SUPPORTED_LANGUAGES[0];

    return (
        <>
            <TouchableOpacity
                style={styles.triggerButton}
                onPress={() => setIsVisible(true)}
            >
                <Text style={styles.flagText}>{currentLanguage.flag}</Text>
                <Feather name="globe" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('languageSelector.title')}</Text>
                            <TouchableOpacity onPress={() => setIsVisible(false)}>
                                <Feather name="x" size={24} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            {t('languageSelector.subtitle')}
                        </Text>

                        <ScrollView style={styles.languageList}>
                            {SUPPORTED_LANGUAGES.map((language) => {
                                const isSelected = i18n.language === language.code;
                                return (
                                    <TouchableOpacity
                                        key={language.code}
                                        style={[
                                            styles.languageItem,
                                            isSelected && styles.languageItemSelected,
                                        ]}
                                        onPress={() => handleLanguageChange(language.code)}
                                    >
                                        <Text style={styles.languageFlag}>{language.flag}</Text>
                                        <View style={styles.languageTextContainer}>
                                            <Text style={styles.languageName}>
                                                {language.nativeName}
                                            </Text>
                                            <Text style={styles.languageNameSecondary}>
                                                {language.name}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <Feather name="check" size={20} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    triggerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: COLORS.cardBgLight,
        gap: 4,
    },
    flagText: {
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 20,
    },
    languageList: {
        maxHeight: 400,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: COLORS.cardBgLight,
        marginBottom: 8,
    },
    languageItemSelected: {
        backgroundColor: COLORS.primary + '20',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    languageFlag: {
        fontSize: 28,
        marginRight: 12,
    },
    languageTextContainer: {
        flex: 1,
    },
    languageName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    languageNameSecondary: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 2,
    },
});
