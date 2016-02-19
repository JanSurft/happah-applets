//vec4 transformedPosition;
//transformedPosition = modelViewMatrix * vec4( position, 1.0 );
impostorSpaceCoordinate = position.xy;
//transformedPosition.xy = (transformedPosition.xy
//                          + impostorSpaceCoordinate.xy * vec2(uRadius));
mvPosition = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)
              + vec4( position.x, position.y, 0.0, 0.0));
gl_Position = projectionMatrix * mvPosition;
