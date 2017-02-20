##############################################################################
#
# @author Stephan Engelmann (stephan-engelmann@gmx.de)
#
# Parse glsl shader files to js/build/shaders.json
#
##############################################################################

import argparse
import json
import os
import re

from io import open

def main(argv=None):

    parser = argparse.ArgumentParser()
    parser.add_argument('--include', action='append', required=True)
    parser.add_argument('--output', default='../../js/build/shaders.json')
    args = parser.parse_args()
    output = args.output
    print(' * Building ' + output)

    output_file = open(output, 'w', encoding='utf-8')

    for include in args.include:
        with open('includes/' + include + '.json','r', encoding='utf-8') as f:
            files = json.load(f)
        output_file.write(u'{')

        first_element = True
        for filename in files:
            output_file.write(u'\n')
            filename = '../../' + filename
            with open(filename, 'r', encoding='utf-8') as f:
                if filename.endswith(".glsl"):
                    if first_element:
                        first_element = False
                    else:
                        output_file.write(u',\n')
                    print("   * parsing {}".format(filename))
                    output_file.write(u'"{}": "'.format(os.path.splitext(
                        os.path.basename(filename))[0]))
                    text = f.read()
                    text = re.sub(r"\t*//.*\n", "", text) # strip comments
                    text = text.replace('\n','\\n') # line breaks to \n
                    output_file.write(text)
                    output_file.write(u'"')

        output_file.write(u'\n}')
    output_file.close()

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    main()
