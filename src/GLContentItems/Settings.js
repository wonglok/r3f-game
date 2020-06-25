
import React from 'react'
import { useThree } from 'react-three-fiber'

export default function Settings () {
  let { gl, camera } = useThree()
  gl.setPixelRatio(window.devicePixelRatio || 1.0)
  camera.far = 1000000000
  return (
    <>
    </>
  )
}