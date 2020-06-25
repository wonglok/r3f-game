import React, { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from 'react-three-fiber'
import { Character } from '../Game/Character'
import { HTML as HTMLAttach } from 'drei'

// import { TorusKnot } from 'drei'
// import './styles.css'


export default function ({ bus, touch, ...props }) {
  // This reference will give us direct access to the mesh
  const grouper = useRef()
  let { gl, camera } = useThree()

  let tasks = useMemo(() => [], [])

  useFrame(() => {
    for (let task of tasks) {
      task()
    }
  })
  let [show, setShow] = useState(false)

  let character = useMemo(() => {
    let loop = task => tasks.push(task)
    let char = new Character({ renderer: gl, element: touch.current, loop, camera })
    char.out.done.then(() => {
      setShow(true)
    })

    bus.addEventListener('pass', ({ encap }) => {
      // forward GUI
      let { type, data } = encap
      char.dispatchEvent({
        type,
        data
      })
    })

    return char
  }, [bus, gl, tasks, camera, touch])

  return (
    <group
      {...props}
      ref={grouper}
    >
      <primitive object={character.out.o3d}>
        {show ? <HTMLAttach>
          <div className="bg-gray-300 p-3 text-black cursor-pointer select-none" onClick={character.dispatchEvent('dance')}>
            Lok
          </div>
        </HTMLAttach> : <></>}
      </primitive>
    </group>
  )
}
