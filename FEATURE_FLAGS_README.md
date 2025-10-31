# DRAIS Feature Flags & Notification System

A comprehensive feature flagging and notification system for DRAIS that automatically marks new features with "NEW" badges and notifies users about system updates.

## Features

- ✅ **Smart Feature Flags**: Database-driven system for marking routes as "NEW"
- ✅ **Animated NEW Badges**: Gradient badges with pulse animations using Framer Motion
- ✅ **Auto-expiring Flags**: Features automatically stop showing "NEW" after 14 days
- ✅ **System Notifications**: Automatic notifications sent to all users about updates
- ✅ **Enhanced Bell Icon**: Improved notification system with feature update indicators
- ✅ **Interaction Tracking**: Records when users interact with new features
- ✅ **Premium UX**: Smooth animations, responsive design, and premium visual effects
- ✅ **Performance Optimized**: Uses SWR for caching and background sync
- ✅ **Scheduled Cleanup**: Automatic cleanup of expired feature flags

## Current NEW Features

### Students Module
- **Student List** - Enhanced with fingerprint support and advanced filtering
- **Student Attendance** - Comprehensive attendance tracking system
- **Requirements** - Track and manage student requirements per term
- **Contacts** - Manage guardian and family contact information  
- **Documents** - Upload and manage student documents
- **Academic History** - View comprehensive academic performance records

### Staff Module
- **Staff Overview** - Comprehensive staff dashboard with analytics
- **Staff List** - Enhanced staff management with new capabilities
- **Add Staff** - Streamlined staff onboarding process
- **Staff Attendance** - Staff attendance tracking system
- **Departments** - Manage school departments and hierarchies
- **Work Plans** - Create and track departmental work plans

### System Features
- **Notifications** - Real-time notification system
- **Tahfiz System** - Complete Quranic memorization tracking

## Installation

### 1. Database Setup

```bash
mysql -u username -p password drais_school < database/Database/DRAIS.sql
```

### 2. Environment Configuration

```bash
# Add to .env.local
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Install Dependencies

```bash
npm install framer-motion lucide-react swr
```

### 4. Setup Cron Jobs

```bash
# Add to crontab for automatic cleanup
0 */6 * * * cd /path/to/drais && node workers/processNotifications.js
```

## Usage

### Automatic Badge Display

The system automatically shows "NEW" badges for any route flagged in the `feature_flags` table:

```sql
INSERT INTO feature_flags (route_path, label, is_new, expires_at) VALUES
('/new-feature', 'New Feature', TRUE, DATE_ADD(NOW(), INTERVAL 14 DAY));
```

### Manual Feature Flag Management

```typescript
// Add new feature flag
const response = await fetch('/api/feature-flags', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    route_name: 'new-feature',
    route_path: '/new-feature',
    label: 'New Feature',
    description: 'Description of the new feature',
    is_new: true,
    category: 'students',
    expires_in_days: 14
  })
});
```

### Using the Hook

```typescript
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const { isRouteNew, recordInteraction } = useFeatureFlags();

// Check if route is new
const isNew = isRouteNew('/students/list');

// Record user interaction
recordInteraction('/students/list', 'clicked');
```

## Components

### NewBadge Component

```tsx
import NewBadge from '@/components/ui/NewBadge';

<NewBadge size="sm" animated />
```

### Feature Update Notification

The `FeatureUpdateNotification` component automatically appears when new features are available and provides an overview of all new functionality.

## API Endpoints

- `GET /api/feature-flags` - Get all feature flags
- `POST /api/feature-flags` - Create new feature flag
- `POST /api/feature-flags/interact` - Record user interaction

## Database Tables

### feature_flags
- Stores feature flag definitions
- Auto-expires based on `expires_at` timestamp
- Categories: students, staff, academics, system

### user_feature_interactions  
- Tracks user interactions with new features
- Types: viewed, clicked, dismissed

### notifications
- System notifications about updates
- Supports rich metadata and priorities

## Customization

### Badge Styling

Modify `src/components/ui/NewBadge.tsx` for custom styling:

```typescript
const variantClasses = {
  gradient: 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white',
  solid: 'bg-emerald-500 text-white',
  outline: 'border border-emerald-500 text-emerald-600'
};
```

### Auto-Cleanup Schedule

Feature flags automatically expire after 14 days. Modify in the database:

```sql
UPDATE feature_flags SET expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY);
```

## Performance Notes

- Feature flags are cached for 1 minute using SWR
- Database queries are optimized with proper indexes
- Real-time updates use minimal network requests
- Badge animations use CSS transforms for optimal performance

## Troubleshooting

### Badges Not Appearing

1. Check database connection
2. Verify feature flags exist with `is_new = TRUE`
3. Ensure routes match exactly in `route_path`

### Slow Performance

1. Check database indexes exist
2. Verify SWR caching is working
3. Monitor network requests in dev tools

### Cleanup Not Working

1. Verify cron job is configured
2. Check worker script permissions
3. Monitor log files for errors

## Future Enhancements

- [ ] User-specific feature flags
- [ ] A/B testing support
- [ ] Feature flag analytics dashboard
- [ ] Integration with external feature flag services
- [ ] Role-based feature access

## Support

For issues or questions about the feature flags system, check:

1. Database logs for errors
2. Browser console for JavaScript errors  
3. Network tab for failed API requests
4. Cron logs for cleanup issues

The system is designed to fail gracefully - if feature flags can't be loaded, the UI will simply show no badges rather than breaking.
