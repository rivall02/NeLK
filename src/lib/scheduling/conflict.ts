/**
 * Conflict detection for schedule events
 */

export interface EventTime {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  title: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictWith?: {
    title: string;
    startTime: string;
    endTime: string;
  };
}

/**
 * Check if two time ranges overlap
 * Condition: startA < endB && startB < endA
 */
export function hasTimeOverlap(
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean {
  // Convert to minutes for easier comparison
  const toMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };
  
  const t1Start = toMinutes(start1);
  const t1End = toMinutes(end1);
  const t2Start = toMinutes(start2);
  const t2End = toMinutes(end2);
  
  return t1Start < t2End && t2Start < t1End;
}

/**
 * Check if a date is the same
 */
export function isSameDate(date1: string, date2: string): boolean {
  return date1 === date2;
}

/**
 * Check for conflicts between a new event and existing events
 */
export function checkConflict(
  newEvent: EventTime,
  existingEvents: EventTime[]
): ConflictResult {
  for (const existing of existingEvents) {
    // Skip if different date
    if (!isSameDate(newEvent.date, existing.date)) {
      continue;
    }
    
    // Check time overlap
    if (hasTimeOverlap(
      newEvent.startTime, 
      newEvent.endTime,
      existing.startTime, 
      existing.endTime
    )) {
      return {
        hasConflict: true,
        conflictWith: {
          title: existing.title,
          startTime: existing.startTime,
          endTime: existing.endTime,
        },
      };
    }
  }
  
  return { hasConflict: false };
}

/**
 * Find available time slots on a given day
 * Excludes existing events (both classes and study sessions)
 */
export function findAvailableSlots(
  dayEvents: EventTime[],
  wakeTime: string = "07:00",
  sleepTime: string = "22:00"
): Array<{ start: string; end: string }> {
  // Sort events by start time
  const sorted = [...dayEvents].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );
  
  // Convert to minutes
  const wakeMinutes = wakeTime.split(":").reduce((a, b) => a * 60 + parseInt(b), 0);
  const sleepMinutes = sleepTime.split(":").reduce((a, b) => a * 60 + parseInt(b), 0);
  
  // Merge all busy periods
  const busyPeriods: Array<[number, number]> = [];
  
  for (const event of sorted) {
    const [sh, sm] = event.startTime.split(":").map(Number);
    const [eh, em] = event.endTime.split(":").map(Number);
    busyPeriods.push([sh * 60 + sm, eh * 60 + em]);
  }
  
  // Merge overlapping busy periods
  busyPeriods.sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [];
  
  for (const period of busyPeriods) {
    if (merged.length === 0 || period[0] > merged[merged.length - 1][1]) {
      merged.push([...period]);
    } else {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], period[1]);
    }
  }
  
  // Find gaps
  const slots: Array<{ start: string; end: string }> = [];
  let currentStart = wakeMinutes;
  
  for (const [busyStart, busyEnd] of merged) {
    if (busyStart > currentStart) {
      // Found a gap
      slots.push({
        start: new Date(0, 0, 0, Math.floor(currentStart / 60), currentStart % 60)
          .toISOString().slice(11, 16),
        end: new Date(0, 0, 0, Math.floor(busyStart / 60), busyStart % 60)
          .toISOString().slice(11, 16),
      });
    }
    currentStart = Math.max(currentStart, busyEnd);
  }
  
  // Add final slot until sleep time
  if (currentStart < sleepMinutes) {
    slots.push({
      start: new Date(0, 0, 0, Math.floor(currentStart / 60), currentStart % 60)
        .toISOString().slice(11, 16),
      end: new Date(0, 0, 0, Math.floor(sleepMinutes / 60), sleepMinutes % 60)
        .toISOString().slice(11, 16),
    });
  }
  
  return slots;
}