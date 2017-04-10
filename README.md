# Happah-Applets

Visualizing geometric algorithms.

This project targets students. Giving them an interactive way to interact with
the teached algorithms.

# Building Dependencies

  * jre as dependency of Google Closure Compiler
  * python2
  * python-yaml
  * node 7.x
  * webpack 2.1.0
  * node modules:
     * babel-loader
     * babel-core
     * json-loader
     * yaml-loader
     * i18n-js
     * jquery
     * three
     * mathjax
     * three-trackballcontrols

# Building

  ./util/build/build.sh

# Applet structure

Every applet has it's own subdirectory in `js/` and `html/`.
The `js/<applet name>` directory contains two mandatory files:
**main.js** and **algorithm.js**.
Where main.js specifies the basic applet layout and algorithm.js the algorithm
to be visualized.
In case there are more files that are only used by one applet, they belong in
this directory too.
Files that are used by more than one applet, belong in the `js/lib` directory.
