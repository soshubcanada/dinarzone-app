export interface KycTier {
  id: 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3';
  monthlyLimitCAD: number;
  label: { fr: string; en: string; ar: string };
  requirements: { fr: string[]; en: string[]; ar: string[] };
  icon: string;
  color: string;
}

export const KYC_TIERS: KycTier[] = [
  {
    id: 'tier_0', monthlyLimitCAD: 0, icon: '🔒', color: '#8B9AAF',
    label: { fr: 'Non vérifié', en: 'Unverified', ar: 'غير موثق' },
    requirements: {
      fr: ['Créer un compte'], en: ['Create an account'], ar: ['إنشاء حساب'],
    },
  },
  {
    id: 'tier_1', monthlyLimitCAD: 200, icon: '📧', color: '#B8923B',
    label: { fr: 'Basique', en: 'Basic', ar: 'أساسي' },
    requirements: {
      fr: ['Email vérifié', 'Téléphone vérifié (SMS)'],
      en: ['Verified email', 'Verified phone (SMS)'],
      ar: ['بريد إلكتروني موثق', 'هاتف موثق (رسالة نصية)'],
    },
  },
  {
    id: 'tier_2', monthlyLimitCAD: 2000, icon: '🪪', color: '#006633',
    label: { fr: 'Vérifié', en: 'Verified', ar: 'موثق' },
    requirements: {
      fr: ['Pièce d\'identité (passeport ou CIN)', 'Selfie de vérification'],
      en: ['ID document (passport or national ID)', 'Verification selfie'],
      ar: ['وثيقة هوية (جواز سفر أو بطاقة وطنية)', 'صورة شخصية للتحقق'],
    },
  },
  {
    id: 'tier_3', monthlyLimitCAD: 10000, icon: '👑', color: '#D4AF6A',
    label: { fr: 'Premium', en: 'Premium', ar: 'بريميوم' },
    requirements: {
      fr: ['Justificatif de domicile', 'Source des fonds', 'Vérification faciale'],
      en: ['Proof of address', 'Source of funds', 'Facial verification'],
      ar: ['إثبات العنوان', 'مصدر الأموال', 'التحقق من الوجه'],
    },
  },
];
