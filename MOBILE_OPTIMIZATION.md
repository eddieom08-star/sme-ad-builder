# Mobile Optimization Guide

This document explains the mobile-first design and native app compilation setup for the SME Ad Builder platform.

## Overview

The application is optimized for three deployment targets:
1. **Web (Desktop)** - Full-featured desktop web experience
2. **Mobile Web** - Responsive mobile browser experience with PWA support
3. **Native Mobile Apps** - iOS and Android apps via Capacitor

## Mobile-First Design

### Responsive Layouts

All layouts use a mobile-first approach with Tailwind CSS breakpoints:

```tsx
// Mobile-first: base styles apply to mobile, then override for larger screens
<div className="text-sm lg:text-base">  // Small text on mobile, base on desktop
<div className="p-4 lg:p-6">           // Less padding on mobile
<div className="grid-cols-2 lg:grid-cols-4">  // 2 columns mobile, 4 desktop
```

#### Breakpoints
- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)
- `2xl`: 1536px (extra large)

### Navigation

#### Desktop Navigation
- Fixed sidebar navigation (`components/dashboard/responsive-sidebar.tsx`)
- Always visible on screens ≥1024px

#### Mobile Navigation
- Bottom tab navigation (`components/dashboard/mobile-nav.tsx`)
- Fixed at bottom of screen
- 5 main navigation items
- Icon + label for easy touch targets

#### Mobile Header
- Simplified header with page title
- Quick access to settings
- No user menu (moved to bottom nav)

### Touch-Optimized Components

#### 1. Mobile Action Sheet
```tsx
import { MobileActionSheet, ActionSheetItem } from "@/components/ui/mobile-action-sheet";

<MobileActionSheet open={open} onOpenChange={setOpen} title="Actions">
  <ActionSheetItem icon={<Edit />} onClick={handleEdit}>
    Edit Campaign
  </ActionSheetItem>
  <ActionSheetItem icon={<Trash />} onClick={handleDelete} destructive>
    Delete
  </ActionSheetItem>
</MobileActionSheet>
```

#### 2. Swipeable Cards
```tsx
import { SwipeableCard } from "@/components/ui/swipeable-card";

<SwipeableCard
  onSwipeLeft={handleDelete}
  onSwipeRight={handleArchive}
  leftAction={{ icon: <Trash />, color: "#ef4444" }}
  rightAction={{ icon: <Archive />, color: "#3b82f6" }}
>
  <CampaignCard campaign={campaign} />
</SwipeableCard>
```

#### 3. Pull to Refresh
```tsx
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

<PullToRefresh onRefresh={async () => await refetchData()}>
  <CampaignList campaigns={campaigns} />
</PullToRefresh>
```

#### 4. Floating Action Button
```tsx
import { FloatingActionButton } from "@/components/ui/floating-action-button";

<FloatingActionButton
  icon={<Plus />}
  onClick={() => router.push('/campaigns/new')}
  position="bottom-right"
/>
```

### Responsive Forms

Use responsive form components for better mobile UX:

```tsx
import { ResponsiveForm, FormSection, FormActions } from "@/components/forms/responsive-form";

<ResponsiveForm onSubmit={handleSubmit}>
  <FormSection title="Campaign Details" description="Basic information">
    <Input name="name" label="Campaign Name" />
    <Select name="platform" label="Platform" />
  </FormSection>

  <FormActions sticky>
    <Button type="submit" className="flex-1">Save</Button>
    <Button variant="outline" onClick={onCancel}>Cancel</Button>
  </FormActions>
</ResponsiveForm>
```

Features:
- Sticky action buttons on mobile
- Adjusted spacing for touch targets
- Smaller text on mobile
- Full-width buttons

## Progressive Web App (PWA)

The app is configured as a PWA for installable mobile experience.

### Features

1. **Installable** - Can be installed on home screen
2. **Offline-capable** - Service worker for offline access (when implemented)
3. **App-like** - Runs in standalone mode without browser chrome
4. **Fast** - Cached assets for quick loading

### Manifest

Located at `public/manifest.json` and `app/manifest.ts`:

```json
{
  "name": "SME Ad Builder",
  "short_name": "AdBuilder",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#2563eb"
}
```

### Installation

Users can install the PWA:
- **iOS Safari**: Share > Add to Home Screen
- **Android Chrome**: Menu > Install App
- **Desktop Chrome**: Install icon in address bar

### Shortcuts

PWA includes app shortcuts for quick actions:
- Dashboard
- New Campaign

## Native Mobile Apps (Capacitor)

### Setup

1. **Initialize Capacitor**
   ```bash
   npm run cap:init
   ```

2. **Add iOS Platform**
   ```bash
   npm run cap:add:ios
   ```

3. **Add Android Platform**
   ```bash
   npm run cap:add:android
   ```

4. **Build and Sync**
   ```bash
   npm run build:mobile
   ```

### Development Workflow

#### iOS Development
```bash
# Build and open Xcode
npm run ios

# Or step by step:
npm run build
npm run cap:sync
npm run cap:open:ios
```

**Requirements:**
- macOS with Xcode installed
- iOS Simulator or physical device
- Apple Developer account (for device testing)

#### Android Development
```bash
# Build and open Android Studio
npm run android

# Or step by step:
npm run build
npm run cap:sync
npm run cap:open:android
```

