/**
 * Cleanup Duplicate Campaigns - Browser Console Script
 *
 * INSTRUCTIONS:
 * 1. Open https://sme-ad-builder.vercel.app in your browser
 * 2. Open DevTools (F12 or Right-click > Inspect)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter
 * 6. Refresh the page to see cleaned campaign list
 */

console.log('🧹 Starting cleanup of duplicate campaigns...');

try {
  // Get campaigns from localStorage
  const campaignsRaw = localStorage.getItem('campaigns');
  if (!campaignsRaw) {
    console.log('✅ No campaigns found in localStorage');
    throw new Error('No campaigns to clean');
  }

  const campaigns = JSON.parse(campaignsRaw);
  console.log(`📊 Found ${campaigns.length} total campaigns`);

  // Group campaigns by name (case-insensitive)
  const campaignsByName = {};
  campaigns.forEach((campaign) => {
    const key = campaign.name.toLowerCase();
    if (!campaignsByName[key]) {
      campaignsByName[key] = [];
    }
    campaignsByName[key].push(campaign);
  });

  // Find duplicates
  const duplicateGroups = Object.entries(campaignsByName).filter(
    ([_, campaigns]) => campaigns.length > 1
  );

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicates found!');
    throw new Error('No duplicates to clean');
  }

  console.log(`⚠️  Found ${duplicateGroups.length} duplicate campaign names:`);
  duplicateGroups.forEach(([name, campaigns]) => {
    console.log(`  - "${name}": ${campaigns.length} copies`);
  });

  // Keep only the most recent campaign for each duplicate group
  const uniqueCampaigns = [];
  const removedIds = [];

  Object.entries(campaignsByName).forEach(([name, campaignGroup]) => {
    if (campaignGroup.length === 1) {
      // No duplicates, keep as is
      uniqueCampaigns.push(campaignGroup[0]);
    } else {
      // Multiple duplicates - keep the most recent one
      const sorted = campaignGroup.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Most recent first
      });

      uniqueCampaigns.push(sorted[0]); // Keep most recent
      sorted.slice(1).forEach(campaign => {
        removedIds.push(campaign.id);
      });

      console.log(`  ✂️  Keeping most recent "${name}" (ID: ${sorted[0].id}), removing ${sorted.length - 1} duplicates`);
    }
  });

  // Save cleaned campaigns
  localStorage.setItem('campaigns', JSON.stringify(uniqueCampaigns));

  // Clean up associated ads for removed campaigns
  const adsRaw = localStorage.getItem('ads');
  if (adsRaw) {
    const ads = JSON.parse(adsRaw);
    const cleanedAds = ads.filter((ad) => !removedIds.includes(ad.campaignId));
    const removedAdsCount = ads.length - cleanedAds.length;

    if (removedAdsCount > 0) {
      localStorage.setItem('ads', JSON.stringify(cleanedAds));
      console.log(`🗑️  Removed ${removedAdsCount} orphaned ads`);
    }
  }

  console.log(`✅ Cleanup complete!`);
  console.log(`   - Campaigns before: ${campaigns.length}`);
  console.log(`   - Campaigns after: ${uniqueCampaigns.length}`);
  console.log(`   - Removed: ${removedIds.length} duplicates`);
  console.log('');
  console.log('🔄 Refresh the page to see the changes');

} catch (error) {
  if (error.message !== 'No campaigns to clean' && error.message !== 'No duplicates to clean') {
    console.error('❌ Error during cleanup:', error);
  }
}
