import React, { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from 'react-three-fiber'
import { Character } from '../Game/Character'
import { HTML as HTMLAttach } from 'drei'

// import { TorusKnot } from 'drei'
// import './styles.css'

export default function ({ bus, touch, ...props }) {
  // This reference will give us direct access to the mesh
  const grouper = useRef()
  let { gl, scene, camera } = useThree()

  let tasks = useMemo(() => [], [])

  useFrame(() => {
    for (let task of tasks) {
      task()
    }
  })
  let [show, setShow] = useState(false)

  let character = useMemo(() => {
    let loop = task => tasks.push(task)
    let char = new Character({ scene, renderer: gl, element: touch.current, loop, camera })
    char.out.done.then(() => {
      setShow(true)
    })

    bus.addEventListener('pass', ({ encap }) => {
      // forward GUI
      let { type, data } = encap
      char.dispatchEvent({
        type,
        data,
        from: bus
      })
    })

    return char
  }, [bus, scene, gl, tasks, camera, touch])

  return (
    <group
      {...props}
      ref={grouper}
    >
      <primitive object={character.out.o3d}>
        {show ?
          <HTMLAttach
          >
            <div style={{ width: '80px', transform: 'translateX(-40px)' }} className=" text-center bg-blue-500 z-30 text-sm rounded-full text-white cursor-pointer select-none">
              <div className="inline-block px-3 py-2" onClick={() => character.dispatchEvent({ type: 'dance', data: {} })}>Lok</div>
            </div>
          </HTMLAttach>
        : <>
        </>}
      </primitive>
    </group>
  )
}
