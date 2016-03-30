/////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
// @author: Pawel Herman (pherman@ira.uka.de)
//
/////////////////////////////////////////////////////////////////////////////

define(['jquery', 'three'], function($, THREE) {

     class Material extends THREE.ShaderMaterial {

               static get VERTEX_SHADER() {
                    return [
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
                         shaders["spherical-impostor.vh"],
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
                         shaders["spherical-impostor.v"],
                         THREE.ShaderChunk["shadowmap_vertex"],
                         THREE.ShaderChunk["lights_lambert_vertex"],
                         "}"
                    ].join("\n");
               }

               static get FRAGMENT_SHADER() {
                    return [
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
                         shaders["spherical-impostor.fh"],
                         "void main() {",
                         "	vec4 diffuseColor = vec4( diffuse, opacity );",
                         "	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );",
                         "	vec3 totalEmissiveLight = emissive;",
                         shaders["spherical-impostor.f"],
                         THREE.ShaderChunk["logdepthbuf_fragment"],
                         THREE.ShaderChunk["map_fragment"],
                         THREE.ShaderChunk["color_fragment"],
                         THREE.ShaderChunk["alphamap_fragment"],
                         THREE.ShaderChunk["alphatest_fragment"],
                         THREE.ShaderChunk["specularmap_fragment"],
                         THREE.ShaderChunk["emissivemap_fragment"],
                         "	reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );",
                         THREE.ShaderChunk["lightmap_fragment"],
                         "	reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );",
                         "	#ifdef DOUBLE_SIDED",
                         "		reflectedLight.directDiffuse = ( gl_FrontFacing ) ? lightFront : lightBack;",
                         "	#else",
                         "		reflectedLight.directDiffuse = lightFront;",
                         "	#endif",
                         "	reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();",
                         THREE.ShaderChunk["aomap_fragment"],
                         "	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveLight;",
                         THREE.ShaderChunk["envmap_fragment"],
                         THREE.ShaderChunk["linear_to_gamma_fragment"],
                         THREE.ShaderChunk["fog_fragment"],
                         "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
                         "}"
                    ].join("\n");
               }

               constructor(radius) {
                    super({
                         uniforms: THREE.UniformsUtils.merge([
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
                         ]),
                         vertexShader: Material.VERTEX_SHADER,
                         fragmentShader: Material.FRAGMENT_SHADER,
                         lights: true, // <-- without no access to lights
                    });
               }

          } //class Material

     class Geometry extends THREE.BufferGeometry {

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
               constructor(radius) {
                    super();
                    this.addAttribute(
                         'position',
                         new THREE.BufferAttribute(
                              new Float32Array([-radius, -radius, 0.0,
                                   radius, -radius, 0.0, -radius, radius, 0.0,
                                   radius, radius, 0.0, -radius, radius, 0.0,
                                   radius, -radius, 0.0
                              ]), 3)
                    );
                    this.addAttribute(
                         'inputImpostorSpaceCoordinates',
                         new THREE.BufferAttribute(
                              new Float32Array([-1.0, -1.0,
                                   1.0, -1.0, -1.0, 1.0,
                                   1.0, 1.0
                              ]), 2)
                    );
                    this.addAttribute('center', new THREE.BufferAttribute(new Float32Array([0.0, 0.0, 0.0]), 3));
               }

          } //class Geometry

     class SphericalImpostor extends THREE.Mesh {

               constructor(radius) {
                    super(new Geometry(radius), new Material(radius));
                    this.radius = radius;
               }

               // @Override raycast function for easy intersect
               raycast(raycaster, intersects) {
                    var distance = raycaster.ray.distanceToPoint(this.position);
                    if (distance <= this.radius) {
                         // TODO: push mesh or new Object3D?
                         //       this way we need to adjust intersects.
                         intersects.push(this);
                    }
               }

          } //class SphericalImpostor

     return {
          SphericalImpostor: SphericalImpostor
     }

});
