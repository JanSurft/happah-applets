uniform mediump mat4 orthographicMatrix;
uniform mediump float uRadius;

attribute vec3 center;
attribute vec4 inputImpostorSpaceCoordinate;

varying mediump vec2 impostorSpaceCoordinate;
varying mediump vec3 normalizedViewCoordinate;
varying mediump vec4 mvPosition;
