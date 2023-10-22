const fs = require("fs").promises;
const config = require("./config");
const tar = require("tar");

async function backupMongo(cfg) {
  const { db, env } = cfg.common.storage;

  const dump = { version: 1, mongo: {}, redis: {} };

  const mongoPromises = Object.keys(db).map(async (collection) => {
    dump.mongo[collection] = await db[collection].find({});
  });

  const redisPromises = Object.values(env.keys).map(async (k) => {
    if (k === env.keys.ACTIVE_ROOMS) {
      dump.redis[k] = await env.smembers(k);
      return;
    }
    dump.redis[k] = await env.get(k);
  });
  await Promise.all([...mongoPromises, ...redisPromises]);

  return dump;
}

/**
 * @param {string} file
 *
 */
module.exports = async function (file, cfg) {
  conf = await config.load();
  const files = [...conf.files];

  if (cfg.backend.features.some(({ name }) => name === "screepsmod-mongo")) {
    const dump = await backupMongo(cfg);
    await fs.writeFile("screepsmod-mongo.json", JSON.stringify(dump), "utf8");
    files.push("screepsmod-mongo.json");
  }

  await tar.create(
    {
      gzip: true,
      file,
      preservePaths: true,
      portable: true,
      follow: true,
    },
    files,
  );
};
