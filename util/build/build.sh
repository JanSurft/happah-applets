#!/bin/sh

cd "$(dirname "$0")"
python2 build.py --include common --output ../../build/shaders.js
python2 build.py --include common --minify --output ../../build/shaders.min.js
