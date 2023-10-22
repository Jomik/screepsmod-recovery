const config = require("./config");
const path = require("path");
const fs = require("fs").promises;
const tar = require("tar");

async function restoreMongo(backup, cfg) {
  const { db, env } = cfg.common.storage;

  if (backup.version !== 1) {
    return "Unsupported mongo backup version";
  }

  const mongoPromises = Object.keys(backup.mongo).map(async (collection) => {
    if (!db[collection]) {
      throw new Error(`Collection ${collection} does not exist`);
    }
    await db[collection].drop();
    return Promise.all(
      backup.mongo[collection].map((doc) => db[collection].insert(doc)),
    );
  });

  const redisPromise = env.flushall().then(() =>
    Promise.all(
      Object.keys(backup.redis).map(async (k) => {
        if (k === env.keys.ACTIVE_ROOMS) {
          return Promise.all(backup.redis[k].map((r) => env.sadd(k, r)));
        }
        if (backup.redis[k] === null) {
          return;
        }

        if (typeof backup.redis[k] === "object") {
          return Promise.all(
            Object.entries(backup.redis[k]).map(([kk, value]) =>
              env.hmset(k, kk, value),
            ),
          );
        }

        await env.set(k, backup.redis[k]);
      }),
    ),
  );

  await Promise.all([...mongoPromises, redisPromise]);
}

/**
 * @param {string} file
 *
 */
module.exports = async function (file, cfg) {
  let conf = await config.load();
  if (path.extname(file) !== ".tgz") {
    file = `${file}.tgz`;
  }
  const tarball = path.normalize(path.join(conf.dir, file));
  if (
    await fs
      .stat(tarball)
      .then(() => false)
      .catch(() => true)
  ) {
    return `Backup does not exist ${tarball}`;
  }

  await tar.extract({
    strict: true,
    file: tarball,
    preservePaths: true,
  });

  if (cfg.backend.features.some(({ name }) => name === "screepsmod-mongo")) {
    const mongoBackup = JSON.parse(
      await fs.readFile("screepsmod-mongo.json", "utf8"),
    );
    await restoreMongo(mongoBackup, cfg);
    await fs.unlink("screepsmod-mongo.json");
  }
};
