const path = require("path");

const backup = require("../backup");
const restore = require("../restore");
const config = require("../config");

module.exports = function (cfg) {
  cfg.backend.features = cfg.backend.features || [];
  cfg.backend.features.push({
    name: "screepsmod-backup",
    version: require("../../package.json").version,
  });
  cfg.cli.on("cliSandbox", (sandbox) => {
    const print = (msg) => sandbox.print(`[screepsmod-backup] ${msg}`);
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
        const conf = await config.load();
        const out = path.normalize(path.join(conf.dir, file + ".tgz"));
        print("Backing up to " + out);

        const result = await backup(out, cfg);

        await sandbox.system.resumeSimulation();

        return result || `Backup created: ${out}`;
      },
      async restore(file) {
        await sandbox.system.pauseSimulation();
        const result = await restore(file, cfg);
        return (
          result ||
          "Restore complete, please restart the server and resume simulation"
        );
      },
    };
  });
};
