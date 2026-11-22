import { settingsService } from './supabaseService';

const STORAGE_KEY = 'desh_public_visits_cache';
const SESSION_KEY = 'desh_last_visit_timestamp';

// Helper to format date in YYYY-MM-DD (Sri Lanka local date)
export function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const visitTracker = {
  /**
   * Record a new visitor session on the public site.
   * Increments the live count by 1 and persists to Supabase and localStorage.
   */
  async recordVisit() {
    try {
      if (typeof window === 'undefined') return;

      // Prevent spamming on immediate multi-render within 5 seconds in the same tab
      const lastVisit = sessionStorage.getItem(SESSION_KEY);
      const now = Date.now();
      if (lastVisit && now - Number(lastVisit) < 5000) {
        return;
      }
      sessionStorage.setItem(SESSION_KEY, now.toString());

      const today = getLocalDateString();

      // Read current remote data from Supabase
      let visits = {};
      try {
        const remote = await settingsService.getSetting('public_site_visits');
        if (remote && remote.daily && typeof remote.daily === 'object') {
          visits = { ...remote.daily };
        }
      } catch (err) {
        console.warn('Error reading remote visits:', err);
      }

      // Check localStorage if remote was empty
      if (Object.keys(visits).length === 0) {
        try {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) visits = JSON.parse(cached);
        } catch (e) {
          visits = {};
        }
      }

      // Accurate +1 increment for today
      const currentToday = Number(visits[today] || 0);
      visits[today] = currentToday + 1;

      // Update local cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));

      // Sync to Supabase settings
      await settingsService.saveSetting('public_site_visits', {
        daily: visits,
        lastUpdated: new Date().toISOString()
      });

      return visits[today];
    } catch (err) {
      console.warn('Failed to record visit:', err);
    }
  },

  /**
   * Get formatted daily visits history for Admin Dashboard line chart
   * @param {string|number} filterOrDays - 'month' or number of days (7, 14, 30)
   */
  async getDailyVisits(filterOrDays = 'month') {
    let visits = {};

    // 1. Fetch fresh data from Supabase settings
    try {
      const remote = await settingsService.getSetting('public_site_visits');
      if (remote && remote.daily && typeof remote.daily === 'object') {
        visits = remote.daily;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
      }
    } catch (err) {
      console.warn('Error loading remote visits:', err);
    }

    // 2. Check local cache fallback
    if (Object.keys(visits).length === 0) {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) visits = JSON.parse(cached);
      } catch (e) {
        visits = {};
      }
    }

    const result = [];
    const now = new Date();
    const todayStr = getLocalDateString(now);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (filterOrDays === 'month') {
      // Return all days from the 1st of current month up to today
      const daysCount = now.getDate();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      for (let dayNum = 1; dayNum <= daysCount; dayNum++) {
        const d = new Date(currentYear, currentMonth, dayNum);
        const dateKey = getLocalDateString(d);
        const count = Number(visits[dateKey] || 0);

        const displayDate = `${months[d.getMonth()]} ${d.getDate()}`;
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        const mobile = Math.round(count * 0.68);
        const desktop = Math.max(0, count - mobile);

        result.push({
          date: dateKey,
          displayDate,
          dayName,
          visits: count,
          mobile,
          desktop,
          isToday: dateKey === todayStr
        });
      }
    } else {
      const days = Number(filterOrDays) || 14;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = getLocalDateString(d);
        const count = Number(visits[dateKey] || 0);

        const displayDate = `${months[d.getMonth()]} ${d.getDate()}`;
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

        const mobile = Math.round(count * 0.68);
        const desktop = Math.max(0, count - mobile);

        result.push({
          date: dateKey,
          displayDate,
          dayName,
          visits: count,
          mobile,
          desktop,
          isToday: dateKey === todayStr
        });
      }
    }

    return result;
  }
};