**Requirements:**
- Android Studio installed
- Android SDK
- Android Emulator or physical device

### Capacitor Plugins

The app includes these native plugins:

1. **App** - App state and info
2. **Browser** - In-app browser
3. **Haptics** - Vibration feedback
4. **Keyboard** - Keyboard behavior
5. **Network** - Network status
6. **Push Notifications** - Push messaging
7. **Share** - Native share sheet
8. **Splash Screen** - Launch screen
9. **Status Bar** - Status bar styling
10. **Toast** - Native toast messages

### Using Capacitor Plugins

```tsx
import { shareContent, openUrl, showToast } from "@/lib/capacitor";

// Share content
await shareContent("Check out this campaign!", "https://example.com");

// Open URL in in-app browser
await openUrl("https://example.com");

// Show native toast (Android/iOS only)
await showToast("Campaign created successfully!");
```

### Platform Detection

```tsx
import { usePlatform, useIsMobile, useIsNativeApp } from "@/lib/hooks/use-platform";

function MyComponent() {
  const platform = usePlatform(); // "web" | "ios" | "android"
  const isMobile = useIsMobile(); // true if screen < 768px
  const isNative = useIsNativeApp(); // true if running in Capacitor

  return (
    <div>
      {isNative && <NativeFeature />}
      {!isNative && <WebFeature />}
    </div>
  );
}
```

## Performance Optimization

### Image Optimization

Use Next.js Image component:
```tsx
import Image from "next/image";

<Image
  src="/campaign-image.jpg"
  alt="Campaign"
  width={800}
  height={600}
  className="rounded-lg"
  priority // For above-the-fold images
/>
```

### Code Splitting

Components are automatically code-split by Next.js. For manual splitting:

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/analytics/heavy-chart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Client-side only
});
```

### Mobile-Specific Optimizations

1. **Reduce motion** - Respect `prefers-reduced-motion`
2. **Optimize images** - Use WebP format, responsive sizes
3. **Lazy loading** - Load content as user scrolls
4. **Virtual scrolling** - For long lists (e.g., leads table)
5. **Debounced inputs** - Reduce API calls on search/filter

## Touch Interactions

### Touch Target Sizes

All interactive elements meet minimum touch target size (44x44px):

```tsx
// ✅ Good - Large enough touch target
<Button className="h-11 px-4">Click Me</Button>

// ❌ Bad - Too small for touch
<button className="text-xs p-1">Click</button>
```

### Gestures

Supported gestures:
- **Swipe left/right** - Card actions (delete, archive)
- **Pull down** - Refresh content
- **Long press** - Context menu (future)
- **Pinch zoom** - Image viewing (future)

### Haptic Feedback

Provide haptic feedback for important actions:

```tsx
import { Haptics } from '@capacitor/haptics';

const handleDelete = async () => {
  if (isNativePlatform()) {
    await Haptics.impact({ style: 'medium' });
  }
  // Delete logic
};
```

## Testing on Mobile

### Testing Mobile Web

1. **Chrome DevTools**
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Select device or responsive mode

2. **Real Device Testing**
   - Run `npm run dev`
   - Find your IP: `ifconfig` (Mac) or `ipconfig` (Windows)
   - Visit `http://YOUR_IP:3000` on mobile device

### Testing Native Apps

#### iOS
1. Build with `npm run ios`
2. Run in Xcode Simulator
3. Or deploy to device via Xcode

#### Android
1. Build with `npm run android`
2. Run in Android Emulator
3. Or use `adb` to install on device

## Deployment

### Web/PWA Deployment
Deploy to Vercel, Netlify, or any static host:
```bash
npm run build
npm run start
```

### Native App Deployment

#### iOS App Store
1. Build in Xcode with Release configuration
2. Archive the app
3. Upload to App Store Connect
4. Submit for review

#### Google Play Store
1. Build signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Submit for review

## Best Practices

### Mobile UX
- ✅ Use bottom navigation on mobile
- ✅ Provide large touch targets (min 44x44px)
- ✅ Use sticky action buttons in forms
- ✅ Show loading states for async operations
- ✅ Provide haptic feedback for key actions
- ✅ Support pull-to-refresh on list views
- ✅ Use action sheets instead of modals
- ✅ Minimize text input on mobile

### Performance
- ✅ Optimize images (WebP, correct sizes)
- ✅ Lazy load below-the-fold content
- ✅ Code-split heavy components
- ✅ Use React Query for data caching
- ✅ Minimize bundle size
- ✅ Enable compression (gzip/brotli)

### Accessibility
- ✅ Sufficient color contrast
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus indicators
- ✅ Semantic HTML

## Troubleshooting

### Common Issues

**Issue**: Content cut off by notch on iPhone
```tsx
// Solution: Use safe area insets
<div className="pt-safe pb-safe">Content</div>
```

**Issue**: Keyboard covers input on mobile
```tsx
// Solution: Configure in capacitor.config.ts
Keyboard: {
  resize: 'body',
  resizeOnFullScreen: true
}
```

**Issue**: PWA not installing
- Check manifest.json is valid
- Ensure HTTPS (required for PWA)
- Check service worker registration

**Issue**: Capacitor plugin not found
```bash
# Sync native projects
npm run cap:sync
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Framer Motion](https://www.framer.com/motion/)
