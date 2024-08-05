set -e

echo Compiling...

rm -rf lib > /dev/null 2>&1
tsc -p tsconfig.json --module nodenext --outDir lib/esm
echo '{"type": "module"}' > lib/esm/package.json

tsc -p tsconfig.cjs.json --module commonjs --outDir lib/cjs
echo '{"type": "commonjs"}' > lib/cjs/package.json

echo Compilation successful!
