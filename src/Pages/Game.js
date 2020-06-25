import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas } from 'react-three-fiber'
// import { OrbitControls } from 'drei'
import GL from '../GLContent'
import { EventDispatcher } from 'three'

export default function () {
  let touch = useRef()
  let bus = useMemo(() => {
    return new EventDispatcher()
  }, [])

  return (
    <>
      <Canvas>
        <Suspense fallback={null}>
          <GL.Settings />
          <GL.GameChar bus={bus} touch={touch} rotation={[0, Math.PI, 0]} scale={[10, 10, 10]}  />
          <GL.SpaceWalk />
        </Suspense>

        {/* <OrbitControls></OrbitControls> */}

        <ambientLight intensity={3} />
        {/* <pointLight position={[0, 0, 10]} /> */}
        {/* <Box position={[1.2, 0, 0]} /> */}
        {/* <OrbitControls></OrbitControls> */}
      </Canvas>
      <div ref={touch} className="absolute top-0 left-0 w-full h-full"></div>
      <div className="absolute z-10 bottom-0 left-0 pb-8 pl-8">

      </div>
      <div className="absolute z-10 bottom-0 right-0 pb-8 pl-8">

      </div>
    </>
  )
}
