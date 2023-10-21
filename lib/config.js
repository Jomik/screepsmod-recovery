const fs = require("fs").promises;
const YAML = require("yamljs");

const defaultConfig = {
  dir: "backups",
  files: ["config.yml", "assets"],
};

const configFile = "config.yml";
async function load() {
  try {
    await fs.stat(configFile);
    const conf = YAML.parse(await fs.readFile(configFile)).backup || {};
    return {
      ...defaultConfig,
      ...conf,
      files: [...defaultConfig.files, ...conf.files],
    };
  } catch (_) {}
  return defaultConfig;
}

module.exports.load = load;
module.exports.defaultConfig = defaultConfig;
