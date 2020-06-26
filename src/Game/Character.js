import { ShaderCubeChrome, loadGLTF, LoadingManager } from "../Reusable"
import { Object3D, Color, EventDispatcher, Vector3, PerspectiveCamera } from "three"
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

import { Mixer } from "./Mixer"
import { Moves } from "./Moves"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

// let Cache = new Map()
// let provideChrome = ({ NS = 'chrome1', renderer, loop }) => {
//   if (Cache.has(NS)) {
//     return Cache.get(NS)
//   } else {
//     let newChrome = new ShaderCubeChrome({ renderer, loop, res: 32, color: new Color('#ffffff') })
//     Cache.set(NS, newChrome)
//     return newChrome
//   }
// }

// Object3D
export class Character extends EventDispatcher {
  constructor ({ bus, renderer, loop, camera, element, scene }) {
    super()
    this.bus = bus
    this.scene = scene
    this.url = require('../assets/glb/swat-guy.glb')
    this.loop = loop
    this.element = element
    this.loop = loop
    this.gltf = false
    this.camera = camera

    this.charReady = false
    this._viewCameraMode = 'freecam'
    this._viewCameraMode = 'behind'
    this._viewCameraMode = 'firstperson'
    this.viewSettings = {}
    this.initConfig = {
      scale: 0.1,
      controlTargetLookAt: new Vector3(0, 0, 0 + 20),
      controlTargetPos: new Vector3(0, 0, 0),
      initAction: 'Ymca Dance'
    }

    this.extraHeight = new Vector3()

    this.charmover = new Object3D()

    // this.controlTarget = new Object3D()

    this.o3d = new Object3D()
    this.o3d.rotation.x = -Math.PI * 0.5

    this.charmover.add(this.o3d)
    this.out = {}
    this.out.o3d = this.charmover

    this.chroma = new ShaderCubeChrome({ renderer, loop, res: 32, color: new Color('#ffffff') })
    this.moves = new Moves()
    this.activeLog = []
    this.useGyro = false

    this.setupCameraSystem()

    this.out.done = loadGLTF(this.url)
      .then(async (gltf) => {
        this.gltf = gltf
        this.setupCharEffect({ gltf })
        this.mixer = new Mixer({ loop, actor: gltf.scene })
        this.setupCharSkeleton({ gltf })
        await this.setupAnimationSystem({ mixer: this.mixer })
        this.o3d.add(gltf.scene)
      })

      this.addEventListener('toggle-gyro', (event) => {
        this.setupGyroCam()
        bus.dispatchEvent({ type: 'renderUI', data: Math.random() })
      })

      this.addEventListener('toggle-camcorder', (event) => {
        if (this.viewCameraMode === 'freecam') {
          this.viewCameraMode = 'firstperson'
        } else if (this.viewCameraMode === 'firstperson') {
          this.viewCameraMode = 'freecam'
        }
        bus.dispatchEvent({ type: 'renderUI', data: Math.random() })
      })
  }
  get charReady () {
    return this._charReady
  }
  set charReady (v) {
    this._charReady = v
    this.bus.dispatchEvent({ type: 'renderUI' })
  }
  get viewCameraMode () {
    return this._viewCameraMode
  }
  set viewCameraMode (v) {
    this._viewCameraMode = v
    this.resetCam()
    this.dispatchEvent({ type: 'viewCamMode', data: v })
  }

  setupGyroCam () {
    try {
      let proxyCam = this.proxyCam = new PerspectiveCamera(75, 1, 0.01, 100000000000000)
      proxyCam.rotation.y = this.charmover.rotation.y
      let element = this.element
      let resizer = () => {
        let rect = false
        if (element) {
          rect = element.getBoundingClientRect()
        }
        proxyCam.aspect = rect.width / rect.height
        proxyCam.updateProjectionMatrix()
      }
      resizer()
      window.addEventListener('resize', resizer)

      let DeviceOrientationControls = require('three/examples/jsm/controls/DeviceOrientationControls').DeviceOrientationControls
      let controls = new DeviceOrientationControls(proxyCam, this.element)
      controls.dampping = true
      let proxyLookAtTarget = new Object3D()
      proxyCam.add(proxyLookAtTarget)
      let rotY = this.charmover.rotation.y
      this.loop(() => {
        if (!this.useGyro) {
          return
        }

        controls.enabled = true
        controls.update()

        proxyLookAtTarget.position.z = -8

        proxyCam.updateMatrix()
        proxyCam.updateMatrixWorld()
        proxyCam.updateWorldMatrix()

        proxyLookAtTarget.updateMatrix()
        proxyLookAtTarget.updateMatrixWorld()
        proxyLookAtTarget.updateWorldMatrix()

        this.extraHeight.setFromMatrixPosition(proxyLookAtTarget.matrixWorld)

        let diff = proxyCam.rotation.y - rotY
        this.charmover.rotation.y += diff
        rotY = proxyCam.rotation.y
      })
    } catch (e) {
      console.log(e)
    }
    this.useGyro = !this.useGyro
    if (this.useGyro) {
      this.viewCameraMode = 'firstperson'
    }
  }

