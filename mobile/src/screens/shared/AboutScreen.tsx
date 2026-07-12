import { Linking, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '../../components/BackButton';
import { ScreenShell } from '../../components/ui/ScreenShell';
import { getPrivacyPolicy } from '../../content/privacyPolicy';
import { UI, cardShadowStyle } from '../../theme/ui';
import { useTypography } from '../../hooks/useTypography';

export function AboutScreen() {
  const { i18n } = useTranslation();
  const navigation = useNavigation();
  const typography = useTypography();
  const policy = getPrivacyPolicy(i18n.language);

  const openEmail = () => {
    void Linking.openURL(`mailto:${policy.contactEmail}`);
  };

  return (
    <ScreenShell contentContainerClassName="pb-10">
      <BackButton onPress={() => navigation.goBack()} />

      <Text
        className="mb-2 text-2xl text-on-sky"
        style={{ fontFamily: typography.fontFamily, fontWeight: typography.headingWeight }}
      >
        {policy.title}
      </Text>
      <Text className="mb-5 text-sm text-on-sky-muted">{policy.lastUpdated}</Text>

      <View
        className="rounded-card bg-white p-5"
        style={{ borderColor: UI.border, borderWidth: 1, ...cardShadowStyle() }}
      >
        <Text className="mb-5 text-sm leading-6 text-body">{policy.intro}</Text>

        {policy.sections.map((section) => (
          <View key={section.title} className="mb-5">
            <Text
              className="mb-2 text-base text-heading"
              style={{ fontFamily: typography.fontFamilyMedium, fontWeight: typography.bodyWeight }}
            >
              {section.title}
            </Text>
            {section.paragraphs.map((paragraph) => (
              <Text key={paragraph} className="mb-2 text-sm leading-6 text-body">
                {paragraph}
              </Text>
            ))}
            {section.bullets?.map((bullet) => (
              <View key={bullet} className="mb-2 flex-row gap-2">
                <Text className="text-sm text-primary">•</Text>
                <Text className="flex-1 text-sm leading-6 text-body">{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        <View className="border-t pt-4" style={{ borderColor: UI.border }}>
          <Text
            className="mb-2 text-base text-heading"
            style={{ fontFamily: typography.fontFamilyMedium, fontWeight: typography.bodyWeight }}
          >
            {policy.contactHeading}
          </Text>
          <Text className="mb-3 text-sm leading-6 text-body">
            {i18n.language.startsWith('ar')
              ? 'إذا كانت لديك أي استفسارات أو مخاوف بشأن سياسة الخصوصية هذه، يرجى التواصل معنا عبر البريد الإلكتروني التالي:'
              : 'If you have any questions or concerns about this privacy policy, please contact us at:'}
          </Text>
          <Pressable onPress={openEmail} className="active:opacity-80">
            <Text className="text-sm font-semibold text-primary">{policy.contactEmail}</Text>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}
