require('requestidlecallback')

export const idleSleep = () => new Promise((resolve) => { window.requestIdleCallback(resolve) })
export const rafSleep = () => new Promise((resolve) => { window.requestAnimationFrame(resolve) })

export const getID = () => {
  return '_' + Math.random().toString(36).substr(2, 9)
}

export { ShaderCube } from './shaderCube'
export { ShaderCubeRefraction } from './shaderCubeRefraction'
export { ShaderCubeChrome } from './shaderCubeChrome'
export { ShaderCubeSea } from './shaderCubeSea'
export { ShaderCubeChromatics } from './shaderCubeChromatics'

export { LoadingManager } from './LoadingManager'

export { loadGLTF, StoreGLTFLoader } from './loadGLTF'
