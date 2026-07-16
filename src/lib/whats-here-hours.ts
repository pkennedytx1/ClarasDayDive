export type WhatsHereHoursStatus = {
  isOpen: boolean;
  label: string;
};

type DaySchedule = {
  days: number[];
  closed: boolean;
  openMinutes?: number;
  closeMinutes?: number;
  closesNextDay?: boolean;
};

const DAY_INDEX: Record<string, number> = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  weds: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

function dayTokenToIndex(token: string): number | null {
  const normalized = token.trim().toLowerCase().replace(/\./g, '');
  if (normalized === 'daily') return -1;
  return DAY_INDEX[normalized] ?? DAY_INDEX[normalized.slice(0, 3)] ?? null;
}

function expandDayRange(part: string): number[] {
  const trimmed = part.trim();
  if (/^daily$/i.test(trimmed)) return [0, 1, 2, 3, 4, 5, 6];

  const rangeParts = trimmed.split(/\s*[-–]\s*/);
  if (rangeParts.length === 2) {
    const start = dayTokenToIndex(rangeParts[0]);
    const end = dayTokenToIndex(rangeParts[1]);
    if (start == null || end == null || start === -1 || end === -1) return [];

    const days: number[] = [];
    for (let day = start; day <= end; day += 1) days.push(day);
    return days;
  }

  const single = dayTokenToIndex(trimmed);
  if (single == null) return [];
  if (single === -1) return [0, 1, 2, 3, 4, 5, 6];
  return [single];
}

function parseTimeToken(token: string): number | null {
  const value = token.trim().toLowerCase();
  if (value === 'noon') return 720;
  if (value === 'midnight') return 0;

  const match = value.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? '0');
  const period = match[3];

  if (hour === 12) hour = 0;
  if (period === 'pm') hour += 12;

  return hour * 60 + minute;
}

function parseTimeRange(value: string): { openMinutes: number; closeMinutes: number; closesNextDay: boolean } | null {
  const trimmed = value.trim();
  if (!trimmed || /^closed$/i.test(trimmed)) return null;

  const [openToken, closeToken] = trimmed.split(/\s*[-–]\s*/);
  const openMinutes = parseTimeToken(openToken);
  const closeMinutes = parseTimeToken(closeToken);
  if (openMinutes == null || closeMinutes == null) return null;

  // 12pm–12am means until midnight same day, not overnight into the next morning.
  if (closeMinutes === 0 && openMinutes > closeMinutes && openMinutes >= 720 && /am$/i.test(closeToken.trim())) {
    return { openMinutes, closeMinutes: 1440, closesNextDay: false };
  }

  const closesNextDay = closeMinutes <= openMinutes;
  return {
    openMinutes,
    closeMinutes: closesNextDay ? closeMinutes : closeMinutes === 0 ? 1440 : closeMinutes,
    closesNextDay,
  };
}

function parseScheduleSegment(segment: string): DaySchedule | null {
  const match = segment.trim().match(/^(.+?)\s·\s(.+)$/);
  if (!match) return null;

  const days = expandDayRange(match[1]);
  if (!days.length) return null;

  const timePart = match[2].trim();
  if (/^closed$/i.test(timePart)) {
    return { days, closed: true };
  }

  const range = parseTimeRange(timePart);
  if (!range) return null;

  return {
    days,
    closed: false,
    openMinutes: range.openMinutes,
    closeMinutes: range.closeMinutes,
    closesNextDay: range.closesNextDay,
  };
}

export function parseWhatsHereHours(hours: string): DaySchedule[] {
  return hours
    .split(',')
    .map(parseScheduleSegment)
    .filter((entry): entry is DaySchedule => entry != null);
}

export function getWhatsHereHoursLines(hours: string): string[] {
  return hours
    .split(',')
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatMinutesForDisplay(minutes: number): string {
  if (minutes >= 1440 || minutes === 0) return 'midnight';

  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const period = hour24 >= 12 ? 'pm' : 'am';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  if (minute === 0) return `${hour12}${period}`;
  return `${hour12}:${String(minute).padStart(2, '0')}${period}`;
}

function isOpenNow(schedule: DaySchedule, nowMinutes: number): boolean {
  if (schedule.closed || schedule.openMinutes == null || schedule.closeMinutes == null) return false;

  if (schedule.closesNextDay) {
    return nowMinutes >= schedule.openMinutes || nowMinutes < schedule.closeMinutes;
  }

  return nowMinutes >= schedule.openMinutes && nowMinutes < schedule.closeMinutes;
}

function closeLabel(schedule: DaySchedule): string {
  if (schedule.closeMinutes == null) return 'Closed';
  if (schedule.closesNextDay) {
    return formatMinutesForDisplay(schedule.closeMinutes);
  }
  if (schedule.closeMinutes >= 1440) return 'midnight';
  return formatMinutesForDisplay(schedule.closeMinutes);
}

function openLabel(schedule: DaySchedule): string {
  if (schedule.openMinutes == null) return 'Closed today';
  return formatMinutesForDisplay(schedule.openMinutes);
}

function closedTodayLabel(): WhatsHereHoursStatus {
  return { isOpen: false, label: 'Closed today' };
}

function closedOpensLaterLabel(schedule: DaySchedule): WhatsHereHoursStatus {
  return { isOpen: false, label: `Closed · Opens at ${openLabel(schedule)}` };
}

export function getWhatsHereHoursStatus(hours: string, now = new Date()): WhatsHereHoursStatus {
  const schedules = parseWhatsHereHours(hours);
  const day = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const previousDay = (day + 6) % 7;

  const overnightSchedule = schedules.find(
    (entry) =>
      entry.days.includes(previousDay) &&
      !entry.closed &&
      entry.closesNextDay &&
      entry.closeMinutes != null &&
      nowMinutes < entry.closeMinutes,
  );

  if (overnightSchedule) {
    return {
      isOpen: true,
      label: `Open until ${closeLabel(overnightSchedule)}`,
    };
  }

  const todaySchedule = schedules.find((entry) => entry.days.includes(day));
  if (!todaySchedule || todaySchedule.closed) {
    return closedTodayLabel();
  }

  if (isOpenNow(todaySchedule, nowMinutes)) {
    return {
      isOpen: true,
      label: `Open until ${closeLabel(todaySchedule)}`,
    };
  }

  if (todaySchedule.openMinutes != null && nowMinutes < todaySchedule.openMinutes) {
    return closedOpensLaterLabel(todaySchedule);
  }

  return closedTodayLabel();
}
