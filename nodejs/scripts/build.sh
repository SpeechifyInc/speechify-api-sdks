set -e

cd "$(dirname "$0")/.."
echo "Running in $(pwd)"

VERSION=$(node -p "require('./package.json').version")
echo "Building version $VERSION"

# Some bundlers (Vite+Remix) make it harder to import JSON
# Because of this, this hack is implemented, substituting the version file
echo "Materializing version file"
echo "export const VERSION = \"$VERSION\";" > src/version_dist.ts

echo "Compiling package..."

rm -rf lib > /dev/null 2>&1
tsc -p tsconfig.json --module nodenext --outDir lib/esm
echo "{\"type\": \"module\", \"version\": \"$VERSION\"}" > lib/esm/package.json

tsc -p tsconfig.cjs.json --module commonjs --outDir lib/cjs
echo "{\"type\": \"commonjs\", \"version\": \"$VERSION\"}" > lib/cjs/package.json

echo "Compilation successful!"

# After building the package, replace version.ts importing from package.json with the "static" version
echo "Substituting materialized version export"

mv lib/cjs/src/version_dist.js lib/cjs/src/version.js
mv lib/cjs/src/version_dist.js.map lib/cjs/src/version.js.map
rm lib/cjs/src/version_dist.d.ts
node scripts/subst.js 'version_dist.js' 'version.js' lib/cjs/src/version.js.map
node scripts/subst.js 'version_dist.js.map' 'version.js.map' lib/cjs/src/version.js

mv lib/esm/src/version_dist.js lib/esm/src/version.js
mv lib/esm/src/version_dist.js.map lib/esm/src/version.js.map
rm lib/esm/src/version_dist.d.ts
node scripts/subst.js 'version_dist.js' 'version.js' lib/esm/src/version.js.map
node scripts/subst.js 'version_dist.js.map' 'version.js.map' lib/esm/src/version.js

echo "Cleaning up..."

rm -rf lib/{cjs,esm}/**/{*.test.*,test-helper.*} > /dev/null 2>&1
rm -rf lib/{cjs,esm}/*.tsbuildinfo > /dev/null 2>&1

echo "All done."
