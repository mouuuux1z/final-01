export type PrivacySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type PrivacyPolicyDocument = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: PrivacySection[];
  contactHeading: string;
  contactEmail: string;
};

const PRIVACY_POLICY_AR: PrivacyPolicyDocument = {
  title: 'سياسة الخصوصية لتطبيق my doc',
  lastUpdated: 'تاريخ آخر تحديث: 27 يونيو 2026',
  intro:
    'نحن في my doc نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيف نقوم بجمع واستخدام المعلومات الخاصة بك عند استخدامك لتطبيقنا على أنظمة iOS وAndroid.',
  sections: [
    {
      title: '1. المعلومات التي نجمعها',
      paragraphs: ['نحن نجمع فقط المعلومات الضرورية لتشغيل التطبيق وتقديم الخدمة، وهي:'],
      bullets: [
        'البريد الإلكتروني: نطلبه لغرض التواصل معك، وتفعيل حسابك، أو إرسال تحديثات بخصوص خدماتنا.',
      ],
    },
    {
      title: '2. المدفوعات والتحويلات المالية',
      paragraphs: [
        'نود التوضيح أن تطبيقنا لا يعالج أي عمليات دفع مباشرة داخل التطبيق. في حال كانت الخدمة التي نقدمها مدفوعة، يتم التحويل المالي مباشرة إلى حسابنا البنكي الخاص خارج نطاق التطبيق.',
        'نحن لا نطلب من المستخدمين مشاركة أي تفاصيل بنكية أو معلومات دفع حساسة داخل التطبيق. يرجى الحذر من مشاركة بياناتك المالية في أي مراسلات.',
      ],
    },
    {
      title: '3. مشاركة البيانات',
      paragraphs: [
        'نحن نتعهد بعدم بيع أو مشاركة بريدك الإلكتروني مع أي طرف ثالث لأغراض تسويقية. يتم استخدام معلوماتك فقط لتقديم الخدمة المطلوبة وتسهيل التواصل معك.',
      ],
    },
    {
      title: '4. أمن البيانات',
      paragraphs: [
        'نحن نتخذ تدابير أمنية تقنية لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإتلاف. ورغم ذلك، نذكرك بأن نقل البيانات عبر الإنترنت لا يمكن أن يكون آمناً بنسبة 100%.',
      ],
    },
    {
      title: '5. حقوق المستخدم',
      paragraphs: [
        'لديك الحق في طلب الوصول إلى بياناتك المسجلة لدينا، أو طلب تصحيحها، أو حذفها نهائياً من سجلاتنا. يمكنك القيام بذلك عبر مراسلتنا على البريد الإلكتروني الموضح أدناه.',
      ],
    },
    {
      title: '6. التغييرات على السياسة',
      paragraphs: [
        'نحتفظ بالحق في تحديث سياسة الخصوصية هذه من وقت لآخر. سيتم إخطاركم بأي تغييرات جوهرية عبر التطبيق أو عبر البريد الإلكتروني الخاص بكم.',
      ],
    },
  ],
  contactHeading: '7. اتصل بنا',
  contactEmail: 'mydoc2contact@gmail.com',
};

const PRIVACY_POLICY_EN: PrivacyPolicyDocument = {
  title: 'MYDoc Privacy Policy',
  lastUpdated: 'Last updated: June 27, 2026',
  intro:
    'At MYDoc, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect and use your information when you use our app on iOS and Android.',
  sections: [
    {
      title: '1. Information We Collect',
      paragraphs: ['We only collect information necessary to operate the app and provide the service:'],
      bullets: [
        'Email address: used to communicate with you, activate your account, or send updates about our services.',
      ],
    },
    {
      title: '2. Payments and Financial Transfers',
      paragraphs: [
        'Our app does not process any payments directly within the application. If a service is paid, financial transfers are made directly to our bank account outside the app.',
        'We do not ask users to share banking details or sensitive payment information inside the app. Please be careful about sharing financial data in any correspondence.',
      ],
    },
    {
      title: '3. Data Sharing',
      paragraphs: [
        'We do not sell or share your email with third parties for marketing purposes. Your information is used only to provide the requested service and facilitate communication with you.',
      ],
    },
    {
      title: '4. Data Security',
      paragraphs: [
        'We implement technical security measures to protect your data from unauthorized access, alteration, or destruction. However, data transmission over the internet cannot be 100% secure.',
      ],
    },
    {
      title: '5. User Rights',
      paragraphs: [
        'You have the right to request access to your stored data, request correction, or permanent deletion from our records. You may do so by contacting us at the email below.',
      ],
    },
    {
      title: '6. Policy Changes',
      paragraphs: [
        'We reserve the right to update this privacy policy from time to time. Material changes will be communicated through the app or via your registered email.',
      ],
    },
  ],
  contactHeading: '7. Contact Us',
  contactEmail: 'mydoc2contact@gmail.com',
};

export function getPrivacyPolicy(language?: string): PrivacyPolicyDocument {
  if (language?.startsWith('ar')) {
    return PRIVACY_POLICY_AR;
  }
  return PRIVACY_POLICY_EN;
}
