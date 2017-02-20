#!/bin/sh

##############################################################################
#
# @author Stephan Engelmann (stephan-engelmann@gmx.de)
#
# Parse glsl shader files to json.
#
##############################################################################

cd "$(dirname "$0")"
mkdir -p ../../js/build

# join custom shaders in one file
python2 build.py --include shaders

# generate lang files
for dir in ../../html/*/
do
  app_dir=$(basename "$dir")
  mkdir -p $dir/build/i18n
  echo " * generating i18n locales for app $app_dir"
  for file in $dir/i18n/*.yaml
    do
        filename=$(basename "$file")
        filename="${filename%.*}"
        out_file=${dir}build/i18n/$filename.json
        python -c 'import sys, yaml, json; json.dump(yaml.load(sys.stdin), sys.stdout, indent=4)' < $file > $out_file
    done
done
