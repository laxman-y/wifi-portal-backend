/**
 * Converts server UTC time → IST Date
 */
function getNowIST() {
  const now = new Date();
  return new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
}

/**
 * Checks if current IST time is within any shift
 * RETURNS: { start: Date, end: Date }  ← IMPORTANT
 */
function isWithinShift(shifts = []) {
  const now = getNowIST();

  for (const shift of shifts) {
    if (!shift?.start || !shift?.end) continue;

    const [sh, sm] = shift.start.split(":").map(Number);
    const [eh, em] = shift.end.split(":").map(Number);

    const start = new Date(now);
    start.setHours(sh, sm, 0, 0);

    const end = new Date(now);
    end.setHours(eh, em, 0, 0);

    // Overnight shift handling (22:00 → 02:00)
    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    if (now >= start && now <= end) {
      return { start, end };
    }
  }

  return null;
}

/**
 * Minutes remaining until shift end (Date)
 */
function minutesUntil(endDate) {
  if (!(endDate instanceof Date)) return 0;
  const diff = endDate - getNowIST();
  return Math.max(0, Math.floor(diff / 60000));
}

module.exports = { isWithinShift, minutesUntil };
