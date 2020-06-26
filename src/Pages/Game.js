import React, { Suspense, useRef, useMemo, useState } from 'react'
import { Canvas } from 'react-three-fiber'
// import { OrbitControls } from 'drei'
import GL from '../GLContent'
import { EventDispatcher } from 'three'

import { LoadingManager } from '../Reusable/index'
function Loading () {
  let [show, setShow] = useState(false)
  // let [loaded, setLoad] = useState('0%')
  LoadingManager.hooks.push((v) => {
    if (v > 0) {
      setShow(true)
    }
    if (v === 1) {
      setShow(false)
    }
    // setLoad(`${(v * 100).toFixed(1)}%`)
  })
  return (
    <div className={`p-3 bg-white rounded ${show ? 'block' : 'hidden'}`}>Loading...</div>
  )
}

export default function () {
  let touch = useRef()
  let [useGyro, setUseGyro] = useState(false)
  let [viewCamMode, setCamMode] = useState(false)
  let bus = useMemo(() => {
    let evts = new EventDispatcher()
    evts.addEventListener('useGyro', (event) => {
      setUseGyro(event.data)
    })
    evts.addEventListener('viewCamMode', (event) => {
      console.log(event)
      setCamMode(event.data)
    })
    return evts
  }, [])

  let gui = useMemo(() => {
    return (type, data) => {
      bus.dispatchEvent({ type: 'pass', encap: { type, data, from: bus } })
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
      <div ref={touch} className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
        <Loading></Loading>
      </div>
      <div className="absolute z-10 bottom-0 left-0 pb-4 pl-4">
        <div>
        <div className={`inline-block cursor-pointer rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border ${useGyro ? 'bg-blue-400' : 'bg-white'} text-20 text-white`} onClick={() => gui('toggle-gyro', {})}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/gyro.svg')} alt="" />
          </div>
          <div className="inline-block cursor-pointer rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" onClick={() => gui('toggle-camcorder', {})}>
            {
              viewCamMode === 'freecam' ?
              <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/touch.svg')} alt="" />
              :
              <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/camcorder.svg')} alt="" />
            }
          </div>
        </div>
        <div className="">
          <div className="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" onTouchStart={() => gui('go-forward', true)} onTouchEnd={() => gui('go-forward', false)} onMouseDown={() => gui('go-forward', true)} onMouseUp={() => gui('go-forward', false)}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/up.svg')} alt="Go Forward" />
          </div>
          <div className="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" onTouchStart={() => gui('go-backward', true)} onTouchEnd={() => gui('go-backward', false)} onMouseDown={() => gui('go-backward', true)} onMouseUp={() => gui('go-backward', false)}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/down.svg')} alt="Go Forward" />
          </div>
        </div>
      </div>
      <div className="absolute z-10 bottom-0 right-0 pb-4 pr-4">
        <div>
          <div className="inline-block cursor-pointer rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" onClick={() => gui('dance', {})}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/dance.svg')} alt="" />
          </div>
          <div className="inline-block cursor-pointer rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" onClick={() => gui('toggle-fight', {})}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/gamepad.svg')} alt="" />
          </div>
        </div>
        { useGyro || viewCamMode === 'freecam' ? <div></div> : <div>
          <div className="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" onTouchStart={() => gui('turn-left', true)} onTouchEnd={() => gui('turn-left', false)} onMouseDown={() => gui('turn-left', true)} onMouseUp={() => gui('turn-left', false)}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/turn-left.svg')} alt="Turn Left" />
          </div>
          <div className="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" onTouchStart={() => gui('turn-right', true)} onTouchEnd={() => gui('turn-right', false)} onMouseDown={() => gui('turn-right', true)} onMouseUp={() => gui('turn-right', false)}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/turn-right.svg')} alt="Turn Right" />
          </div>
        </div> }
        <div>
          <div className="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" onTouchStart={() => gui('go-left', true)} onTouchEnd={() => gui('go-left', false)} onMouseDown={() => gui('go-left', true)} onMouseUp={() => gui('go-left', false)}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/left.svg')} alt="Go Left" />
          </div>
          <div className="inline-block rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" onTouchStart={() => gui('go-right', true)} onTouchEnd={() => gui('go-right', false)} onMouseDown={() => gui('go-right', true)} onMouseUp={() => gui('go-right', false)}>
            <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/right.svg')} alt="Go Right" />
          </div>
        </div>
      </div>
    </>
  )
}
