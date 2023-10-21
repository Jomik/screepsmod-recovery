const fs = require("fs").promises;
const backup = require("../backup");
const restore = require("../restore");

module.exports = function (config) {
  config.backend.features = config.backend.features || [];
  config.backend.features.push({
    name: "screepsmod-backup",
    version: require("../../package.json").version,
  });
  config.cli.on("cliSandbox", (sandbox) => {
    sandbox.backup = {
      _help:
        "backup.list() // Lists all backup files\n" +
        "backup.create([file]) // Attempts to create a backup, with the given name if provided\n" +
        "backup.restore(file) // Attempts to restore the given file",
      async list() {
        const conf = await config.load();
        await fs.mkdir(conf.dir, { recursive: true });
        const dir = await fs.readdir(conf.dir);
        console.log(`Backups:\n${dir.join("\n")}`);
      },
      async create(file) {
        await sandbox.system.pauseSimulation();
        file = file || new Date().toISOString();
        const result = await backup(file);
        await sandbox.system.resumeSimulation();
        return `Backup created: ${result}`;
      },
      async restore(file) {
        await sandbox.system.pauseSimulation();
        const result = await restore(file);
        return (
          result ||
          "Restore complete, please restart the server and resume simulation"
        );
      },
    };
  });
};
