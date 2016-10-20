#!/bin/sh

cd "$(dirname "$0")"
mkdir -p ../../build/js
mkdir -p ../../build/i18n

# join custom shaders in one file
python2 build.py --include common --output ../../build/js/shaders.js
python2 build.py --include common --minify --output ../../build/js/shaders.min.js

# generate lang files
for dir in ../../applets/*/
do
  app_name=$(basename "$dir")
  mkdir -p ../../applets/$app_name/build/i18n
  echo " * generating locales for app $app_name"
  for file in $dir/i18n/*.yaml
    do
        filename=$(basename "$file")
        filename="${filename%.*}"
        out_file=../../applets/$app_name/build/i18n/$filename.json
        python -c 'import sys, yaml, json; json.dump(yaml.load(sys.stdin), sys.stdout, indent=4)' < $file > $out_file
    done
done
