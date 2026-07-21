import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AppPalette } from '../theme/palette';

type SectionContent = {
  title: string;
  eyebrow: string;
  description: string;
  nextStep: string;
};

type SectionPlaceholderScreenProps = {
  bottomInset: number;
  content: SectionContent;
  palette: AppPalette;
  topInset: number;
};

export function SectionPlaceholderScreen({
  bottomInset,
  content,
  palette,
  topInset,
}: SectionPlaceholderScreenProps) {
  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomInset, paddingTop: topInset + 20 },
      ]}
      style={{ backgroundColor: palette.background }}
    >
      <Text style={[styles.eyebrow, { color: palette.accent }]}>
        {content.eyebrow}
      </Text>
      <Text style={[styles.title, { color: palette.primaryText }]}>
        {content.title}
      </Text>
      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.description, { color: palette.primaryText }]}>
          {content.description}
        </Text>
        <View
          style={[styles.divider, { backgroundColor: palette.separator }]}
        />
        <Text style={[styles.nextStep, { color: palette.secondaryText }]}>
          {content.nextStep}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginTop: 5,
  },
  card: {
    borderRadius: 20,
    marginTop: 24,
    padding: 18,
  },
  description: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 25,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  nextStep: {
    fontSize: 14,
    lineHeight: 21,
  },
});
