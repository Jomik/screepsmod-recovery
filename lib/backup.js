const config = require("./config");
const path = require("path");
const tar = require("tar");

/**
 * @param {string} file
 *
 */
module.exports = async function (file) {
  const conf = await config.load();
  const out = path.normalize(path.join(conf.dir, file + ".tgz"));
  console.log("Backing up to " + out);

  await tar.create(
    {
      gzip: true,
      file: out,
      preservePaths: true,
    },
    [...conf.files],
  );
  return out;
};
