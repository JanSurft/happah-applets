float distanceFromCenter = length(impostorSpaceCoordinate);
if(distanceFromCenter >= uRadius ) {
     discard;
}
float normalizedDepth = sqrt(uRadius * uRadius
          - distanceFromCenter * distanceFromCenter);
float depthOfFragment = 0.5 * uRadius * normalizedDepth;
vec3 transformedNormal = vec3(impostorSpaceCoordinate, normalizedDepth);

//////////////////////////////////////////////////////////////////////////////

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

     directLight = getPointDirectLight( pointLights[ i ], geometry );

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

     directLight = getSpotDirectLight( spotLights[ i ], geometry );

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

     directLight = getDirectionalDirectLight( directionalLights[ i ], geometry );

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