  async setupCameraSystem () {
    let updateO3D = (o3d) => {
      o3d.updateMatrix()
      o3d.updateMatrixWorld()
      o3d.updateWorldMatrix()
    }
    var moveForward = false
    var moveBackward = false
    var moveLeft = false
    var moveRight = false
    // var canJump = false
    var turnLeft = false
    var turnRight = false

    // let speedScale = 4

    var prevTime = performance.now()
    // var velocity = new Vector3()
    // var direction = new Vector3()

    let camPlacer = new Object3D()
    camPlacer.position.z = 10
    let camPlacerVec3 = new Vector3()

    let charPlacer = new Object3D()
    let charPlacerVec3 = new Vector3()
    // charPlacer.position.y = 0
    // charPlacer.position.z = 0

    this.charmover.add(camPlacer)
    this.charmover.add(charPlacer)

    // let vscroll = makeScroller({ base: this.lookup('base'), mounter: this.$refs['domlayer'], limit: { direction: 'vertical', canRun: true, ny: 0, y: 1 }, onMove: () => {} })
    let vscroll = {
      value: 0
    }
    var onKeyDown = (event) => {

      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          moveForward = true;
          break;

        case 37: // left
        case 65: // a
          moveLeft = true;
          break;

        case 40: // down
        case 83: // s
          moveBackward = true;
          break;

        case 39: // right
        case 68: // d
          moveRight = true;
          break;

        case 32: // space
          // canJump = false;
          break;

        case 81: // q
          turnLeft = true
          break;

        case 69: // e
          turnRight = true
          break;

        default:
          break;
      }
    };

