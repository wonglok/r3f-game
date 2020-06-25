import { lazy } from 'react'
var path = require('path')
let exporter = {}

function importAll (r, type) {
  r.keys().forEach(key => {
    let filename = path.basename(key).replace('.js', '')

    // exporter[filename] = () => new Promise((resolve) => {
    //   if (type === 'sync') {
    //     resolve(r(key).default)
    //   } else if (type === 'lazy') {
    //     r(key).then((mod) => {
    //       resolve(lazy(() => Promise.resolve(mod.default)))
    //     })
    //   }
    // })

    exporter[filename] = lazy(() => r(key))

    // () => new Promise((resolve) => {
    //   if (type === 'sync') {
    //     resolve(r(key).default)
    //   } else if (type === 'lazy') {
    //     r(key).then((mod) => {
    //       resolve(lazy(() => Promise.resolve(mod.default)))
    //     })
    //   }
    // })
  })
  return exporter
}

importAll(require.context('./GLContentItems', true, /\.js$/, 'lazy'), 'lazy')

export default exporter

