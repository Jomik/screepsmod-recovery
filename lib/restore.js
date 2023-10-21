const config = require("./config");
const path = require("path");
const fs = require("fs").promises;
const tar = require("tar");

/**
 * @param {string} file
 *
 */
module.exports = async function (file) {
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
};
