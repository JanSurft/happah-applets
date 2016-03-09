//vec4 transformedPosition;
//transformedPosition = modelViewMatrix * vec4( position, 1.0 );
impostorSpaceCoordinate = position.xy;
//transformedPosition.xy = (transformedPosition.xy
//                          + impostorSpaceCoordinate.xy * vec2(uRadius));
mvPosition = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)
              + vec4( position.x, position.y, 0.0, 0.0));
gl_Position = projectionMatrix * mvPosition;

fDepth = gl_Position.z / gl_Position.w;
vec4 vRayDir = vec4(position - cameraPosition, 0.0);
float fLength = length(vRayDir);
vRayDir = normalize(vRayDir);
fLength = fLength + uRadius;
vec4 oSphereEdgePos = vec4(cameraPosition, 0.0) + (fLength * vRayDir);
oSphereEdgePos.w = 1.0;
oSphereEdgePos = projectionMatrix * modelViewMatrix * oSphereEdgePos;

float fSphereEdgeDepth = oSphereEdgePos.z / oSphereEdgePos.w;
fSphereRadiusDepth = fDepth - fSphereEdgeDepth;
