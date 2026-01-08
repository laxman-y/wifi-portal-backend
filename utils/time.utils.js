function getCurrentTime() {
  const now = new Date();

  // Convert server time (UTC on Render) to IST (UTC + 5:30)
  const istTime = new Date(
    now.getTime() + (5 * 60 + 30) * 60 * 1000
  );

  const hours = String(istTime.getHours()).padStart(2, "0");
  const minutes = String(istTime.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`; // HH:MM (IST)
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

  // Current IST time
  const now = new Date();
  const istNow = new Date(
    now.getTime() + (5 * 60 + 30) * 60 * 1000
  );

  const end = new Date(istNow);
  end.setHours(eh, em, 0, 0);

  // Handle overnight shift end
  if (end < istNow) {
    end.setDate(end.getDate() + 1);
  }

  return Math.max(0, Math.floor((end - istNow) / 60000));
}

module.exports = { isWithinShift, minutesUntil };
