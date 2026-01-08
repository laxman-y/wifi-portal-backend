function getCurrentTime() {
  const now = new Date();

  // Force local time consistency (important for production servers)
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`; // HH:MM
}

function isWithinShift(shifts = []) {
  const now = getCurrentTime();

  return shifts.find(shift => {
    if (!shift?.start || !shift?.end) return false;

    // Normal shift (e.g. 10:00 → 18:00)
    if (shift.start <= shift.end) {
      return now >= shift.start && now <= shift.end;
    }

    // Overnight shift (e.g. 22:00 → 02:00)
    return now >= shift.start || now <= shift.end;
  });
}

function minutesUntil(endTime) {
  if (!endTime) return 0;

  const [eh, em] = endTime.split(":").map(Number);
  const now = new Date();
  const end = new Date();

  end.setHours(eh, em, 0, 0);

  // Handle overnight shift end
  if (end < now) {
    end.setDate(end.getDate() + 1);
  }

  return Math.max(0, Math.floor((end - now) / 60000));
}

module.exports = { isWithinShift, minutesUntil };
