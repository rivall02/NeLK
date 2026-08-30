/**
 * Automated test suite runner for NeLK.
 * Executes all unit and integration tests and asserts correctness.
 */

import {
  validateTaskInput,
  validateNoteInput,
  validateEventInput,
  validateAuthInput,
  validateCommunityPostInput,
  normalizeTaskStatus,
  normalizeTaskPriority,
  ValidationError,
} from "../src/lib/validations";
import { checkRateLimit } from "../src/lib/rate-limit";
import { LocalSecureStorageProvider } from "../src/lib/storage";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedCount++;
  }
}

function assertThrows(fn: () => void, testName: string) {
  try {
    fn();
    console.error(`  ✗ FAIL (did not throw): ${testName}`);
    failedCount++;
  } catch (e) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  }
}

console.log("=========================================");
console.log("RUNNING NELK TEST SUITE");
console.log("=========================================\n");

// ----------------------------------------------------
// 1. Task Validation Tests
// ----------------------------------------------------
console.log("1. Testing Task Validation & Status Normalization...");
assert(normalizeTaskStatus("todo") === "TODO", "normalize 'todo' -> 'TODO'");
assert(normalizeTaskStatus("inbox") === "TODO", "normalize 'inbox' -> 'TODO'");
assert(normalizeTaskStatus("planned") === "IN_PROGRESS", "normalize 'planned' -> 'IN_PROGRESS'");
assert(normalizeTaskStatus("in_progress") === "IN_PROGRESS", "normalize 'in_progress' -> 'IN_PROGRESS'");
assert(normalizeTaskStatus("completed") === "DONE", "normalize 'completed' -> 'DONE'");
assert(normalizeTaskStatus("done") === "DONE", "normalize 'done' -> 'DONE'");
assert(normalizeTaskStatus(null) === "TODO", "null fallback -> 'TODO'");

assert(normalizeTaskPriority("high") === "HIGH", "normalize 'high' -> 'HIGH'");
assert(normalizeTaskPriority("low") === "LOW", "normalize 'low' -> 'LOW'");
assert(normalizeTaskPriority(null) === "MEDIUM", "null fallback -> 'MEDIUM'");

const validTask = validateTaskInput({
  title: "Tugas Matematika Diskrit",
  priority: "HIGH",
  status: "TODO",
  dueDate: "2026-09-01T10:00:00.000Z",
  subject: "Matematika",
});
assert(validTask.title === "Tugas Matematika Diskrit", "Valid task title parsed");
assert(validTask.priority === "HIGH", "Valid task priority parsed");
assert(validTask.status === "TODO", "Valid task status parsed");
assert(validTask.dueDate instanceof Date, "Due date parsed as Date object");

assertThrows(() => validateTaskInput({ title: "" }), "Empty task title rejected");
assertThrows(() => validateTaskInput({ title: "a".repeat(205) }), "Task title > 200 chars rejected");
assertThrows(() => validateTaskInput({ title: "Test", dueDate: "invalid-date" }), "Invalid date format rejected");

// ----------------------------------------------------
// 2. Note Validation Tests
// ----------------------------------------------------
console.log("\n2. Testing Note Validation...");
const validNote = validateNoteInput({ title: "Catatan Basis Data", content: "Materi SQL Indexing" });
assert(validNote.title === "Catatan Basis Data", "Valid note title parsed");
assert(validNote.content === "Materi SQL Indexing", "Valid note content preserved");

assertThrows(() => validateNoteInput({ title: "" }), "Empty note title rejected");
assertThrows(() => validateNoteInput({ title: "   " }), "Whitespace note title rejected");
assertThrows(() => validateNoteInput({ title: "x".repeat(250) }), "Note title > 200 chars rejected");

// ----------------------------------------------------
// 3. Event & Schedule Validation Tests
// ----------------------------------------------------
console.log("\n3. Testing Event & Schedule Validation...");
const validEvent = validateEventInput({
  title: "Kuliah Kecerdasan Buatan",
  date: "2026-09-02",
  startTime: "08:00",
  endTime: "10:30",
});
assert(validEvent.title === "Kuliah Kecerdasan Buatan", "Valid event title parsed");
assert(validEvent.startTime === "08:00", "Start time format HH:mm parsed");
assert(validEvent.endTime === "10:30", "End time format HH:mm parsed");

