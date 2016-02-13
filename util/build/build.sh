#!/bin/sh

cd "$(dirname "$0")"
python2 build.py --include common --output ../../build/happah.js
python2 build.py --include common --minify --output ../../build/happah.min.js
