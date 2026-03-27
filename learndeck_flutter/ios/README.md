# iOS Build Configuration

## Quick Start

```bash
# Install pods
pod install --repo-update

# Open in Xcode
open Runner.xcworkspace
```

## Common Issues & Fixes

### Xcode Crashes When Opening Workspace

**Cause**: Duplicate Pod folders (e.g., "Firebase 2", "abseil 3")

**Fix**:
```bash
# Remove duplicates and reinstall
find Pods -maxdepth 1 -name "* 2" -type d -exec rm -rf {} \;
find Pods -maxdepth 1 -name "* 3" -type d -exec rm -rf {} \;
find Pods -maxdepth 1 -name "* 4" -type d -exec rm -rf {} \;
rm -rf Pods Podfile.lock
pod install --repo-update
```

### "Sandbox Not in Sync" Error

**Fix**: Run `pod install` to sync Manifest.lock with Podfile.lock.

### "Database is Locked" Error

**Cause**: Stale build processes

**Fix**:
```bash
pkill -9 xcodebuild
pkill -9 XCBuild
rm -rf ~/Library/Developer/Xcode/DerivedData/Runner-*
```

### Build for Simulator Without Signing

```bash
xcodebuild -workspace Runner.xcworkspace -scheme Runner \
  -destination 'generic/platform=iOS Simulator' \
  CODE_SIGN_IDENTITY="-" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
```

Or via Flutter:
```bash
flutter build ios --simulator --no-codesign
```

## Healthy State

A clean Pods folder should have:
- ~35 items (not 90+)
- ~95MB size (not 250MB+)
- No folders with number suffixes like "Firebase 2"

## Permissions Required

The app requires these iOS permissions (configured in Info.plist):
- Microphone (for speech recognition)
- Speech Recognition
- Notifications
