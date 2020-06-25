import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from 'react-three-fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { MeshMatcapMaterial, DoubleSide, Color, Object3D, TextureLoader } from 'three'
import { ShaderCube, LoadingManager } from '../Reusable'
// import { TorusKnot } from 'drei'
// import './styles.css'

export default function SpaceWalk (props) {
  const grouper = useRef()
  let { gl } = useThree()
  let tasks = useMemo(() => [], [])
  useFrame(() => {
    try {
      tasks.forEach(t => t())
    } catch (e) {
      console.log(e)
    }
  })

  let o3d = useMemo(() => {
    let url = require('../assets/fbx/space-walk.fbx')
    let ob3d = new Object3D()
    let loader = new FBXLoader(LoadingManager)
    let silverTextureURL = require('../assets/matcap/silver.png')
    let textureLaoder = new TextureLoader()
    let silverTexture = textureLaoder.load(silverTextureURL)
    let loop = (task) => {
      tasks.push(task)
    }
    let shaderCube = new ShaderCube({ renderer: gl, loop, res: 32, color: new Color('#ffffff') })
    loader.load(url, (fbx) => {
      fbx.traverse((item) => {
        if (item.isMesh) {
          item.material = shaderCube.out.material
          if (item.name === 'Mesh018' || item.name === 'Mesh017' || item.name === 'Mesh013')
          item.material = new MeshMatcapMaterial({ matcap: silverTexture, side: DoubleSide })
        }
      })
      let scale = 0.5
      grouper.current.position.y = 245 * scale
      grouper.current.scale.x = scale
      grouper.current.scale.y = scale
      grouper.current.scale.z = scale
      o3d.add(fbx)
    })
    return ob3d
  }, [tasks, gl])

  return (
    <group
      {...props}
      ref={grouper}
    >
      <primitive object={o3d}></primitive>
    </group>
  )
}
