/**
 * Validation utilities for extracted schedule data
 */

import { logger } from "@/lib/logger";
import type { NormalizedCourse, NormalizedAcademicEvent } from "./normalization";

export interface ValidationIssue {
  field: string;
  value: any;
  issue: string;
  suggestion?: string;
}

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  issues: ValidationIssue[];
}

/**
 * Validate time range (end must be after start)
 */
export function validateTimeRange(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false;
  
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  return endMinutes > startMinutes;
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
  return /^\d{2}:\d{2}$/.test(time) && 
    parseInt(time.split(":")[0]) < 24 && 
    parseInt(time.split(":")[1]) < 60;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Validate a normalized course
 */
export function validateCourse(course: NormalizedCourse): ValidationResult<NormalizedCourse> {
  const issues: ValidationIssue[] = [];
  
  // Validate name
  if (!course.name || course.name.trim().length === 0) {
    issues.push({
      field: "name",
      value: course.name,
      issue: "Course name is empty",
      suggestion: "Please provide a course name",
    });
  }
  
  // Validate day
  const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  if (!validDays.includes(course.day)) {
    issues.push({
      field: "day",
      value: course.day,
      issue: "Invalid day",
      suggestion: "Use standard day name (Monday-Sunday)",
    });
  }
  
  // Validate time format
  if (!isValidTimeFormat(course.startTime)) {
    issues.push({
      field: "startTime",
      value: course.startTime,
      issue: "Invalid start time format",
      suggestion: "Use HH:MM format (24-hour)",
    });
  }
  
  if (!isValidTimeFormat(course.endTime)) {
    issues.push({
      field: "endTime",
      value: course.endTime,
      issue: "Invalid end time format",
      suggestion: "Use HH:MM format (24-hour)",
    });
  }
  
  // Validate time range
  if (!validateTimeRange(course.startTime, course.endTime)) {
    issues.push({
      field: "time",
      value: `${course.startTime} - ${course.endTime}`,
      issue: "End time must be after start time",
    });
  }
  
  // Validate duration (30min - 4 hours as per spec)
  const [startH, startM] = course.startTime.split(":").map(Number);
  const [endH, endM] = course.endTime.split(":").map(Number);
  const duration = (endH * 60 + endM) - (startH * 60 + startM);
  
  if (duration < 30) {
    issues.push({
      field: "duration",
      value: duration,
      issue: "Duration too short (minimum 30 minutes)",
    });
  }
  
  if (duration > 240) {
    issues.push({
      field: "duration",
      value: duration,
      issue: "Duration too long (maximum 4 hours)",
    });
  }
  
  return {
    valid: issues.length === 0,
    data: issues.length === 0 ? course : undefined,
    issues,
  };
}

/**
 * Validate a normalized academic event
 */
export function validateAcademicEvent(event: NormalizedAcademicEvent): ValidationResult<NormalizedAcademicEvent> {
  const issues: ValidationIssue[] = [];
  
  // Validate name
  if (!event.name || event.name.trim().length === 0) {
    issues.push({
      field: "name",
      value: event.name,
      issue: "Event name is empty",
    });
  }
  
  // Validate date
  if (!isValidDateFormat(event.date)) {
    issues.push({
      field: "date",
      value: event.date,
      issue: "Invalid date format",
      suggestion: "Use YYYY-MM-DD format",
    });
  }
  
  // Validate type
  const validTypes: ("exam" | "deadline" | "holiday" | "event")[] = ["exam", "deadline", "holiday", "event"];
  if (!validTypes.includes(event.type)) {
    issues.push({
      field: "type",
      value: event.type,
      issue: "Invalid event type",
      suggestion: "Use: exam, deadline, holiday, or event",
    });
  }
  
  return {
    valid: issues.length === 0,
    data: issues.length === 0 ? event : undefined,
    issues,
  };
}

/**
 * Validate extracted schedule batch
 */
export function validateExtractedSchedule(
  courses: NormalizedCourse[],
  academicEvents: NormalizedAcademicEvent[] = []
): {
  validCourses: NormalizedCourse[];
  validEvents: NormalizedAcademicEvent[];
  errors: ValidationIssue[];
} {
  const validCourses: NormalizedCourse[] = [];
  const validEvents: NormalizedAcademicEvent[] = [];
  const errors: ValidationIssue[] = [];
  
  for (const course of courses) {
    const result = validateCourse(course);
    if (result.valid) {
      validCourses.push(course);
    } else {
      errors.push(...result.issues);
    }
  }
  
  for (const event of academicEvents) {
    const result = validateAcademicEvent(event);
    if (result.valid) {
      validEvents.push(event);
    } else {
      errors.push(...result.issues);
    }
  }
  
  return {
    validCourses,
    validEvents,
    errors,
  };
}

/**
 * Check for uncertain/conflicting data that needs user review
 */
export function needsReview(
  course: NormalizedCourse,
  existingEvents: any[]
): { needsReview: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Check if time slot is already occupied
  const [startH, startM] = course.startTime.split(":").map(Number);
  const [endH, endM] = course.endTime.split(":").map(Number);
  
  for (const existing of existingEvents) {
    if (existing.day === course.day) {
      const [eStartH, eStartM] = existing.startTime.split(":").map(Number);
      const [eEndH, eEndM] = existing.endTime.split(":").map(Number);
      
      const newStart = startH * 60 + startM;
      const newEnd = endH * 60 + endM;
      const existStart = eStartH * 60 + eStartM;
      const existEnd = eEndH * eEndM;
      
      if (newStart < existEnd && existStart < newEnd) {
        reasons.push(`Conflict with "${existing.title}" (${existing.startTime}-${existing.endTime})`);
      }
    }
  }
  
  return {
    needsReview: reasons.length > 0,
    reasons,
  };
}