# Quick Start: Mobile Development

Fast setup guide for mobile web and native app development.

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

### 3. Setup Database
```bash
npm run db:push
```

### 4. Start Development
```bash
npm run dev
```

Visit: http://localhost:3000

## 📱 Test Mobile Web (Immediately)

### Chrome DevTools
1. Open DevTools: `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Toggle device toolbar: `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)
3. Select device: iPhone 14 Pro, Galaxy S21, etc.

### Test on Real Device
1. Find your computer's IP:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Visit on mobile: `http://YOUR_IP:3000`
   - Make sure mobile is on same WiFi network
   - Example: `http://192.168.1.100:3000`

## 📲 Install as PWA (30 seconds)

### iOS (Safari)
1. Visit the site on iPhone
2. Tap Share button (square with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Visit the site on Android
2. Tap menu (3 dots)
3. Tap "Install app" or "Add to Home screen"

### Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click to install
3. App opens in standalone window

## 🍎 Build iOS App (macOS only)

### First Time Setup
```bash
# Install Capacitor and iOS platform
npm install
npm run cap:init  # Run once
npm run cap:add:ios  # Run once
```

### Every Build
```bash
# Build and open Xcode
npm run ios
```

This will:
1. Build Next.js app
2. Sync to iOS project
3. Open Xcode

In Xcode:
1. Select simulator or device
2. Click ▶️ Run button
3. App launches on device/simulator

**Requirements:**
- macOS 12+
- Xcode 14+
- iOS Simulator or device

## 🤖 Build Android App

### First Time Setup
```bash
# Install Capacitor and Android platform
npm install
npm run cap:init  # Run once
npm run cap:add:android  # Run once
```

### Every Build
```bash
# Build and open Android Studio
npm run android
```

This will:
1. Build Next.js app
2. Sync to Android project
3. Open Android Studio

In Android Studio:
1. Wait for Gradle sync
2. Select emulator or device
3. Click ▶️ Run button
4. App launches on device/emulator

**Requirements:**
- Android Studio
- Android SDK 33+
- Android Emulator or device

## 🎨 Mobile Components

### Bottom Navigation (Auto-enabled on mobile)
```tsx
// Already configured in layout.tsx
// Shows on screens < 1024px
// 5 main tabs: Dashboard, Campaigns, Ads, Leads, Analytics
```

### Action Sheet (Mobile-friendly dialogs)
```tsx
import { MobileActionSheet, ActionSheetItem } from "@/components/ui/mobile-action-sheet";

const [open, setOpen] = useState(false);

<MobileActionSheet open={open} onOpenChange={setOpen} title="Actions">
  <ActionSheetItem icon={<Edit />} onClick={() => {}}>
    Edit
  </ActionSheetItem>
  <ActionSheetItem icon={<Trash />} destructive>
    Delete
  </ActionSheetItem>
</MobileActionSheet>
```

### Floating Action Button
```tsx
import { FloatingActionButton } from "@/components/ui/floating-action-button";

<FloatingActionButton
  icon={<Plus />}
  onClick={() => router.push('/campaigns/new')}
/>
```

### Swipeable Cards
```tsx
import { SwipeableCard } from "@/components/ui/swipeable-card";

<SwipeableCard
  onSwipeLeft={handleDelete}
  leftAction={{ icon: <Trash />, color: "#ef4444" }}
>
  <Card>...</Card>
</SwipeableCard>
```

### Pull to Refresh
```tsx
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

<PullToRefresh onRefresh={async () => await refetch()}>
  <YourContent />
</PullToRefresh>
```

## 🎯 Mobile-First Styling

### Responsive Classes (Tailwind)
```tsx
// Mobile first: base styles are mobile, then override for larger screens

<div className="text-sm lg:text-base">
  {/* Small text on mobile, base on desktop */}
</div>

<div className="p-4 lg:p-6">
  {/* Less padding on mobile */}
</div>

<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 column mobile, 2 tablet, 4 desktop */}
</div>

<Button className="w-full lg:w-auto">
  {/* Full width on mobile, auto on desktop */}
</Button>
```

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px (desktop)
- `xl`: 1280px
- `2xl`: 1536px

## 🔍 Platform Detection

### Check if Mobile
```tsx
import { useIsMobile } from "@/lib/hooks/use-platform";

function MyComponent() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

### Check Platform (iOS/Android/Web)
```tsx
import { usePlatform, useIsNativeApp } from "@/lib/hooks/use-platform";

function MyComponent() {
  const platform = usePlatform(); // "web" | "ios" | "android"
  const isNative = useIsNativeApp(); // true if in Capacitor app

  if (platform === "ios") {
    // iOS-specific code
  }
}
```

## 🚨 Common Issues

### Mobile web not working
```bash
# Check if server is running on all interfaces
# Edit package.json:
"dev": "next dev -H 0.0.0.0"

# Restart server
npm run dev
```

### Can't access from mobile device
- Check both devices on same WiFi
- Check firewall allows port 3000
- Use IP address, not localhost

### Capacitor sync errors
```bash
# Clean and rebuild
npm run cap:sync
```

### iOS build fails in Xcode
- Make sure Xcode is updated
- Try cleaning: Product > Clean Build Folder
- Check iOS Deployment Target is 13.0+

### Android build fails
- Check Java version: `java -version` (need Java 17)
- Check Android SDK installed
- Gradle sync may take time on first build

## 📚 Next Steps

1. **Read Full Docs**
   - [MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md) - Complete mobile guide
   - [README.md](./README.md) - Project overview
   - [STRUCTURE.md](./STRUCTURE.md) - Code organization

2. **Build Features**
   - Start with responsive layout
   - Add touch interactions
   - Test on real devices
   - Optimize performance

3. **Test Thoroughly**
   - Test on iOS (Safari)
   - Test on Android (Chrome)
   - Test on different screen sizes
   - Test offline behavior

4. **Deploy**
   - Deploy web version to Vercel
   - Submit iOS app to App Store
   - Submit Android app to Google Play

## 🎓 Learning Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Next.js Mobile](https://nextjs.org/docs/advanced-features/progressive-web-apps)
- [Tailwind Responsive](https://tailwindcss.com/docs/responsive-design)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design (Android)](https://m3.material.io/)

## 💡 Pro Tips

1. **Always test on real devices** - Simulators don't show real performance
2. **Use mobile-first CSS** - Easier to scale up than down
3. **Touch targets 44x44px minimum** - Comfortable for fingers
4. **Test on slow networks** - Use Chrome DevTools throttling
5. **Optimize images** - Use WebP format, correct sizes
6. **Keep bundles small** - Code-split heavy components
7. **Use system fonts** - Faster, native feel
8. **Provide feedback** - Loading states, haptics, toasts
9. **Handle offline gracefully** - Show helpful messages
10. **Test landscape mode** - Not just portrait

---

**Happy mobile coding! 🚀📱**

For questions or issues, check the documentation or create an issue.
