export interface Corridor {
  id: string;
  sourceCountry: string;
  sourceCountryName: { fr: string; en: string; ar: string };
  sourceFlag: string;
  sourceCurrency: string;
  destinationCountry: string;
  destinationCountryName: { fr: string; en: string; ar: string };
  destinationFlag: string;
  destinationCurrency: string;
  deliveryMethods: DeliveryMethod[];
  isActive: boolean;
  minAmount: number;
  maxAmount: number;
}

export type DeliveryMethod =
  | 'baridimob_ccp'
  | 'cash_pickup'
  | 'bank_transfer'
  | 'd17_laposte'
  | 'exchange_house'
  | 'virtual_card';

export const DELIVERY_METHOD_INFO: Record<DeliveryMethod, {
  label: { fr: string; en: string; ar: string };
  icon: string;
  estimatedTime: { fr: string; en: string; ar: string };
}> = {
  baridimob_ccp: {
    label: { fr: 'BaridiMob / CCP', en: 'BaridiMob / CCP', ar: 'بريدي موب / CCP' },
    icon: '📱',
    estimatedTime: { fr: '2-6 heures', en: '2-6 hours', ar: '٢-٦ ساعات' },
  },
  cash_pickup: {
    label: { fr: 'Retrait cash agent', en: 'Cash Pickup', ar: 'استلام نقدي' },
    icon: '🏪',
    estimatedTime: { fr: '2-24 heures', en: '2-24 hours', ar: '٢-٢٤ ساعة' },
  },
  bank_transfer: {
    label: { fr: 'Virement bancaire', en: 'Bank Transfer', ar: 'حوالة بنكية' },
    icon: '🏦',
    estimatedTime: { fr: '1-3 jours', en: '1-3 days', ar: '١-٣ أيام' },
  },
  d17_laposte: {
    label: { fr: 'D17 / La Poste', en: 'D17 / La Poste', ar: 'D17 / البريد' },
    icon: '📮',
    estimatedTime: { fr: '2-6 heures', en: '2-6 hours', ar: '٢-٦ ساعات' },
  },
  exchange_house: {
    label: { fr: 'Bureau de change', en: 'Exchange House', ar: 'صرافة' },
    icon: '💱',
    estimatedTime: { fr: 'Même jour', en: 'Same day', ar: 'نفس اليوم' },
  },
  virtual_card: {
    label: { fr: 'Carte virtuelle', en: 'Virtual Card', ar: 'بطاقة افتراضية' },
    icon: '💳',
    estimatedTime: { fr: 'Instant', en: 'Instant', ar: 'فوري' },
  },
};

