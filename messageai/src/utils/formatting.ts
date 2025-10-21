/**
 * Format timestamp for message display
 * Returns relative time like "Just now", "10:43 AM", "Yesterday", "Mon 3:45 PM"
 */
export function formatMessageTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Calculate time difference in milliseconds
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  // Less than 1 minute ago
  if (diffMins < 1) {
    return 'Just now';
  }
  
  // Less than 1 hour ago
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  
  // Today - show time only
  if (isSameDay(date, now)) {
    return formatTime(date);
  }
  
  // Yesterday
  if (diffDays === 1) {
    return `Yesterday ${formatTime(date)}`;
  }
  
  // This week - show day name
  if (diffDays < 7) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${dayNames[date.getDay()]} ${formatTime(date)}`;
  }
  
  // This year - show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return `${formatShortDate(date)} ${formatTime(date)}`;
  }
  
  // Older - show full date
  return `${formatFullDate(date)} ${formatTime(date)}`;
}

/**
 * Format time as "10:43 AM"
 */
export function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  
  return `${hours}:${minutesStr} ${ampm}`;
}

/**
 * Format short date as "Jan 15"
 */
export function formatShortDate(date: Date): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Format full date as "Jan 15, 2024"
 */
export function formatFullDate(date: Date): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Format last seen timestamp for conversation list
 * Returns: "Just now", "5m ago", "2h ago", "Yesterday", "Mon", "Jan 15"
 */
export function formatLastSeen(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  }
  
  return formatShortDate(date);
}

