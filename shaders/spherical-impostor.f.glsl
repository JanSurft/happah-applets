float distanceFromCenter = length(impostorSpaceCoordinate);
if(distanceFromCenter >= uRadius ) {
     discard;
}

// calculate true depth of the sphere
float far=gl_DepthRange.far;
float near=gl_DepthRange.near;
float normalizedDepth = sqrt(uRadius * uRadius
          - distanceFromCenter * distanceFromCenter);
float depthOfFragment = fDepth + normalizedDepth * (fSphereRadiusDepth);
gl_FragDepthEXT = (((far-near) * depthOfFragment) + near + far) / 2.0;

vec3 transformedNormal = vec3(impostorSpaceCoordinate, normalizedDepth);

vec3 diffuse = vec3( 1.0 );

GeometricContext geometry;
geometry.position = mvPosition.xyz - vec3(0., 0., - depthOfFragment);
geometry.normal = normalize( transformedNormal );
geometry.viewDir = normalize( -mvPosition.xyz );

GeometricContext backGeometry;
backGeometry.position = geometry.position;
backGeometry.normal = -geometry.normal;
backGeometry.viewDir = geometry.viewDir;

vec3 lightFront = vec3( 0.0 );

#ifdef DOUBLE_SIDED
vec3 lightBack = vec3( 0.0 );
#endif

IncidentLight directLight;
float dotNL;
vec3 directLightColor_Diffuse;

#if NUM_POINT_LIGHTS > 0

for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

     getPointDirectLight( pointLights[ i ], geometry, directLight );

     dotNL = dot( geometry.normal, directLight.direction );
     directLightColor_Diffuse = PI * directLight.color;

     lightFront += saturate( dotNL ) * directLightColor_Diffuse;

#ifdef DOUBLE_SIDED

     lightBack += saturate( -dotNL ) * directLightColor_Diffuse;

#endif

}

#endif

#if NUM_SPOT_LIGHTS > 0

for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

     getSpotDirectLight( spotLights[ i ], geometry, directLight );

     dotNL = dot( geometry.normal, directLight.direction );
     directLightColor_Diffuse = PI * directLight.color;

     lightFront += saturate( dotNL ) * directLightColor_Diffuse;

#ifdef DOUBLE_SIDED

     lightBack += saturate( -dotNL ) * directLightColor_Diffuse;

#endif
}

#endif

#if NUM_DIR_LIGHTS > 0

for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

     getDirectionalDirectLightIrradiance( directionalLights[ i ], geometry, directLight );

     dotNL = dot( geometry.normal, directLight.direction );
     directLightColor_Diffuse = PI * directLight.color;

     lightFront += saturate( dotNL ) * directLightColor_Diffuse;

#ifdef DOUBLE_SIDED

     lightBack += saturate( -dotNL ) * directLightColor_Diffuse;

#endif

}

#endif

#if NUM_HEMI_LIGHTS > 0

for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

     lightFront += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );

#ifdef DOUBLE_SIDED

     lightBack += getHemisphereLightIrradiance( hemisphereLights[ i ], backGeometry );

#endif

}

#endif

