import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FileLoader } from 'three'
import { LoadingManager } from './LoadingManager'

export const rafSleep = () => new Promise((resolve) => { window.requestAnimationFrame(resolve) })

let localforage = require('localforage')
let loadArrayBuffer = async (url) => {
  return new Promise((resolve) => {
    let loaderFile = new FileLoader(LoadingManager)
    loaderFile.setResponseType('arraybuffer')
    loaderFile.load(url, (arrbuff) => {
      resolve(arrbuff)
    }, (v) => {
      let manager = LoadingManager
      if (manager.onURL) {
        manager.onURL(url, v.loaded / v.total)
      }
    })
  })
}

let provideArrayBuffer = async (url, store) => {
  let NS = 'array-buffer-@' + url
  try {
    var value = await store.getItem(NS);
    if (!value) {
      let arrayBuffer = await loadArrayBuffer(url)
      value = arrayBuffer
      await store.setItem(NS, arrayBuffer)
    }
    // console.log(value)
    return value
  } catch (err) {
    console.log(err)
    await store.removeItem(NS)
  }
}

let modelParser = (arrBuff) => {
  return new Promise((resolve) => {
    let loaderModel = new GLTFLoader(LoadingManager)
    loaderModel.parse(arrBuff, '/', (parsed) => {
      console.log(parsed)
      resolve(parsed)
    })
  })
}

export const loadGLTF = async (url) => {
  var store = localforage.createInstance({
    name: 'localGLB'
  });

  let arrayBuffer = await provideArrayBuffer(url, store)
  await rafSleep()
  let gltfobj = await modelParser(arrayBuffer)
  await rafSleep()

  return gltfobj
}

export class StoreGLTFLoader {
  load (url, resolve) {
    loadGLTF(url)
      .then((gltf) => {
        resolve(gltf)
      })
  }
}
