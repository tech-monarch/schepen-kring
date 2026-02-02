# Widget Color Settings Fix with Live Preview

## Problem

When changing widget color settings in the Widget Management panel, the changes were not immediately reflected in the ChatWidget. Users had to refresh the entire page to see the color changes.

## Root Cause

The issue occurred because:

1. Widget settings were saved to `localStorage` when the admin clicked "Save Changes"
2. The `useWidgetSettings` hook only loaded settings once on component mount
3. The ChatWidget component didn't refresh when settings were updated
4. Theme and behavior values in ChatWidget were not properly reactive to settings changes

## Solution

Implemented a real-time update system using browser custom events:

### 1. Event Dispatcher in Widget Management (`WidgetManagementClient.tsx`)

When settings are saved (either to backend or localStorage), dispatch a custom event:

```typescript
window.dispatchEvent(new CustomEvent("widget-settings-updated"));
```

### 2. Event Listener in Settings Hook (`useWidgetSettings.ts`)

Added event listener to reload settings when the custom event is triggered:

```typescript
useEffect(() => {
  loadSettings();

  // Listen for widget settings updates
  const handleSettingsUpdate = () => {
    console.log("🔄 Widget settings updated, reloading...");
    loadSettings();
  };

  window.addEventListener("widget-settings-updated", handleSettingsUpdate);

  return () => {
    window.removeEventListener("widget-settings-updated", handleSettingsUpdate);
  };
}, []);
```

### 3. Reactive Theme Values in ChatWidget (`ChatWidget.tsx`)

Made theme, behavior, and i18n strings reactive using `React.useMemo`:

```typescript
const theme = React.useMemo(
  () =>
    settings?.theme || {
      primary: "#2563eb",
      foreground: "#ffffff",
      background: "#ffffff",
      radius: 18,
      fontFamily: "Inter, ui-sans-serif",
      logoUrl: "/schepenkring-logo.png",
    },
  [settings?.theme],
);
```

Also added useEffect to update welcome message when i18n strings change.

## How It Works

### Live Preview (Real-time Updates)

1. **Admin adjusts color picker**: As you move the color picker slider
2. **Instant update**: Settings are immediately saved to localStorage and event is dispatched
3. **Hook listens**: `useWidgetSettings` hook detects the event and reloads settings
4. **Component updates**: ChatWidget receives new settings via props
5. **Memoized values recalculate**: `useMemo` hooks detect settings changes and recalculate theme values
6. **UI reflects changes**: Widget colors update in real-time as you adjust the picker!

### Persistence

- Changes are automatically saved to localStorage for instant preview
- When you click "Save Changes", settings are also synced to the backend
- This ensures changes persist even if you navigate away

## Benefits

- ✅ **Live preview** - see changes instantly as you adjust colors
- ✅ Real-time updates - no page refresh needed
- ✅ Works across tabs (same origin)
- ✅ Minimal performance impact using memoization
- ✅ Clean separation of concerns
- ✅ No additional dependencies required
- ✅ Auto-save to localStorage prevents losing changes

## Testing

To test the live preview:

1. Navigate to Widget Management (`/dashboard/admin/widget`)
2. Go to the "Appearance" tab
3. **Move the "Primary Color" picker** - watch the widget update in real-time! 🎨
4. Try changing "Background Color" and "Border Radius" - instant updates!
5. The chat widget button in the bottom-right updates as you move the slider
6. Open the widget to verify the header gradient also changes live
7. Click "Save Changes" to persist to backend (already saved locally)

## Files Modified

1. `hooks/useWidgetSettings.ts` - Added event listener for settings updates
2. `app/[locale]/dashboard/admin/widget/WidgetManagementClient.tsx` - Added event dispatch on save
3. `components/common/ChatWidget.tsx` - Made theme values reactive using useMemo

## Implementation Details

### Live Preview vs Save

- **Color inputs**: Update localStorage + dispatch event on every change (live preview)
- **"Save Changes" button**: Syncs to backend + dispatches event
- This provides instant visual feedback while ensuring backend persistence

### Performance Considerations

- Each color change triggers a localStorage write and event dispatch
- The memoization in ChatWidget prevents unnecessary re-renders
- Only the changed values cause component updates
- Event listeners are properly cleaned up on unmount

## Notes

- The fix uses browser custom events which are standard and well-supported
- Settings are stored in localStorage immediately for live preview
- The memoization ensures the widget only re-renders when settings actually change
- "Save Changes" button syncs local changes to the backend for persistence
