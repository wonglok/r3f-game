import React, { Suspense, useRef, useMemo, useState } from 'react'
// import { createPortal }  from 'react-dom' // createPortal
import { Canvas, useThree, useFrame } from 'react-three-fiber'
// import { OrbitControls } from 'drei'
import GL from '../GLContent'
import { EventDispatcher } from 'three'
import { Character } from '../Game/Character'
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

function Game ({ bus, touch, ...props }) {
  let { gl, scene, camera } = useThree()

  let tasks = useMemo(() => [], [])
  useFrame(() => {
    for (let task of tasks) {
      task()
    }
  })

  let character = useMemo(() => {
    let loop = task => tasks.push(task)
    // console.log(gl)
    let char = new Character({ bus, scene, renderer: gl, element: touch.current, loop, camera })
    bus.dispatchEvent({ type: 'character', data: char })
    return char
  }, [bus, scene, gl, tasks, camera, touch])

  return <>
    <Suspense fallback={null}>
      <GL.Settings />
      <GL.GameChar character={character} rotation={[0, Math.PI, 0]} scale={[10, 10, 10]}  />
      <GL.SpaceWalk />
    </Suspense>
    <ambientLight intensity={3} />
  </>
}

function GUI ({ game, ...props }) {
  let gui = useMemo(() => {
    return (type, data) => {
      game.dispatchEvent({ type, data })
    }
  }, [game])
  return (
    <>
    <div className="absolute z-10 bottom-0 left-0 pb-4 pl-4">
      <div>
        <div className={`inline-block cursor-pointer rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border ${game.useGyro ? 'bg-blue-400' : 'bg-white'} text-20 text-white`} onClick={() => gui('toggle-gyro', {})}>
          <img className=" scale-75 transform select-none  pointer-events-none" src={require('./img/gyro.svg')} alt="" />
        </div>
        <div className="inline-block cursor-pointer rounded-full touch-action-manipulation text-center select-none p-3 mx-1 my-1 border-gray-100 border bg-white text-20 text-white" onClick={() => gui('toggle-camcorder', {})}>
          {
            game.viewCameraMode === 'freecam' ?
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
      { game.useGyro || game.viewCameraMode === 'freecam' ? <div></div> : <div>
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

export default function () {
  let touch = useRef()
  let renderUI = useState(false)[1]
  // let [viewCamMode, setCamMode] = useState(false)
  let [game, setGame] = useState(false)

  let bus = useMemo(() => {
    let evts = new EventDispatcher()

    evts.addEventListener('renderUI', () => {
      renderUI(Math.random())
    })

    evts.addEventListener('character', (event) => {
      setGame(event.data)
    })

    return evts
  }, [renderUI])

  return (
    <>
      <Canvas>
        <Game bus={bus} touch={touch}></Game>
      </Canvas>
      <div ref={touch} className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
        <Loading></Loading>
      </div>
      {game && game.charReady ? <GUI game={game}></GUI> : false}
    </>
  )
}
