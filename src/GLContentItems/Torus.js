import React, { useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import { TorusKnot } from 'drei'
// import './styles.css'

export default function Guy () {
  const mesh = useRef()
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y = mesh.current.rotation.z += 0.01))
  return (
    <TorusKnot ref={mesh} args={[1, 0.4, 100, 16]}>
      <meshNormalMaterial attach="material" />
    </TorusKnot>
  )
}