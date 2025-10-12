import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { CampaignDetailClient } from '@/components/campaigns/campaign-detail-client';

export const metadata = {
  title: 'Campaign Details | SME Ad Builder',
  description: 'View campaign details and performance',
};

interface CampaignDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return <CampaignDetailClient campaignId={params.id} />;
}
