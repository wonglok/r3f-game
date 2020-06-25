import { Scene, Color, WebGLRenderTarget } from 'three'
import React, { useRef, useMemo } from 'react'
import { createPortal, useFrame } from 'react-three-fiber'
import { PerspectiveCamera, TorusKnot, Box } from 'drei'
// import './styles.css'

function SpinningThing() {
  const mesh = useRef()
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y = mesh.current.rotation.z += 0.01))
  return (
    <TorusKnot ref={mesh} args={[1, 0.4, 100, 16]}>
      <meshNormalMaterial attach="material" />
    </TorusKnot>
  )
}

export default function SpecialCube () {
  const cam = useRef()
  const [scene, target] = useMemo(() => {
    const scene = new Scene()
    scene.background = new Color('orange')
    const target = new WebGLRenderTarget(1024, 1024)
    return [scene, target]
  }, [])

  useFrame(state => {
    cam.current.position.z = 5 + Math.sin(state.clock.getElapsedTime() * 1.5) * 2
    state.gl.setRenderTarget(target)
    state.gl.render(scene, cam.current)
    state.gl.setRenderTarget(null)
  })

  return (
    <>
      <PerspectiveCamera ref={cam} position={[0, 0, 3]} />
      {createPortal(<SpinningThing />, scene)}
      <Box args={[2, 2, 2]}>
        <meshStandardMaterial attach="material" map={target.texture} />
      </Box>
    </>
  )
}
