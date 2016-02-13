# The MIT License
#
# Copyright (c) 2010-2015 three.js authors
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
#############################################################################
#
# This buildscript is a modification of the original build script from three.js
# licensed under the MIT License.
# date: Jan 22. 2015
# link: https://github.com/mrdoob/three.js/blob/master/utils/build/build.py
#
#############################################################################

#!/usr/bin/env python

import sys

if sys.version_info < (2, 7):
     print("This script requires at least Python 2.7.")
     print("Please, update to a newer version: http://www.python.org/download/releases/")
#	exit()

import argparse
import json
import os
import re
import shutil
import tempfile

from io import open

def main(argv=None):

     parser = argparse.ArgumentParser()
     parser.add_argument('--include', action='append', required=True)
     parser.add_argument('--externs', action='append', default=['externs/common.js'])
     parser.add_argument('--amd', action='store_true', default=False)
     parser.add_argument('--minify', action='store_true', default=False)
     parser.add_argument('--output', default='../../build/three.js')
     parser.add_argument('--sourcemaps', action='store_true', default=False)

     args = parser.parse_args()

     output = args.output

     # merge

     print(' * Building ' + output)

     # enable sourcemaps support

     if args.sourcemaps:
          sourcemap = output + '.map'
          sourcemapping = '\n//@ sourceMappingURL=' + sourcemap
          sourcemapargs = ' --create_source_map ' + sourcemap + ' --source_map_format=V3'
     else:
          sourcemap = sourcemapping = sourcemapargs = ''

     fd, path = tempfile.mkstemp()
     tmp = open(path, 'w', encoding='utf-8')
     sources = []

     if args.amd:
          tmp.write(u'( function ( root, factory ) {\n\n\tif ( typeof define === \'function\' && define.amd ) {\n\n\t\tdefine( [ \'exports\' ], factory );\n\n\t} else if ( typeof exports === \'object\' ) {\n\n\t\tfactory( exports );\n\n\t} else {\n\n\t\tfactory( root );\n\n\t}\n\n}( this, function ( exports ) {\n\n')

     for include in args.include:
          with open('includes/' + include + '.json','r', encoding='utf-8') as f:
               files = json.load(f)
          for filename in files:
               tmp.write(u'// File:' + filename)
               tmp.write(u'\n\n')
               filename = '../../' + filename
               sources.append(filename)
               with open(filename, 'r', encoding='utf-8') as f:
                    if filename.endswith(".glsl"):
                         tmp.write(u'HAPPAH.ShaderChunk[ \'' + os.path.splitext(os.path.basename(filename))[0] + u'\' ] = "')
                         text = f.read()
                         text = re.sub(r"\t*//.*\n", "", text) # strip comments
                         text = text.replace('\n','\\n') # line breaks to \n
                         tmp.write(text)
                         tmp.write(u'";\n\n')
                    else:
                         tmp.write(f.read())
                         tmp.write(u'\n')

     if args.amd:
          tmp.write(u'exports.HAPPAH = HAPPAH;\n\n} ) );')

     tmp.close()

     # save

     if args.minify is False:
          shutil.copy(path, output)
          os.chmod(output, 0o664) # temp files would usually get 0600

     else:
          backup = ''
          if os.path.exists(output):
               with open(output, 'r', encoding='utf-8') as f: backup = f.read()
               os.remove(output)

          source = ' '.join(sources)
          cmd = 'java -jar compiler/compiler.jar --compilation_level WHITESPACE_ONLY --warning_level=VERBOSE --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s %s' % (path, output, sourcemapargs)
          os.system(cmd)

          # header

          if os.path.exists(output):
               with open(output, 'r', encoding='utf-8') as f: text = f.read()
               with open(output, 'w', encoding='utf-8') as f: f.write('// https://github.com/happah-graphics/happah-applet/LICENSE\n' + text + sourcemapping)
          else:
               print("Minification with Closure compiler failed. Check your Java runtime version.")
               with open(output, 'w', encoding='utf-8') as f: f.write(backup)

     os.close(fd)
     os.remove(path)


if __name__ == "__main__":
	script_dir = os.path.dirname(os.path.abspath(__file__))
	os.chdir(script_dir)
	main()