export const CORRIDORS: Corridor[] = [
  {
    id: 'CA-DZ', sourceCountry: 'CA', sourceFlag: '🇨🇦', sourceCurrency: 'CAD',
    sourceCountryName: { fr: 'Canada', en: 'Canada', ar: 'كندا' },
    destinationCountry: 'DZ', destinationFlag: '🇩🇿', destinationCurrency: 'DZD',
    destinationCountryName: { fr: 'Algérie', en: 'Algeria', ar: 'الجزائر' },
    deliveryMethods: ['baridimob_ccp', 'cash_pickup', 'bank_transfer'],
    isActive: true, minAmount: 10, maxAmount: 10000,
  },
  {
    id: 'QA-DZ', sourceCountry: 'QA', sourceFlag: '🇶🇦', sourceCurrency: 'QAR',
    sourceCountryName: { fr: 'Qatar', en: 'Qatar', ar: 'قطر' },
    destinationCountry: 'DZ', destinationFlag: '🇩🇿', destinationCurrency: 'DZD',
    destinationCountryName: { fr: 'Algérie', en: 'Algeria', ar: 'الجزائر' },
    deliveryMethods: ['baridimob_ccp', 'cash_pickup', 'bank_transfer'],
    isActive: true, minAmount: 10, maxAmount: 10000,
  },
  {
    id: 'AE-DZ', sourceCountry: 'AE', sourceFlag: '🇦🇪', sourceCurrency: 'AED',
    sourceCountryName: { fr: 'Émirats', en: 'UAE', ar: 'الإمارات' },
    destinationCountry: 'DZ', destinationFlag: '🇩🇿', destinationCurrency: 'DZD',
    destinationCountryName: { fr: 'Algérie', en: 'Algeria', ar: 'الجزائر' },
    deliveryMethods: ['baridimob_ccp', 'cash_pickup', 'bank_transfer'],
    isActive: true, minAmount: 10, maxAmount: 10000,
  },
  {
    id: 'CA-TN', sourceCountry: 'CA', sourceFlag: '🇨🇦', sourceCurrency: 'CAD',
    sourceCountryName: { fr: 'Canada', en: 'Canada', ar: 'كندا' },
    destinationCountry: 'TN', destinationFlag: '🇹🇳', destinationCurrency: 'TND',
    destinationCountryName: { fr: 'Tunisie', en: 'Tunisia', ar: 'تونس' },
    deliveryMethods: ['d17_laposte', 'cash_pickup', 'bank_transfer'],
    isActive: true, minAmount: 10, maxAmount: 10000,
  },
  {
    id: 'QA-TN', sourceCountry: 'QA', sourceFlag: '🇶🇦', sourceCurrency: 'QAR',
    sourceCountryName: { fr: 'Qatar', en: 'Qatar', ar: 'قطر' },
    destinationCountry: 'TN', destinationFlag: '🇹🇳', destinationCurrency: 'TND',
    destinationCountryName: { fr: 'Tunisie', en: 'Tunisia', ar: 'تونس' },
    deliveryMethods: ['d17_laposte', 'cash_pickup', 'bank_transfer'],
    isActive: true, minAmount: 10, maxAmount: 10000,
  },
  {
    id: 'AE-TN', sourceCountry: 'AE', sourceFlag: '🇦🇪', sourceCurrency: 'AED',
    sourceCountryName: { fr: 'Émirats', en: 'UAE', ar: 'الإمارات' },
    destinationCountry: 'TN', destinationFlag: '🇹🇳', destinationCurrency: 'TND',
    destinationCountryName: { fr: 'Tunisie', en: 'Tunisia', ar: 'تونس' },
    deliveryMethods: ['d17_laposte', 'cash_pickup', 'bank_transfer'],
    isActive: true, minAmount: 10, maxAmount: 10000,
  },
  {
    id: 'CA-QA', sourceCountry: 'CA', sourceFlag: '🇨🇦', sourceCurrency: 'CAD',
    sourceCountryName: { fr: 'Canada', en: 'Canada', ar: 'كندا' },
    destinationCountry: 'QA', destinationFlag: '🇶🇦', destinationCurrency: 'QAR',
    destinationCountryName: { fr: 'Qatar', en: 'Qatar', ar: 'قطر' },
    deliveryMethods: ['exchange_house', 'bank_transfer'],
    isActive: true, minAmount: 10, maxAmount: 10000,
  },
  {
    id: 'CA-AE', sourceCountry: 'CA', sourceFlag: '🇨🇦', sourceCurrency: 'CAD',
    sourceCountryName: { fr: 'Canada', en: 'Canada', ar: 'كندا' },
    destinationCountry: 'AE', destinationFlag: '🇦🇪', destinationCurrency: 'AED',
    destinationCountryName: { fr: 'Émirats', en: 'UAE', ar: 'الإمارات' },
    deliveryMethods: ['exchange_house', 'bank_transfer'],
    isActive: true, minAmount: 10, maxAmount: 10000,
  },
  {
    id: 'QA-AE', sourceCountry: 'QA', sourceFlag: '🇶🇦', sourceCurrency: 'QAR',
    sourceCountryName: { fr: 'Qatar', en: 'Qatar', ar: 'قطر' },
    destinationCountry: 'AE', destinationFlag: '🇦🇪', destinationCurrency: 'AED',
    destinationCountryName: { fr: 'Émirats', en: 'UAE', ar: 'الإمارات' },
    deliveryMethods: ['exchange_house', 'bank_transfer'],
    isActive: true, minAmount: 10, maxAmount: 10000,
  },
  {
    id: 'DZ-TN', sourceCountry: 'DZ', sourceFlag: '🇩🇿', sourceCurrency: 'DZD',
    sourceCountryName: { fr: 'Algérie', en: 'Algeria', ar: 'الجزائر' },
    destinationCountry: 'TN', destinationFlag: '🇹🇳', destinationCurrency: 'TND',
    destinationCountryName: { fr: 'Tunisie', en: 'Tunisia', ar: 'تونس' },
    deliveryMethods: ['d17_laposte', 'cash_pickup', 'bank_transfer'],
    isActive: true, minAmount: 10, maxAmount: 10000,
  },
];
