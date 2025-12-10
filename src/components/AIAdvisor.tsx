import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { BatteryInfo, BatteryReading } from '../types/battery';
import { generateBatterySuggestion, validateApiKey } from '../services/groqService';
import { saveGroqApiKey, getGroqApiKey, saveLastAISuggestion } from '../services/storageService';
import { COLORS, GRADIENTS } from '../utils/constants';

interface AIAdvisorProps {
  batteryInfo: BatteryInfo;
  readings: BatteryReading[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ batteryInfo, readings }) => {
  const { t } = useTranslation();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  React.useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    const key = await getGroqApiKey();
    setHasApiKey(!!key);
    if (key) setApiKey(key);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError(t('aiAdvisor.enterApiKey'));
      return;
    }

    setIsLoading(true);
    setError(null);

    const isValid = await validateApiKey(apiKey.trim());
    if (isValid) {
      await saveGroqApiKey(apiKey.trim());
      setHasApiKey(true);
      setShowApiModal(false);
      setError(null);
    } else {
      setError(t('aiAdvisor.invalidApiKey'));
    }

    setIsLoading(false);
  };

  const getSuggestion = useCallback(async () => {
    const key = await getGroqApiKey();
    if (!key) {
      setShowApiModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await generateBatterySuggestion(key, batteryInfo, readings);
      setSuggestion(response);
      await saveLastAISuggestion(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('aiAdvisor.failedToGetSuggestion'));
    } finally {
      setIsLoading(false);
    }
  }, [batteryInfo, readings]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[GRADIENTS.purple[0] + '20', GRADIENTS.purple[1] + '10']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.iconContainer}>
              <Feather name="cpu" size={20} color={COLORS.accent} />
            </View>
            <View>
              <Text style={styles.title}>{t('aiAdvisor.title')}</Text>
              <Text style={styles.subtitle}>{t('aiAdvisor.subtitle')}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowApiModal(true)}
          >
            <Feather name="settings" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {suggestion && (
          <View style={styles.suggestionContainer}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={getSuggestion}
          disabled={isLoading}
        >
          <LinearGradient
            colors={GRADIENTS.purple}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.text} size="small" />
            ) : (
              <>
                <Feather name="zap" size={18} color={COLORS.text} />
                <Text style={styles.buttonText}>
                  {suggestion ? t('aiAdvisor.getNewTip') : t('aiAdvisor.getPersonalizedTip')}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {!hasApiKey && (
          <Text style={styles.setupHint}>
            {t('aiAdvisor.setupHint')}
          </Text>
        )}
      </LinearGradient>

      {/* API Key Modal */}
      <Modal
        visible={showApiModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('aiAdvisor.modalTitle')}</Text>
              <TouchableOpacity onPress={() => setShowApiModal(false)}>
                <Feather name="x" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              {t('aiAdvisor.modalDescription')}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={t('aiAdvisor.apiKeyPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            {error && (
              <Text style={styles.modalError}>{error}</Text>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSaveApiKey}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.text} size="small" />
              ) : (
                <Text style={styles.modalButtonText}>{t('aiAdvisor.saveApiKey')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  suggestionContainer: {
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '20',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.danger,
    marginLeft: 8,
    flex: 1,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  setupHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  modalError: {
    fontSize: 13,
    color: COLORS.danger,
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});
