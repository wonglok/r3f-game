import { WebGLCubeRenderTarget, Camera, Scene, Mesh, PlaneBufferGeometry, ShaderMaterial, CubeRefractionMapping, BackSide, NoBlending, BoxBufferGeometry, CubeCamera } from 'three'
import { Vector2, MeshBasicMaterial, DoubleSide, RGBFormat, LinearFilter, CubeReflectionMapping, WebGLRenderTarget, EquirectangularReflectionMapping } from 'three/build/three.module'
import { cloneUniforms } from 'three/src/renderers/shaders/UniformsUtils.js'
class CustomWebGLCubeRenderTarget extends WebGLCubeRenderTarget {
  constructor (width, height, options) {
    super(width, height, options)
    this.ok = true
  }

  setup (renderer, texture) {
    this.texture.type = texture.type
    this.texture.format = texture.format
    this.texture.encoding = texture.encoding

    var scene = new Scene()

    var shader = {

      uniforms: {
        tEquirect: { value: null }
      },

      vertexShader: `
        varying vec3 vWorldDirection;
        vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
          return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
        }
        void main() {
          vWorldDirection = transformDirection( position, modelMatrix );
          #include <begin_vertex>
          #include <project_vertex>
        }
      `,

      fragmentShader: `
        uniform sampler2D tEquirect;
        varying vec3 vWorldDirection;
        #define RECIPROCAL_PI 0.31830988618
        #define RECIPROCAL_PI2 0.15915494
        void main() {
          vec3 direction = normalize( vWorldDirection );
          vec2 sampleUV;
          sampleUV.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
          sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;
          gl_FragColor = texture2D( tEquirect, sampleUV );
        }
      `
    }

    var material = new ShaderMaterial({
      type: 'CubemapFromEquirect',
      uniforms: cloneUniforms(shader.uniforms),
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: BackSide,
      blending: NoBlending
    })

    material.uniforms.tEquirect.value = texture

    var mesh = new Mesh(new BoxBufferGeometry(5, 5, 5), material)
    scene.add(mesh)

    var camera = new CubeCamera(1, 10, 1)

    camera.renderTarget = this
    camera.renderTarget.texture.name = 'CubeCameraTexture'

    camera.update(renderer, scene)

    this.compute = () => {
      camera.update(renderer, scene)
    }

    // mesh.geometry.dispose()
    // mesh.material.dispose()
  }
}

export class ShaderCubeSea {
  constructor ({ renderer, loop, resX = 128, resY = 128 }) {
    this.renderer = renderer
    this.resX = resX || 128
    this.resY = resY || 128
    this.renderTargetCube = new CustomWebGLCubeRenderTarget(this.resX, { format: RGBFormat, magFilter: LinearFilter, minFilter: LinearFilter })
    this.renderTargetPlane = new WebGLRenderTarget(this.resX, this.resY, { format: RGBFormat, magFilter: LinearFilter, minFilter: LinearFilter })
    this.camera = new Camera()
    this.scene = new Scene()
    this.geo = new PlaneBufferGeometry(2, 2, 2, 2)
    let uniforms = {
      time: {
        value: 0
      },
      resolution: {
        value: new Vector2(this.resX, this.resY)
      }
    }
    let glsl = v => v[0]
    this.mat = new ShaderMaterial({
      side: DoubleSide,
      transparent: true,
      uniforms,
      vertexShader: `
      varying vec3 vNormal;
      void main (void) {
          vNormal = normal;
          gl_Position = vec4( position, 1.0 );
        }
      `,
      fragmentShader: glsl`
        varying vec3 vNormal;

        #include <common>
        uniform vec2 resolution;
        uniform float time;

        #define TAU 6.28318530718
        #define MAX_ITER 35

        vec4 waterwaves( in vec2 fragCoord, in vec2 iResolution, in float iTime)
        {
          float time = iTime * .5+23.0;
            // uv should be the 0-1 uv of texture...
          vec2 uv = fragCoord.xy / iResolution.xy;

        #ifdef SHOW_TILING
          vec2 p = mod(uv*TAU*2.0, TAU)-250.0;
        #else
            vec2 p = mod(uv*TAU, TAU)-250.0;
        #endif
          vec2 i = vec2(p);
          float c = 1.0;
          float inten = .005;

          for (int n = 0; n < MAX_ITER; n++)
          {
            float t = time * (1.0 - (3.5 / float(n+1)));
            i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
            c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
          }
          c /= float(MAX_ITER);
          c = 1.17-pow(c, 1.4);
          vec3 colour = vec3(pow(abs(c), 8.0));
          vec3 myColor = vec3(0.7, 0.7, 0.7);
          colour = clamp(colour * myColor, 0.0, 1.0);

          #ifdef SHOW_TILING
          // Flash tile borders...
          vec2 pixel = 2.0 / iResolution.xy;
          uv *= 2.0;

          float f = floor(mod(iTime*.5, 2.0)); // Flash value.
          vec2 first = step(pixel, uv) * f; // Rule out first screen pixels and flash.
          uv  = step(fract(uv), pixel); // Add one line of pixels per tile.
          colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line

          #endif
          return vec4(colour, 1.0);
        }

        void main (void) {
          vec2 uv = gl_FragCoord.xy / resolution.xy;

          gl_FragColor = waterwaves(gl_FragCoord.xy + (vNormal.xy + vNormal.zz), vec2(resolution.xy), time * 0.1);
        }
      `
    })

    this.renderTargetPlane.texture.mapping = EquirectangularReflectionMapping
    this.renderTargetCube.texture.mapping = CubeRefractionMapping
    this.renderTargetCube.texture.mapping = CubeReflectionMapping

    this.renderTargetCube.setup(renderer, this.renderTargetPlane.texture)
    loop(() => {
      uniforms.time.value = window.performance.now() * 0.001
      let camera = this.camera
      let renderer = this.renderer
      let scene = this.scene

      // let renderTarget = this.renderTarget
      // var generateMipmaps = renderTargetCube.texture.generateMipmaps
      // renderTargetCube.texture.generateMipmaps = false

      renderer.setRenderTarget(this.renderTargetPlane)
      renderer.render(scene, camera)
      renderer.setRenderTarget(null)

      this.renderTargetCube.compute()
    })
    this.plane = new Mesh(this.geo, this.mat)
    this.out = {
      envMap: this.renderTargetCube.texture,
      material: new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide, envMap: this.renderTargetCube.texture })
    }
    this.scene.add(this.plane)
  }
}
