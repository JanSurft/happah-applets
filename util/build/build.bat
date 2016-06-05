echo off
echo REQUIREMENTS:
echo - Python correctly installed
echo - Python.exe set to open .py files
echo -------------------------------------------
build.py --include common --output ../../build/js/shaders.js
build.py --include common --minify --output ../../build/js/shaders.min.js
echo -------------------------------------------
pause