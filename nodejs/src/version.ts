// NB! During build, this module is removed from the dist folders and replaced
// with the variant returning the static version read from package.json
// at _build_ time. Refer to `scripts/build.sh`
import packageJson from "../package.json";

export const VERSION = packageJson.version;
