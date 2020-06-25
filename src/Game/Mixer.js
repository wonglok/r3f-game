import { AnimationMixer, Clock } from 'three'

const TWEEN = require('@tweenjs/tween.js').default

export class Mixer {
  constructor ({ loop, actor }) {
    var mixer = new AnimationMixer(actor)
    let clock = new Clock()
    loop(() => {
      let dt = clock.getDelta()
      TWEEN.update()
      mixer.update(dt)
    })
    return mixer
  }
}