    var onKeyUp = (event) => {
      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          moveForward = false;
          break;

        case 37: // left
        case 65: // a
          moveLeft = false;
          break;

        case 40: // down
        case 83: // s
          moveBackward = false;
          break;

        case 39: // right
        case 68: // d
          moveRight = false;
          break;

        case 81: // q
          turnLeft = false
          break;


        case 69: // e
          turnRight = false
          break;

          default:
            break;
      }
    };

    this.addEventListener('go-forward', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 87 })
      } else {
        onKeyUp({ keyCode: 87 })
      }
    })
    this.addEventListener('go-backward', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 83 })
      } else {
        onKeyUp({ keyCode: 83 })
      }
    })

    this.addEventListener('go-left', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 65 })
      } else {
        onKeyUp({ keyCode: 65 })
      }
    })

    this.addEventListener('go-right', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 68 })
      } else {
        onKeyUp({ keyCode: 68 })
      }
    })

    this.addEventListener('turn-left', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 81 })
      } else {
        onKeyUp({ keyCode: 81 })
      }
    })
    this.addEventListener('turn-right', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 69 })
      } else {
        onKeyUp({ keyCode: 69 })
      }
    })


    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    // raycaster = new Raycaster( new Vector3(), new Vector3( 0, - 1, 0 ), 0, 10 );

    // this.camera.position.z = 500

    let lookAtVec3 = new Vector3()
    // let lookAtLerpVec3 = new Vector3()

    let headPosition = new Vector3()
    let centerPosition = new Vector3()
    let lerperLookAt = new Vector3()
    let lerperCamPos = new Vector3()
    let targetLookAt = new Vector3()
    let targetCamPos = new Vector3()
    // let centerRelPos = new Vector3()
    let guyEyePos = new Vector3()
    // let infrontOFhead = new Vector3()
    let guyBackPos = new Vector3()
    let guyBodyPos = new Vector3()

    this.controls = new OrbitControls(this.camera, this.element)
    this.controls.enablePan = true
    this.controls.enableDamping = true
    this.controls.enableKeys = false

    let charLookAtPlaceLast = new Vector3()
    let charLookAtPlace = new Vector3()

    // this.$watch('guyHead', () => {
    //   if (this.guyHead) {
    //     this.guyHead.updateMatrix()
    //     this.guyHead.updateMatrixWorld()
    //     this.guyHead.updateWorldMatrix()
    //     charLookAtPlace.setFromMatrixPosition(this.guyHead.matrixWorld)
    //   }
    // })

    this.loop(() => {
      let lookAtGuy = this.guyHead
      if (lookAtGuy && this.charReady) {
        this.controls.update()

        lookAtGuy.updateMatrix()
        lookAtGuy.updateMatrixWorld()
        lookAtGuy.updateWorldMatrix()
        charLookAtPlace.setFromMatrixPosition(lookAtGuy.matrixWorld)

        let diff = charLookAtPlaceLast.clone().sub(charLookAtPlace).multiplyScalar(-1)
        this.controls.object.position.add(diff)

        charLookAtPlaceLast.copy(charLookAtPlace)

        this.controls.target0.lerp(charLookAtPlace, 0.5)
        this.controls.target.lerp(charLookAtPlace, 0.5)
        this.controls.saveState()
      }
    })

    // this.charmover.position.x = this.initConfig.controlTargetPos.x
    // this.charmover.position.y = this.initConfig.controlTargetPos.y
    // this.charmover.position.z = this.initConfig.controlTargetPos.z
    // this.charmover.lookAt(this.initConfig.controlTargetLookAt)

    // this.addEventListener('reset-char-cam', resetCharCam)
    let resetCam = () => {
      vscroll.value = 0
      this.controls.reset()

      // if (this.charmover) {
      //   updateO3D(camPlacer)
      //   updateO3D(charPlacer)
      //   camPlacerVec3.setFromMatrixPosition(camPlacer.matrixWorld)
      //   charPlacerVec3.setFromMatrixPosition(charPlacer.matrixWorld)
      //   this.camera.position.copy(camPlacerVec3)
      //   this.camera.lookAt(charPlacerVec3)
      //   // this.camera.position.z = 10
      //   // this.camera.position.y += 13
      //   // this.camera.position.z += 15
      // }

      if (this.viewCameraMode === 'behind') {
        this.viewSettings.adjustX = 0
        this.viewSettings.adjustY = 0
        this.viewSettings.adjustZ = 0

        this.viewSettings.cameraExtraHeight = 0
        this.viewSettings.farest = 2000
        this.viewSettings.defaultCloseup = -1189.38

      } else if (this.viewCameraMode === 'face') {

        // this.viewSettings.adjustX = 0.00000
        // this.viewSettings.adjustY = 0.00000
        // this.viewSettings.adjustZ = 0.00000

        // this.viewSettings.cameraExtraHeight = 0.00000
        // this.viewSettings.farest = 900.00000
        // this.viewSettings.defaultCloseup = 72.77900

        this.viewSettings.adjustX = 0
        this.viewSettings.adjustY = 0
        this.viewSettings.adjustZ = 0

        this.viewSettings.cameraExtraHeight = 0
        this.viewSettings.farest = 2000
        this.viewSettings.defaultCloseup = 631.5

      } else if (this.viewCameraMode === 'chase-left') {
        this.viewSettings.adjustX = -123.7555
        this.viewSettings.adjustY = 0
        this.viewSettings.adjustZ = 0

        this.viewSettings.cameraExtraHeight = 3.982
        this.viewSettings.defaultCloseup = 138.76
        this.viewSettings.farest = 900
      } else if (this.viewCameraMode === 'chase-right') {
        this.viewSettings.adjustX = 123.7555
        this.viewSettings.adjustY = 0
        this.viewSettings.adjustZ = 0

        this.viewSettings.cameraExtraHeight = 3.982
        this.viewSettings.defaultCloseup = 138.76
        this.viewSettings.farest = 900
      } else if (this.viewCameraMode === 'front') {
        this.viewSettings.adjustX = 123.75550000000001
        this.viewSettings.adjustY = 0
        this.viewSettings.adjustZ = 0

        this.viewSettings.cameraExtraHeight = 3.9820000000000007
        this.viewSettings.farest = 900
        this.viewSettings.defaultCloseup = -138.76
      } else if (this.viewCameraMode === 'close-right') {
        this.viewSettings.adjustX = -147.9535
        this.viewSettings.adjustY = 0
        this.viewSettings.adjustZ = -195.1051

        this.viewSettings.cameraExtraHeight = 0
        this.viewSettings.defaultCloseup = 0
        this.viewSettings.farest = 900
      } else if (this.viewCameraMode === 'close-left') {
        this.viewSettings.adjustX = 147.9535
        this.viewSettings.adjustY = 0
        this.viewSettings.adjustZ = -195.1051

        this.viewSettings.cameraExtraHeight = 0
        this.viewSettings.defaultCloseup = 0
        this.viewSettings.farest = 900
      } else if (this.viewCameraMode === 'firstperson') {
        this.viewSettings.adjustX = 0
        this.viewSettings.adjustY = 17.267699999999984
        this.viewSettings.adjustZ = -1.5212000000000112

        this.viewSettings.cameraExtraHeight = -2.208000000000006
        this.viewSettings.farest = 920
        this.viewSettings.defaultCloseup = -23.363000000000014
      } else if (this.viewCameraMode === 'firstback') {

        this.viewSettings.adjustX = 0.00000
        this.viewSettings.adjustY = 85.03870
        this.viewSettings.adjustZ = -131.77540

        this.viewSettings.cameraExtraHeight = 0.00000
        this.viewSettings.farest = 900.00000
        this.viewSettings.defaultCloseup = 0.00000

      } else if (this.viewCameraMode === 'firstface') {

        this.viewSettings.adjustX = 0.00000
        this.viewSettings.adjustY = 133.43470
        this.viewSettings.adjustZ = -76.46570

        this.viewSettings.cameraExtraHeight = -65.26500
        this.viewSettings.farest = 900.00000
        this.viewSettings.defaultCloseup = -56.35400
      } else if (this.viewCameraMode === 'freecam') {
        this.viewSettings.adjustX = 0
        this.viewSettings.adjustY = 17.267699999999984
        this.viewSettings.adjustZ = -1.5212000000000112

        this.viewSettings.cameraExtraHeight = -2.208000000000006
        this.viewSettings.farest = 920
        this.viewSettings.defaultCloseup = -23.363000000000014
      }

      this.viewSettings.adjustX *= this.initConfig.scale
      this.viewSettings.adjustY *= this.initConfig.scale
      this.viewSettings.adjustZ *= this.initConfig.scale
      this.viewSettings.cameraExtraHeight *= this.initConfig.scale
      this.viewSettings.farest *= this.initConfig.scale
      this.viewSettings.defaultCloseup *= this.initConfig.scale

      this.dispatchEvent({ type: 'reset-cam' })
    }

    resetCam()
    this.camera.position.z = -100
    this.camera.position.y = 28
    this.resetCam = resetCam
    // this.$watch('viewCameraMode', resetCam)

    if (process.env.NODE_ENV === 'development' && window.innerWidth > 500) {
      const dat = require('dat.gui')
      const gui = new dat.GUI()
      this.addEventListener('reset-cam', () => {
        gui.updateDisplay()
      })
      gui.add(this.viewSettings, 'adjustX')
      gui.add(this.viewSettings, 'adjustY')
      gui.add(this.viewSettings, 'adjustZ')
      gui.add(this.viewSettings, 'cameraExtraHeight')
      gui.add(this.viewSettings, 'farest')
      gui.add(this.viewSettings, 'defaultCloseup')
      let copy2clip = require('copy-to-clipboard')
      let copy = () => {
        copy2clip(`
          this.viewSettings.adjustX = ${1 / this.initConfig.scale * this.viewSettings.adjustX}
          this.viewSettings.adjustY = ${1 / this.initConfig.scale * this.viewSettings.adjustY}
          this.viewSettings.adjustZ = ${1 / this.initConfig.scale * this.viewSettings.adjustZ}

          this.viewSettings.cameraExtraHeight = ${1 / this.initConfig.scale * this.viewSettings.cameraExtraHeight}
          this.viewSettings.farest = ${1 / this.initConfig.scale * this.viewSettings.farest}
          this.viewSettings.defaultCloseup = ${1 / this.initConfig.scale * this.viewSettings.defaultCloseup}
        `)
      }
      gui.add({ copy }, 'copy')
    }

    this.loop(() => {
      if (!this.charReady) { return }
      var time = performance.now()
      var delta = (time - prevTime) / 1000
      prevTime = time;

      // delta *= this.initConfig.scale

      // update control target
      if (turnLeft) {
        this.charmover.rotation.y += delta * 1.75
      }
      if (turnRight) {
        this.charmover.rotation.y -= delta * 1.75
      }
      if (!this.isTakingComplexAction) {
        if (moveForward) {
          this.charmover.translateZ(-delta * -55 * this.initConfig.scale)
        }
        if (moveBackward) {
          this.charmover.translateZ(delta * -55 * this.initConfig.scale)
        }
        if (moveLeft) {
          this.charmover.translateX(-delta * -55 * this.initConfig.scale)
        }
        if (moveRight) {
          this.charmover.translateX(delta * -55 * this.initConfig.scale)
        }
      }

      // updateO3D(this.controlTarget)
      updateO3D(camPlacer)
      updateO3D(charPlacer)
      // this.charmover.updateMatrix()
      // this.charmover.updateMatrixWorld()
      // this.charmover.updateWorldMatrix()

      // sync control target to character
      camPlacerVec3.setFromMatrixPosition(camPlacer.matrixWorld)
      charPlacerVec3.setFromMatrixPosition(charPlacer.matrixWorld)

      // this.charmover.rotation.x = this.charmover.rotation.x
      // this.charmover.rotation.y = this.charmover.rotation.y
      // this.charmover.rotation.z = this.charmover.rotation.z

      // this.charmover.position.x = charPlacerVec3.x
      // this.charmover.position.y = charPlacerVec3.y
      // this.charmover.position.z = charPlacerVec3.z

      // can calculate camera
      let config = this.viewSettings
      for (let kn in config) {
        if (typeof config[kn] === 'string') {
          // let orig = config[kn]
          let newVal = Number(config[kn])
          if (isNaN(newVal)) {
          } else {
            config[kn] = newVal
          }
        }
      }
      if (this.guyHead && this.guy && this.guyFace && this.guyBack) {
        this.guy.getWorldPosition(centerPosition)

        let flip = [
          'close-left',
          'close-right',
          'behind',
          'firstface',
          'front'
        ]
        centerPosition.x += config.adjustX
        centerPosition.y += config.adjustY

        if (flip.includes(this.viewCameraMode)) {
          centerPosition.z += config.adjustZ + config.defaultCloseup - vscroll.value * config.farest
        } else {
          centerPosition.z += config.adjustZ + config.defaultCloseup + vscroll.value * config.farest
        }

        this.guyFace.position.x = config.adjustX
        this.guyFace.position.y = config.adjustY
        if (flip.includes(this.viewCameraMode)) {
          this.guyFace.position.z = config.adjustZ + config.defaultCloseup - vscroll.value * config.farest
        } else {
          this.guyFace.position.z = config.adjustZ + config.defaultCloseup + vscroll.value * config.farest
        }

        this.guyBack.position.x = config.adjustX
        this.guyBack.position.y = config.adjustY
        if (flip.includes(this.viewCameraMode)) {
          this.guyBack.position.z = config.adjustZ + config.defaultCloseup - vscroll.value * config.farest
        } else {
          this.guyBack.position.z = config.adjustZ + config.defaultCloseup + vscroll.value * config.farest
        }

        camPlacer.position.x = config.adjustX
        camPlacer.position.y = config.adjustY
        if (flip.includes(this.viewCameraMode)) {
          camPlacer.position.z = config.adjustZ + config.defaultCloseup - vscroll.value * config.farest
        } else {
          camPlacer.position.z = config.adjustZ + config.defaultCloseup + vscroll.value * config.farest
        }

        updateO3D(this.guyHead)
        updateO3D(this.guy)
        updateO3D(this.guyFace)
        updateO3D(this.guyBack)
        updateO3D(camPlacer)

        guyEyePos.setFromMatrixPosition(this.guyFace.matrixWorld)
        guyBackPos.setFromMatrixPosition(this.guyBack.matrixWorld)
        camPlacerVec3.setFromMatrixPosition(camPlacer.matrixWorld)

        headPosition.setFromMatrixPosition(this.guyHead.matrixWorld)
        guyBodyPos.setFromMatrixPosition(this.guy.matrixWorld)
        lookAtVec3.setFromMatrixPosition(this.guy.matrixWorld)
      }

      // let progress = vscroll.value
      // let scrollZoom = config.farest * progress * 1
      // let extraZoom = config.defaultCloseup + scrollZoom

      if (this.viewCameraMode === 'behind') {
        // make use of position
        targetCamPos.x = guyBackPos.x
        targetCamPos.y = guyBackPos.y + config.cameraExtraHeight
        targetCamPos.z = guyBackPos.z

        targetLookAt.x = guyBodyPos.x
        targetLookAt.y = guyBodyPos.y - config.cameraExtraHeight
        targetLookAt.z = guyBodyPos.z
      } else if (this.viewCameraMode === 'face') {
        // make use of position
        targetCamPos.x = guyEyePos.x
        targetCamPos.y = guyEyePos.y + config.cameraExtraHeight
        targetCamPos.z = guyEyePos.z

        targetLookAt.x = headPosition.x
        targetLookAt.y = headPosition.y - config.cameraExtraHeight
        targetLookAt.z = headPosition.z
      } else if (this.viewCameraMode === 'chase-left') {
        // make use of position
        targetCamPos.x = centerPosition.x
        targetCamPos.y = centerPosition.y + config.cameraExtraHeight
        targetCamPos.z = centerPosition.z

        targetLookAt.x = guyBodyPos.x
        targetLookAt.y = guyBodyPos.y - config.cameraExtraHeight
        targetLookAt.z = guyBodyPos.z
      } else if (this.viewCameraMode === 'chase-right') {
        // make use of position
        targetCamPos.x = centerPosition.x
        targetCamPos.y = centerPosition.y + config.cameraExtraHeight
        targetCamPos.z = centerPosition.z

        targetLookAt.x = guyBodyPos.x
        targetLookAt.y = guyBodyPos.y - config.cameraExtraHeight
        targetLookAt.z = guyBodyPos.z
      } else if (this.viewCameraMode === 'front') {
        // make use of position
        targetCamPos.x = centerPosition.x
        targetCamPos.y = centerPosition.y + config.cameraExtraHeight
        targetCamPos.z = centerPosition.z

        targetLookAt.x = guyBodyPos.x
        targetLookAt.y = guyBodyPos.y - config.cameraExtraHeight
        targetLookAt.z = guyBodyPos.z
      } else if (this.viewCameraMode === 'close-left') {
        // make use of position
        targetCamPos.x = centerPosition.x
        targetCamPos.y = centerPosition.y + config.cameraExtraHeight
        targetCamPos.z = centerPosition.z

        targetLookAt.x = guyBodyPos.x
        targetLookAt.y = guyBodyPos.y - config.cameraExtraHeight
        targetLookAt.z = guyBodyPos.z
      } else if (this.viewCameraMode === 'close-right') {
        // make use of position
        targetCamPos.x = centerPosition.x
        targetCamPos.y = centerPosition.y + config.cameraExtraHeight
        targetCamPos.z = centerPosition.z

        targetLookAt.x = guyBodyPos.x
        targetLookAt.y = guyBodyPos.y - config.cameraExtraHeight
        targetLookAt.z = guyBodyPos.z
      } else if (this.viewCameraMode === 'firstperson') {
        // // make use of position
        targetCamPos.x = camPlacerVec3.x
        targetCamPos.y = camPlacerVec3.y + config.cameraExtraHeight
        targetCamPos.z = camPlacerVec3.z

        // make use of position
        // targetCamPos.x = centerPosition.x
        // targetCamPos.y = centerPosition.y + config.cameraExtraHeight
        // targetCamPos.z = centerPosition.z

        targetLookAt.x = lookAtVec3.x
        targetLookAt.y = lookAtVec3.y - config.cameraExtraHeight
        targetLookAt.z = lookAtVec3.z
      } else if (this.viewCameraMode === 'firstback') {
        // make use of position
        targetCamPos.x = camPlacerVec3.x
        targetCamPos.y = camPlacerVec3.y + config.cameraExtraHeight
        targetCamPos.z = camPlacerVec3.z

        targetLookAt.x = lookAtVec3.x
        targetLookAt.y = lookAtVec3.y - config.cameraExtraHeight
        targetLookAt.z = lookAtVec3.z
      } else if (this.viewCameraMode === 'firstface') {
        // make use of position
        targetCamPos.x = camPlacerVec3.x
        targetCamPos.y = camPlacerVec3.y + config.cameraExtraHeight
        targetCamPos.z = camPlacerVec3.z

        targetLookAt.x = lookAtVec3.x
        targetLookAt.y = lookAtVec3.y - config.cameraExtraHeight
        targetLookAt.z = lookAtVec3.z
      }

      if (this.viewCameraMode === 'behind') {
        lerperLookAt.lerp(targetLookAt, 0.2)
        lerperCamPos.lerp(targetCamPos, 0.2)
      } else if (this.viewCameraMode === 'face') {
        lerperLookAt.lerp(targetLookAt, 0.2)
        lerperCamPos.lerp(targetCamPos, 0.2)
      } else if (this.viewCameraMode === 'chase-left') {
        lerperLookAt.lerp(targetLookAt, 0.2)
        lerperCamPos.lerp(targetCamPos, 0.2)
      } else if (this.viewCameraMode === 'chase-right') {
        lerperLookAt.lerp(targetLookAt, 0.2)
        lerperCamPos.lerp(targetCamPos, 0.2)
      } else if (this.viewCameraMode === 'front') {
        lerperLookAt.lerp(targetLookAt, 0.2)
        lerperCamPos.lerp(targetCamPos, 0.2)
      } else if (this.viewCameraMode === 'close-left') {
        lerperLookAt.lerp(targetLookAt, 0.2)
        lerperCamPos.lerp(targetCamPos, 0.2)
      } else if (this.viewCameraMode === 'close-right') {
        lerperLookAt.lerp(targetLookAt, 0.2)
        lerperCamPos.lerp(targetCamPos, 0.2)
      } else if (this.viewCameraMode === 'firstperson') {
        lerperLookAt.lerp(targetLookAt, 0.2)
        lerperCamPos.lerp(targetCamPos, 0.2)
      } else if (this.viewCameraMode === 'firstback') {
        lerperLookAt.lerp(targetLookAt, 0.2)
        lerperCamPos.lerp(targetCamPos, 0.2)
      } else if (this.viewCameraMode === 'firstface') {
        lerperLookAt.lerp(targetLookAt, 0.2)
        lerperCamPos.lerp(targetCamPos, 0.2)
      }

      if (this.viewCameraMode === 'freecam') {
        this.controls.enabled = true
        this.controls.update()
      } else {
        this.controls.enabled = false
        if (this.useGyro && ['firstperson', 'firstback'].includes(this.viewCameraMode)) {
          lerperLookAt.y += this.extraHeight.y
          lerperLookAt.z += this.extraHeight.z
          lerperLookAt.x += this.extraHeight.x
        }
        this.camera.lookAt(lerperLookAt)
        this.camera.position.copy(lerperCamPos)
      }
    })
  }


  prepAnimation ({ pose, move, mixer, inPlace }) {
    if ((pose && !pose.animations) || (!pose)) {
      console.log(move.displayName)
      return Promise.reject(new Error('no pose'))
    }
    return new Promise((resolve) => {
      let action = false
      pose.animations.forEach((clip) => {
        if (inPlace) {
          // console.log(clip)
          if (clip.tracks[0] && clip.tracks[0].name === 'mixamorigHips.position') {
            let values = clip.tracks[0].values
            for (var i = 0; i < values.length; i += 3) {
              values[i + 0] = 0
              // values[i + 1] = 0
              values[i + 2] = 0
            }
          }
        }

        action = mixer.clipAction(clip)
        action.duration = clip.duration
        action.mixer = mixer
        resolve(action)
      });
    })
  }

  async loadMoveByName ({ name }) {
    let move = this.moves.find(e => e.displayName === name)
    if (!move) {
      console.log('cannot find ... ' + name)
    }
    let moveObj = await this.loadMove(move)
    return moveObj
  }

  async getActionByDisplayName ({ inPlace, name, mixer }) {
    let moveObj = await this.loadMoveByName({ name })
    let actionObj = await this.prepAnimation({ inPlace, move: moveObj, pose: moveObj.actionFBX, mixer })
    return actionObj
  }

  setWeight (action, weight) {
    action.enabled = true
    action.setEffectiveTimeScale(1)
    action.setEffectiveWeight(weight)
  }

  async loadMove (chosenMove) {
    if (!chosenMove) {
      throw new Error('no chosenMove')
    }
    let loaderFBX = new FBXLoader(LoadingManager)
    return await new Promise(async (resolve) => {
      if (chosenMove.actionFBX) {
        resolve(chosenMove)
        this.isLoadingMotion = false
        return
      }

      loaderFBX.load(chosenMove.url, (v) => {
        chosenMove.actionFBX = v
        resolve(chosenMove)
        this.isLoadingMotion = false
      }, (v) => {
      }, console.log)
    }, console.log)
  }

  async setupAnimationSystem ({ gltf, mixer }) {
    let parallelPreload = async () => {
      let arr = [
        'Mma Idle',
        // 'Northern Soul Floor Combo',
        'jump',

        'running',
        'control run backwards',

        'left strafe',
        'right strafe',

        'control turn left a bit',
        'control turn right a bit',

        'Warming Up',

        'Speedbag'
        // 'Hip Hop Dancing (3) copy'
      ]
      let waiters = []
      for (let name of arr) {
        waiters.push(this.loadMoveByName({ name }))
      }
      await Promise.all(waiters)
    }
    await parallelPreload()

    let mmaIdle = await this.getActionByDisplayName({ name: 'Mma Idle', mixer })
    let standIdle = await this.getActionByDisplayName({ name: 'idle', mixer })
    // let tauntTimerHand = await this.getActionByDisplayName({ name: 'Taunt (1)', mixer })

    // let victory = await this.getActionByDisplayName({ name: 'a1-Victory', mixer })

    let skillAction1 = await this.getActionByDisplayName({ name: 'Ymca Dance', mixer })
    let skillAction2 = await this.getActionByDisplayName({ name: 'Warming Up', mixer })

    let jump = await this.getActionByDisplayName({ inPlace: true, name: 'jump', mixer })
    let running = await this.getActionByDisplayName({ inPlace: true, name: 'running', mixer })
    let runningBack = await this.getActionByDisplayName({ inPlace: true, name: 'control run backwards', mixer })

    let leftStrafe = await this.getActionByDisplayName({ inPlace: true, name: 'left strafe', mixer })
    let rightStrafe = await this.getActionByDisplayName({ inPlace: true, name: 'right strafe', mixer })

    // let goForward = await this.getActionByDisplayName({ inPlace: true, name: 'control go forward', mixer })
    // let goBackward = await this.getActionByDisplayName({ inPlace: true, name: 'control go backward', mixer })
    // let goLeft = await this.getActionByDisplayName({ inPlace: true, name: 'control go left', mixer })
    // let goRight = await this.getActionByDisplayName({ inPlace: true, name: 'control go right', mixer })

    let turnLeft = await this.getActionByDisplayName({ inPlace: true, name: 'control turn left a bit', mixer })
    let turnRight = await this.getActionByDisplayName({ inPlace: true, name: 'control turn right a bit', mixer })

    let idle = standIdle
    mixer.stopAllAction()
    idle.play()

    this.charReady = true

    let toggleFightMode = () => {
      let last = idle
      if (idle === mmaIdle) {
        idle = standIdle
      } else if (idle === standIdle) {
        idle = mmaIdle
      }
      mixer.stopAllAction()
      idle.crossFadeFrom(last, 0.3, true)
      idle.play()
    }

    this.addEventListener('toggle-fight', () => {
      toggleFightMode()
    })

    this.addEventListener('dance', () => {
      this.dispatchEvent({ type: 'play-move', move: { displayName: 'Ymca Dance' }, cb: () => {} })
    })

    this.addEventListener('play-move', async ({ move, cb = () => {} }) => {
      try {
        let action = await this.getActionByDisplayName({ name: move.displayName, mixer })
        mixer.stopAllAction()
        action.crossFadeFrom(idle, 0.3, true)
        action.play()
      } catch (e) {
        console.log(e)
      }
    })

    // this.viewCameraMode = 'face'
    // this.dispatchEvent('play-move', { move: { displayName: 'Warming Up' }, cb: () => {} })

    // let moveForward, moveLeft, moveRight, moveBackward = false
    var onKeyDown = async (event) => {
      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          this.isTakingComplexAction = false
          await this.doStart({ canRestore: true, idle, to: running, mixer })
          break;

        case 37: // left
        case 65: // a
          this.isTakingComplexAction = false
          await this.doStart({ canRestore: true, idle, to: leftStrafe, mixer })
          break;

        case 40: // down
        case 83: // s
          this.isTakingComplexAction = false
          await this.doStart({ canRestore: true, idle, to: runningBack, mixer })
          break;

        case 39: // right
        case 68: // d
          this.isTakingComplexAction = false
          await this.doStart({ canRestore: true, idle, to: rightStrafe, mixer })
          break;

        case 32: // space
          this.isTakingComplexAction = false
          await this.doOnce({ idle, to: jump, mixer })
          break;

        case 82: // r
          setTimeout(async () => {
            this.isTakingComplexAction = true
            // this.viewCameraMode = 'firstperson'
            await this.doOnce({ idle, to: skillAction1, mixer }).catch(e => console.log(e))
            // this.viewCameraMode = 'firstperson'
            this.isTakingComplexAction = false
          })
          // await this.doOnce({ idle, to: skillAction1, mixer }).catch(e => console.log)

          break;

        case 84: // t
          setTimeout(async () => {
            this.isTakingComplexAction = true
            // this.viewCameraMode = 'firstperson'
            await this.doOnce({ idle, to: skillAction2, mixer }).catch(e => console.log(e))
            // this.viewCameraMode = 'firstperson'
            this.isTakingComplexAction = false
          })
          // await this.doOnce({ idle, to: skillAction1, mixer }).catch(e => console.log)

          break;

        case 81: // q
          await this.doStart({ idle, to: turnLeft, mixer, stopAll: false })
          break;
        case 69: // e
          await this.doStart({ idle, to: turnRight, mixer, stopAll: false })
          break;

        case 88: // x
          toggleFightMode()
          break;

        default:
          break
      }
    }

    var onKeyUp = async (event) => {
      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
          await this.doEnd({ idle: idle, to: running, mixer })
          break;

        case 37: // left
        case 65: // a
          await this.doEnd({ idle: idle, to: leftStrafe, mixer })
          break;

        case 40: // down
        case 83: // s
          await this.doEnd({ idle: idle, to: runningBack, mixer })
          break;

        case 39: // right
        case 68: // d
          await this.doEnd({ idle: idle, to: rightStrafe, mixer })
          break;

        case 81: // q
          await this.doEnd({ idle: idle, to: turnLeft, mixer })
          break;

        case 69: // e
          await this.doEnd({ idle: idle, to: turnRight, mixer })
          break;

          default:
            break
      }
    }

    this.addEventListener('go-forward', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 87 })
      } else {
        onKeyUp({ keyCode: 87 })
      }
    })

    this.addEventListener('go-backward', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 83 })
      } else {
        onKeyUp({ keyCode: 83 })
      }
    })

    this.addEventListener('go-left', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 65 })
      } else {
        onKeyUp({ keyCode: 65 })
      }
    })

    this.addEventListener('go-right', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 68 })
      } else {
        onKeyUp({ keyCode: 68 })
      }
    })

    this.addEventListener('turn-left', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 81 })
      } else {
        onKeyUp({ keyCode: 81 })
      }
    })

    this.addEventListener('turn-right', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 69 })
      } else {
        onKeyUp({ keyCode: 69 })
      }
    })

    this.addEventListener('key-r', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 82 })
      } else {
        onKeyUp({ keyCode: 82 })
      }
    })
    this.addEventListener('key-t', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 84 })
      } else {
        onKeyUp({ keyCode: 84 })
      }
    })

    this.addEventListener('key-x', (v) => {
      if (v.data) {
        onKeyDown({ keyCode: 88 })
      } else {
        onKeyUp({ keyCode: 88 })
      }
    })

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
  }
  async doMany ({ idle, to, mixer, stopAll = true }) {
    return new Promise((resolve) => {
      if (to.isRunning()) {
        resolve()
        return
      }
      if (stopAll) {
        mixer.stopAllAction()
      }
      to.reset()

      to.enabled = true
      // to.repetitions = 1
      // to.clampWhenFinished = true
      to.reset().play()

      setTimeout(() => {
        resolve()
      }, to.duration * 1000)
    })
  }
  async doOnce ({ idle, to, mixer, stopAll = true }) {
    return new Promise((resolve) => {
      if (to.isRunning()) {
        resolve()
        return
      }
      if (stopAll) {
        mixer.stopAllAction()
      }
      idle.reset()
      to.reset()

      let fade = 0.15

      to.enabled = true
      idle.enabled = true

      to.repetitions = 1
      to.clampWhenFinished = true
      to.reset().play()

      idle.crossFadeTo(to, fade * to.duration, false)

      let onEnd = () => {
        let idx = this.activeLog.indexOf(to)
        if (idx !== -1) {
          this.activeLog.splice(idx, 1)
        }

        let remain = this.activeLog[0]
        if (remain) {
          idle.fadeOut(to.duration * fade)
          idle = remain
        }

        idle.crossFadeFrom(to, fade * to.duration, false)
        idle.enabled = true
        idle.play()
      }

      // let hh = (to) => {
      //   if (ev.action === to) {
      //     mixer.addEventListener('finished', hh)
      //     onEnd()
      //   }
      // }
      // mixer.addEventListener('finished', hh)

      clearTimeout(this.doOnceTimeout)
      this.doOnceTimeout = setTimeout(() => {
        onEnd()
      }, to.duration * 1000 * (1.0 - fade))

      setTimeout(() => {
        resolve()
      }, to.duration * 1000)
    })
  }
  async doStart ({ idle, to, mixer, canRestore = false, stopAll = true, fade = 0.3 }) {
    return new Promise((resolve, reject) => {
      if (to.isRunning()) {
        resolve(false)
        return
      }
      if (stopAll) {
        mixer.stopAllAction()
      }
      idle.reset()
      to.reset()

      // fade = 0.15

      to.enabled = true
      idle.enabled = true

      to.repetitions = Infinity
      to.clampWhenFinished = true
      to.reset().play()

      this.activeLog.push(to)

      idle.crossFadeTo(to, fade * to.duration, false)
      resolve(true)
    })
  }
  async doEnd ({ idle, to, mixer }) {
    return new Promise((resolve) => {
      let fade = 0.3

      let idx = this.activeLog.indexOf(to)
      if (idx !== -1) {
        this.activeLog.splice(idx, 1)
      }

      let remain = this.activeLog[0]
      if (remain) {
        idle.fadeOut(to.duration * fade)
        idle = remain
      }

      idle.crossFadeFrom(to, fade * to.duration, false)
      idle.enabled = true
      idle.play()
    })
  }
  goSet (key, val) {
    this[key] = val
  }
  setupCharSkeleton ({ gltf }) {
    gltf.scene.traverse(async (item) => {
      if (item && item.name === 'mixamorigSpine2') {
        let guyCenter = new Object3D()
        guyCenter.position.y = 0
        item.add(guyCenter)
        this.goSet('guy', guyCenter)
      }

      if (item && item.name === 'mixamorigSpine') {
        let guyBack = new Object3D()
        guyBack.position.y = 0
        guyBack.position.z = 0
        item.add(guyBack)
        this.goSet('guyBack', guyBack)
      }

      if (item && item.name === 'mixamorigNeck') {
        let guyNeck = new Object3D()
        guyNeck.position.y = 0
        guyNeck.position.z = 0
        item.add(guyNeck)
        this.goSet('guyNeck', guyNeck)
      }

      if (item && item.name === 'mixamorigHead') {
        let guyFace = new Object3D()
        guyFace.position.x = 0
        guyFace.position.y = 0
        guyFace.position.z = 0
        item.add(guyFace)
        this.goSet('guyFace', guyFace)
      }

      if (item && item.name === 'mixamorigHead') {
        let guyHeadCam = new Object3D()
        guyHeadCam.position.x = 0
        guyHeadCam.position.y = 0
        guyHeadCam.position.z = -10
        item.add(guyHeadCam)
        this.goSet('guyHeadCam', guyHeadCam)
      }

      if (item && item.name === 'mixamorigHead') {
        let guyHead = new Object3D()
        guyHead.position.y = 0
        guyHead.position.z = 0
        item.add(guyHead)
        this.goSet('guyHead', guyHead)
      }

      if (item && item.name === 'mixamorigHips') {
        let guyHip = new Object3D()
        guyHip.position.y = 0
        guyHip.position.z = 0
        item.add(guyHip)
        this.goSet('guyHip', guyHip)
      }

      // console.log(item.name)
    })
  }

  setupCharEffect ({ gltf }) {
    let chroma = this.chroma
    gltf.scene.traverse((item) => {
      if (item.isMesh) {
        item.frustumCulled = false
      }
      if (chroma && item.name === 'Mesh_0') {
        item.material.transparent = true
        item.material.envMap = chroma.out.envMap
      }
      if (chroma && item.name === 'Mesh_1') {
        item.material.transparent = true
        item.material.envMap = chroma.out.envMap
      }
    })
  }
}
