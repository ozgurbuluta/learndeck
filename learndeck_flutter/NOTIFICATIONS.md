# LearnDeck Notifications

This document tracks all notifications in the app, their content, timing, and configuration.

## Overview

LearnDeck uses local notifications (via `flutter_local_notifications`) to remind users to practice their vocabulary. All notifications are scheduled locally on the device - no server/push infrastructure required.

## Active Notifications

### 1. Daily Study Reminder

| Property | Value |
|----------|-------|
| **ID** | `0` |
| **Channel ID** | `daily_reminder` |
| **Channel Name** | Daily Reminders |
| **Title** | Time to learn! |
| **Body** | Keep your streak going - practice your vocabulary today! |
| **Schedule** | Daily at user-configured time (default: 9:00 AM) |
| **Repeat** | Yes - repeats daily at same time |
| **User Configurable** | Yes - time can be changed in Profile > Notifications |
| **Can Disable** | Yes - toggle in Profile > Notifications |

**Implementation:** `lib/services/notification_service.dart`

**Trigger:** Scheduled via `zonedSchedule()` with `DateTimeComponents.time` for daily repeat.

---

## Notification Settings Storage

Settings are stored in `SharedPreferences`:

| Key | Type | Description |
|-----|------|-------------|
| `notifications_enabled` | bool | Whether daily reminder is enabled |
| `notification_hour` | int | Hour of reminder (0-23) |
| `notification_minute` | int | Minute of reminder (0-59) |

---

## Platform Configuration

### Android
- **Icon:** `@mipmap/ic_launcher`
- **Importance:** High
- **Priority:** High
- **Channel:** `daily_reminder`

### iOS
- **Alert:** Yes
- **Badge:** Yes
- **Sound:** Yes
- Requires permission request on first enable

---

## Future Notifications (Planned)

### Streak at Risk Reminder
| Property | Value |
|----------|-------|
| **ID** | `1` (reserved) |
| **Title** | Don't lose your streak! |
| **Body** | You haven't practiced today. {X} day streak at risk! |
| **Schedule** | Evening (e.g., 8 PM) if no activity that day |
| **Status** | Not implemented |

### Weekly Progress Summary
| Property | Value |
|----------|-------|
| **ID** | `2` (reserved) |
| **Title** | Your weekly progress |
| **Body** | You learned {X} words this week! Keep it up! |
| **Schedule** | Sunday evening |
| **Status** | Not implemented |

### Review Due Reminder
| Property | Value |
|----------|-------|
| **ID** | `3` (reserved) |
| **Title** | Words ready for review |
| **Body** | {X} words are due for review. Quick session? |
| **Schedule** | When words are due (check on app open) |
| **Status** | Not implemented |

---

## Adding a New Notification

1. **Reserve an ID** in this document (avoid conflicts)
2. **Add to `notification_service.dart`:**
   - Create a new schedule method
   - Define Android/iOS notification details
   - Add any new SharedPreferences keys
3. **Add UI controls** if user-configurable
4. **Update this document** with full details

## Testing Notifications

To test notifications during development:

```dart
// Schedule a notification 10 seconds from now
await _notifications.zonedSchedule(
  99, // Test ID
  'Test Notification',
  'This is a test',
  tz.TZDateTime.now(tz.local).add(const Duration(seconds: 10)),
  details,
  androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
  uiLocalNotificationDateInterpretation:
      UILocalNotificationDateInterpretation.absoluteTime,
);
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-26 | Added daily study reminder notification |