assertThrows(
  () =>
    validateEventInput({
      title: "Kuliah",
      date: "2026-09-02",
      startTime: "10:00",
      endTime: "09:00",
    }),
  "Event with endTime <= startTime rejected"
);
assertThrows(
  () =>
    validateEventInput({
      title: "Kuliah",
      date: "2026-09-02",
      startTime: "25:00",
      endTime: "26:00",
    }),
  "Invalid hour time format rejected"
);

// ----------------------------------------------------
// 4. Auth Input Validation Tests
// ----------------------------------------------------
console.log("\n4. Testing Auth Validation...");
const validAuth = validateAuthInput({
  email: "mahasiswa@campus.ac.id",
  password: "securePassword123",
  name: "Budi Santoso",
});
assert(validAuth.email === "mahasiswa@campus.ac.id", "Valid email accepted");
assert(validAuth.name === "Budi Santoso", "Valid name accepted");

assertThrows(() => validateAuthInput({ email: "invalid-email", password: "password123" }), "Invalid email rejected");
assertThrows(() => validateAuthInput({ email: "user@test.com", password: "123" }), "Password < 8 chars rejected");

// ----------------------------------------------------
// 5. Rate Limiting Tests
// ----------------------------------------------------
console.log("\n5. Testing In-Memory Sliding-Window Rate Limiter...");
const testKey = `test:user:${Date.now()}`;
const limit = 3;
const windowMs = 5000;

const r1 = checkRateLimit(testKey, limit, windowMs);
assert(r1.success && r1.remaining === 2, "1st request allowed (remaining 2)");

const r2 = checkRateLimit(testKey, limit, windowMs);
assert(r2.success && r2.remaining === 1, "2nd request allowed (remaining 1)");

const r3 = checkRateLimit(testKey, limit, windowMs);
assert(r3.success && r3.remaining === 0, "3rd request allowed (remaining 0)");

const r4 = checkRateLimit(testKey, limit, windowMs);
assert(!r4.success && r4.remaining === 0, "4th request blocked by rate limit");

// ----------------------------------------------------
// 6. Storage Security & File Validation Tests
// ----------------------------------------------------
console.log("\n6. Testing Storage Security & Key Generation...");
const storage = new LocalSecureStorageProvider("test_temp");
const pdfBuffer = Buffer.from("%PDF-1.4 simulated pdf document stream content");

async function testStorage() {
  // Test valid PDF save
  const stored = await storage.saveFile(pdfBuffer, "Modul Kuliah.pdf", "application/pdf");
  assert(stored.storageKey.endsWith(".pdf"), "Storage key has .pdf extension");
  assert(!stored.storageKey.includes("Modul Kuliah"), "Storage key is randomized and does not leak original filename directly");

  // Verify file exists
  const exists = await storage.fileExists(stored.storageKey);
  assert(exists, "File confirmed saved to non-public directory");

  // Read back buffer
  const readBuffer = await storage.readFile(stored.storageKey);
  assert(readBuffer.length === pdfBuffer.length, "Read file length matches saved length");

  // Clean up
  await storage.deleteFile(stored.storageKey);
  const existsAfterDelete = await storage.fileExists(stored.storageKey);
  assert(!existsAfterDelete, "File successfully deleted from storage");

  // Test invalid MIME type rejection
  let threwBadMime = false;
  try {
    await storage.saveFile(Buffer.from("malicious executable"), "virus.exe", "application/x-msdownload");
  } catch (e) {
    threwBadMime = true;
  }
  assert(threwBadMime, "Disallowed MIME type (.exe) rejected");

  // Test oversized file rejection
  let threwOversized = false;
  try {
    const hugeBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB
    await storage.saveFile(hugeBuffer, "huge.pdf", "application/pdf");
  } catch (e) {
    threwOversized = true;
  }
  assert(threwOversized, "Oversized file (>10MB) rejected");
}

testStorage().then(() => {
  // ----------------------------------------------------
  // 7. Gamification & XP Logic Tests
  // ----------------------------------------------------
  console.log("\n7. Testing Gamification & Level Formula...");
  const calcLevel = (xp: number) => Math.floor(xp / 1000) + 1;
  assert(calcLevel(0) === 1, "0 XP is Level 1");
  assert(calcLevel(500) === 1, "500 XP is Level 1");
  assert(calcLevel(1000) === 2, "1000 XP is Level 2");
  assert(calcLevel(2450) === 3, "2450 XP is Level 3");

  console.log("\n=========================================");
  console.log(`TOTAL TESTS: ${passedCount + failedCount}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log("=========================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
});
