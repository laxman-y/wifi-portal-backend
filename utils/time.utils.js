function getISTNow() {
  const now = new Date();
  return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
}

function isWithinShift(shifts = []) {
  const nowIST = getISTNow();
  const nowMinutes = nowIST.getHours() * 60 + nowIST.getMinutes();

  return shifts.find(shift => {
    const [sh, sm] = shift.start.split(":").map(Number);
    const [eh, em] = shift.end.split(":").map(Number);

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    // normal shift
    if (start <= end) {
      return nowMinutes >= start && nowMinutes <= end;
    }

    // overnight shift
    return nowMinutes >= start || nowMinutes <= end;
  });
}

function getShiftEndDate(endTime) {
  const nowIST = getISTNow();
  const [eh, em] = endTime.split(":").map(Number);

  const end = new Date(nowIST);
  end.setHours(eh, em, 0, 0);

  // overnight shift
  if (end < nowIST) {
    end.setDate(end.getDate() + 1);
  }

  // convert IST → UTC
  return new Date(end.getTime() - 5.5 * 60 * 60 * 1000);
}

function minutesUntil(endTime) {
  const endUTC = getShiftEndDate(endTime);
  const now = new Date();
  return Math.max(0, Math.floor((endUTC - now) / 60000));
}

module.exports = {
  isWithinShift,
  getShiftEndDate,
  minutesUntil
};
