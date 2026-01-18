let preauthEnabled = false;

module.exports = {
  get: () => preauthEnabled,
  toggle: () => {
    preauthEnabled = !preauthEnabled;
    return preauthEnabled;
  },
  set: (val) => {
    preauthEnabled = !!val;
    return preauthEnabled;
  }
};
