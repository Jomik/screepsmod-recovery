module.exports = function (config) {
  config.backend.features = config.backend.features || [];
  config.backend.features.push({
    name: "screepsmod-recovery",
    version: require("../../package.json").version,
  });
  config.cli.on("cliSandbox", (sandbox) => {
    sandbox.recovery = {
      _help:
        "recovery.list() // Lists all backup files\n" +
        "recovery.backup([file]) // Attempts to create a backup, with the given name if provided\n" +
        "recovery.recover(file) // Attempts to recover the given file",
      async list() {},
      async backup(file) {
        await sandbox.system.pauseSimulation();
        // Do stuff
        await sandbox.system.resumeSimulation();
      },
      async recover(file) {
        await sandbox.system.pauseSimulation();
        // Do stuff
        await sandbox.system.resumeSimulation();
      },
    };
  });
};
