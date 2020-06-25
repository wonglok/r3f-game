import React, { Suspense, useRef, useMemo } from 'react'
import { Canvas } from 'react-three-fiber'
// import { OrbitControls } from 'drei'
import GL from '../GLContent'
import { EventDispatcher } from 'three'

export default function () {
  let touch = useRef()
  let bus = useMemo(() => {
    let evts = new EventDispatcher()
    return evts
  }, [])
  let gui = useMemo(() => {
    return (type, data) => {
      bus.dispatchEvent({ type: 'pass', encap: { type, data } })
      // console.log('gui', { type, data })
    }
  }, [bus])

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
      <div className="absolute z-10 bottom-0 left-0 pb-6 pl-6">
      <div className="flex justify-center">
        <div className="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-2 my-2 border-gray-100 border bg-white text-20 text-white" onTouchStart={() => gui('go-forward', true)} onTouchEnd={() => gui('go-forward', false)} onMouseDown={() => gui('go-forward', true)} onMouseUp={() => gui('go-forward', false)}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/up.svg')} alt="Go Forward" />
          </div>
        </div>
        <div>
          <div className="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-2 my-2 border-gray-100 border bg-white text-20 text-white" onTouchStart={() => gui('go-backward', true)} onTouchEnd={() => gui('go-backward', false)} onMouseDown={() => gui('go-backward', true)} onMouseUp={() => gui('go-backward', false)}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/down.svg')} alt="Go Forward" />
          </div>
        </div>
      </div>
      <div className="absolute z-10 bottom-0 right-0 pb-6 pr-6">
        <div>
          <div className="inline-block cursor-pointer rounded-full touch-action-manipulation text-center select-none p-3 mx-2 my-2 border-gray-100 border bg-white text-20 text-white" onClick={() => gui('dance', {})}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/dance.svg')} alt="" />
          </div>
          <div className="inline-block cursor-pointer rounded-full touch-action-manipulation text-center select-none p-3 mx-2 my-2 border-gray-100 border bg-white text-20 text-white" onClick={() => gui('toggle-fight', {})}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/gamepad.svg')} alt="" />
          </div>
        </div>
        <div>
          <div className="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-2 my-2 border-gray-100 border bg-white text-20 text-white" onTouchStart={() => gui('go-left', true)} onTouchEnd={() => gui('go-left', false)} onMouseDown={() => gui('go-left', true)} onMouseUp={() => gui('go-left', false)}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/left.svg')} alt="Go Forward" />
          </div>
          <div className="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-2 my-2 border-gray-100 border bg-white text-20 text-white" onTouchStart={() => gui('go-right', true)} onTouchEnd={() => gui('go-right', false)} onMouseDown={() => gui('go-right', true)} onMouseUp={() => gui('go-right', false)}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/right.svg')} alt="Go Forward" />
          </div>
        </div>
      </div>
    </>
  )
}
