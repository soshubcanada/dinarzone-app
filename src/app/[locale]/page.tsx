import { redirect } from 'next/navigation';

export default function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  // For now redirect to dashboard
  redirect(`dashboard`);
}
