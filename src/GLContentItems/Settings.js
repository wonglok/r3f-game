
import React from 'react'
import { useThree } from 'react-three-fiber'

export default function Settings () {
  let { gl, camera } = useThree()
  gl.setPixelRatio(window.devicePixelRatio || 1.0)
  camera.far = 10000000000000
  camera.updateProjectionMatrix()
  return (
    <>
    </>
  )
}