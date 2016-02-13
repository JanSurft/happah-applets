/////////////////////////////////////////////////////////////////////////////
// Adding spherical impostor objects to THREE.js functionality
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
/////////////////////////////////////////////////////////////////////////////

HAPPAH.SphericalImpostorMaterial = function(radius) {

     var uniforms = THREE.UniformsUtils.merge([
          THREE.UniformsLib["common"],
          THREE.UniformsLib["aomap"],
          THREE.UniformsLib["lightmap"],
          THREE.UniformsLib["emissivemap"],
          THREE.UniformsLib["fog"],
          THREE.UniformsLib["ambient"],
          THREE.UniformsLib["lights"], {
               "emissive": {
                    type: "c",
                    value: new THREE.Color(0x000000)
               },
               "diffuse": {
                    type: 'c',
                    value: new THREE.Color(0xFFFFFF)
               },
               "uRadius": {
                    type: 'f',
                    value: new Number(radius)
               },
          }
     ]);

     var vertexShader = [
          "varying vec3 vLightFront;",

          "#ifdef DOUBLE_SIDED",

          "	varying vec3 vLightBack;",

          "#endif",
          THREE.ShaderChunk["common"],
          THREE.ShaderChunk["uv_pars_vertex"],
          THREE.ShaderChunk["uv2_pars_vertex"],
          THREE.ShaderChunk["envmap_pars_vertex"],
          THREE.ShaderChunk["bsdfs"],
          THREE.ShaderChunk["lights_pars"],
          THREE.ShaderChunk["color_pars_vertex"],
          THREE.ShaderChunk["morphtarget_pars_vertex"],
          THREE.ShaderChunk["skinning_pars_vertex"],
          THREE.ShaderChunk["shadowmap_pars_vertex"],
          THREE.ShaderChunk["logdepthbuf_pars_vertex"],
          HAPPAH.ShaderChunk["spherical_impostor_pars_vertex"],

          "void main() {",

          THREE.ShaderChunk["uv_vertex"],
          THREE.ShaderChunk["uv2_vertex"],
          THREE.ShaderChunk["color_vertex"],

          THREE.ShaderChunk["beginnormal_vertex"],
          THREE.ShaderChunk["morphnormal_vertex"],
          THREE.ShaderChunk["skinbase_vertex"],
          THREE.ShaderChunk["skinnormal_vertex"],
          THREE.ShaderChunk["defaultnormal_vertex"],

          THREE.ShaderChunk["begin_vertex"],
          THREE.ShaderChunk["morphtarget_vertex"],
          THREE.ShaderChunk["skinning_vertex"],
          THREE.ShaderChunk["project_vertex"],
          THREE.ShaderChunk["logdepthbuf_vertex"],

          THREE.ShaderChunk["worldpos_vertex"],
          THREE.ShaderChunk["envmap_vertex"],
          HAPPAH.ShaderChunk["spherical_impostor_vertex"],
          THREE.ShaderChunk["shadowmap_vertex"],

          THREE.ShaderChunk["lights_lambert_vertex"],
          "}"
     ].join("\n");

     var fragmentShader = [
          "uniform vec3 diffuse;",
          "uniform vec3 emissive;",
          "uniform float opacity;",

          THREE.ShaderChunk["common"],
          THREE.ShaderChunk["color_pars_fragment"],
          THREE.ShaderChunk["uv_pars_fragment"],
          THREE.ShaderChunk["uv2_pars_fragment"],
          THREE.ShaderChunk["map_pars_fragment"],
          THREE.ShaderChunk["alphamap_pars_fragment"],
          THREE.ShaderChunk["aomap_pars_fragment"],
          THREE.ShaderChunk["lightmap_pars_fragment"],
          THREE.ShaderChunk["emissivemap_pars_fragment"],
          THREE.ShaderChunk["envmap_pars_fragment"],
          THREE.ShaderChunk["bsdfs"],
          THREE.ShaderChunk["ambient_pars"],
          THREE.ShaderChunk["lights_pars"],
          THREE.ShaderChunk["fog_pars_fragment"],
          THREE.ShaderChunk["shadowmap_pars_fragment"],
          THREE.ShaderChunk["shadowmask_pars_fragment"],
          THREE.ShaderChunk["specularmap_pars_fragment"],
          THREE.ShaderChunk["logdepthbuf_pars_fragment"],

          HAPPAH.ShaderChunk["spherical_impostor_pars_fragment"],

          "void main() {",

          "	vec4 diffuseColor = vec4( diffuse, opacity );",
          "	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
          "	vec3 totalEmissiveLight = emissive;",

          // modifies transformed normal
          HAPPAH.ShaderChunk["spherical_impostor_fragment"],

          THREE.ShaderChunk["logdepthbuf_fragment"],
          THREE.ShaderChunk["map_fragment"],
          THREE.ShaderChunk["color_fragment"],
          THREE.ShaderChunk["alphamap_fragment"],
          THREE.ShaderChunk["alphatest_fragment"],
          THREE.ShaderChunk["specularmap_fragment"],
          THREE.ShaderChunk["emissivemap_fragment"],

          // accumulation
          "	reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );",

          THREE.ShaderChunk["lightmap_fragment"],

          "	reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );",
          "	#ifdef DOUBLE_SIDED",
          "		reflectedLight.directDiffuse = ( gl_FrontFacing ) ? lightFront : lightBack;",
          "	#else",
          "		reflectedLight.directDiffuse = lightFront;",
          "	#endif",
          "	reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();",

          // modulation
          THREE.ShaderChunk["aomap_fragment"],

          "	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveLight;",

          THREE.ShaderChunk["envmap_fragment"],

          THREE.ShaderChunk["linear_to_gamma_fragment"],

          THREE.ShaderChunk["fog_fragment"],

          "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

          "}"
     ].join("\n");

     var spherical_impostor_material = new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          lights: true, // <-- without no access to lights
     });

     return spherical_impostor_material;
};

HAPPAH.SphericalImpostorGeometry = function(radius) {
     // create a simple square shape. We duplicate the top left and bottom
     // right vertices because each vertex needs to appear once per
     // triangle defining the plane:
     // 2/6----------4
     //  | \         |
     //  |   \       |
     //  |     \     |
     //  |       \   |
     //  |         \ |
     //  1----------3/5
     //  each line is a coordinate
     var spherical_impostor_geometry = new THREE.BufferGeometry();
     spherical_impostor_geometry.addAttribute('position',
          new THREE.BufferAttribute(
               new Float32Array([-radius, -radius, 0.0,
                    radius, -radius, 0.0, -radius, radius, 0.0,
                    radius, radius, 0.0, -radius, radius, 0.0,
                    radius, -radius, 0.0
               ]), 3)
     );
     spherical_impostor_geometry.addAttribute(
          'inputImpostorSpaceCoordinates',
          new THREE.BufferAttribute(
               new Float32Array([-1.0, -1.0,
                    1.0, -1.0, -1.0, 1.0,
                    1.0, 1.0
               ]), 2)
     );
     spherical_impostor_geometry.addAttribute('center',
          new THREE.BufferAttribute(
               new Float32Array([0.0, 0.0, 0.0]), 3));
     return spherical_impostor_geometry;
};

HAPPAH.SphericalImpostor = function(radius) {
     if (radius === undefined) {
          radius = 1.0;
     }
     return new THREE.Mesh(
          new HAPPAH.SphericalImpostorGeometry(radius),
          new HAPPAH.SphericalImpostorMaterial(radius)
          //new THREE.MeshNormalMaterial()
     );
};
