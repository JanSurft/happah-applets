#!/bin/sh

cd "$(dirname "$0")"
mkdir -p ../../build/js
mkdir -p ../../build/i18n

# join custom shaders in one file
python2 build.py --include common --output ../../build/js/shaders.js
python2 build.py --include common --minify --output ../../build/js/shaders.min.js

# generate lang files
for f in ../../i18n/*.yaml 
do
    filename=$(basename "$f")
    extension="${filename##*.}"
    filename="${filename%.*}"
    echo " * Generating Language file for locale $filename"
    python -c 'import sys, yaml, json; json.dump(yaml.load(sys.stdin), sys.stdout, indent=4)' < $f > ../../build/i18n/$filename.json
done
