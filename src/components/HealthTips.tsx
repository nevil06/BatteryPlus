import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../utils/constants';
import { HealthTip } from '../types/battery';

const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
  'thermometer': 'thermometer',
  'battery-charging': 'battery-charging',
  'zap': 'zap',
  'moon': 'moon',
  'sun': 'sun',
  'x-circle': 'x-circle',
  'archive': 'archive',
  'shield': 'shield',
};

const categoryColors: Record<string, string> = {
  charging: COLORS.primary,
  temperature: COLORS.warning,
  usage: COLORS.secondary,
  storage: COLORS.accent,
};

interface HealthTipsProps {
  compact?: boolean;
}

export const HealthTips: React.FC<HealthTipsProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  // Build tips array from translations
  const HEALTH_TIPS: HealthTip[] = [
    { id: '1', title: t('healthTips.tips.1.title'), description: t('healthTips.tips.1.description'), icon: 'thermometer', category: 'temperature' },
    { id: '2', title: t('healthTips.tips.2.title'), description: t('healthTips.tips.2.description'), icon: 'battery-charging', category: 'charging' },
    { id: '3', title: t('healthTips.tips.3.title'), description: t('healthTips.tips.3.description'), icon: 'zap', category: 'charging' },
    { id: '4', title: t('healthTips.tips.4.title'), description: t('healthTips.tips.4.description'), icon: 'moon', category: 'charging' },
    { id: '5', title: t('healthTips.tips.5.title'), description: t('healthTips.tips.5.description'), icon: 'sun', category: 'usage' },
    { id: '6', title: t('healthTips.tips.6.title'), description: t('healthTips.tips.6.description'), icon: 'x-circle', category: 'usage' },
    { id: '7', title: t('healthTips.tips.7.title'), description: t('healthTips.tips.7.description'), icon: 'archive', category: 'storage' },
    { id: '8', title: t('healthTips.tips.8.title'), description: t('healthTips.tips.8.description'), icon: 'shield', category: 'usage' },
  ];

  const displayTips = compact ? HEALTH_TIPS.slice(0, 4) : HEALTH_TIPS;

  const renderTip = (tip: HealthTip) => {
    const isExpanded = expandedTip === tip.id;
    const color = categoryColors[tip.category];

    return (
      <TouchableOpacity
        key={tip.id}
        style={styles.tipContainer}
        onPress={() => setExpandedTip(isExpanded ? null : tip.id)}
        activeOpacity={0.7}
      >
        <View style={styles.tipHeader}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Feather
              name={iconMap[tip.icon] || 'info'}
              size={18}
              color={color}
            />
          </View>
          <View style={styles.tipTextContainer}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            {!isExpanded && (
              <Text style={styles.tipPreview} numberOfLines={1}>
                {tip.description}
              </Text>
            )}
          </View>
          <Feather
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.textMuted}
          />
        </View>

        {isExpanded && (
          <View style={styles.tipContent}>
            <Text style={styles.tipDescription}>{tip.description}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.categoryText, { color }]}>
                {t(`healthTips.categories.${tip.category}`)}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="heart" size={20} color={COLORS.danger} />
        <Text style={styles.title}>{t('healthTips.title')}</Text>
      </View>

      <ScrollView
        style={styles.tipsScroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {displayTips.map(renderTip)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  tipsScroll: {
    maxHeight: 300,
  },
  tipContainer: {
    backgroundColor: COLORS.cardBgLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  tipPreview: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tipContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tipDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
