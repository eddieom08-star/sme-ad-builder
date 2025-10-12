import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { WizardContainer } from '@/components/campaign-wizard/wizard-container';
import { CampaignWizardClient } from './wizard-client';

export const metadata = {
  title: 'Create Campaign | SME Ad Builder',
  description: 'Create a new advertising campaign',
};

export default async function NewCampaignPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <WizardContainer>
      <CampaignWizardClient />
    </WizardContainer>
  );
}
