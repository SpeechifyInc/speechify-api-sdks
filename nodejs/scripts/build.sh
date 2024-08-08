set -e

VERSION=$(node -p "require('./package.json').version")
echo "Building version $VERSION"

echo Compiling...

rm -rf lib > /dev/null 2>&1
tsc -p tsconfig.json --module nodenext --outDir lib/esm
echo "{\"type\": \"module\", \"version\": \"$VERSION\"}" > lib/esm/package.json

tsc -p tsconfig.cjs.json --module commonjs --outDir lib/cjs
echo "{\"type\": \"commonjs\", \"version\": \"$VERSION\"}" > lib/cjs/package.json

echo Compilation successful!

echo Cleaning up...

rm -rf lib/{cjs,esm}/**/{*.test.*,test-helper.*,*.tsbuildinfo} > /dev/null 2>&1
