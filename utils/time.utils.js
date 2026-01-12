function getISTNow() {
  const now = new Date();
  return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
}

function isNowInAnyShift(shifts = []) {
  const now = getISTNow();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return shifts.some(shift => {
    const [sh, sm] = shift.start.split(":").map(Number);
    const [eh, em] = shift.end.split(":").map(Number);

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    // Normal shift (06:00 → 11:00)
    if (start <= end) {
      return nowMinutes >= start && nowMinutes <= end;
    }

    // Overnight shift (22:00 → 02:00)
    return nowMinutes >= start || nowMinutes <= end;
  });
}

module.exports = { isNowInAnyShift };
