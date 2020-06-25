import { getID } from '../Reusable'

export class Moves {
  constructor () {
    let controlMapper = require('../assets/actions/controls/fbx').default
    let gestureMapper = require('../assets/actions/gesture/fbx').default
    let locomotionMapper = require('../assets/actions/locomotion/fbx').default
    let thrillerMapper = require('../assets/actions/thriller/fbx').default
    let breakdancesMapper = require('../assets/actions/breakdance/fbx').default
    let danceingMapper = require('../assets/actions/dancing/fbx').default
    let capoeiraMapper = require('../assets/actions/capoeira/fbx').default
    let rifleMapper = require('../assets/actions/rifle/fbx').default
    let mmaMapper = require('../assets/actions/mma/fbx').default
    let kickMapper = require('../assets/actions/kick/fbx').default
    let hurtMapper = require('../assets/actions/hurt/fbx').default
    let boxingMapper = require('../assets/actions/boxing/fbx').default
    let boxinghitMapper = require('../assets/actions/boxinghit/fbx').default
    let idleMapper = require('../assets/actions/idle/fbx').default
    let kneeMapper = require('../assets/actions/knee/fbx').default
    let superheroMapper = require('../assets/actions/superhero/fbx').default
    let prayerMapper = require('../assets/actions/prayer/fbx').default
    // kneeMapper

    let movesOrig = []
    let addToList = ({ mapper, type }) => {
      let arr = []
      for (let kn in mapper) {
        arr.push({
          type,
          _id: getID(),
          displayName: kn,
          actionFBX: false,
          fbx: false,
          url: mapper[kn]
        })
      }
      arr.sort((a, b) => {
        if (a.displayName > b.displayName) {
            return 1
        } else if (b.displayName > a.displayName) {
            return -1
        } else {
          return 0
        }
      })
      movesOrig = [
        ...movesOrig,
        ...arr
      ]
      // let waiters = []
      // if (preload) {
      //   for (let mymove of arr) {
      //     waiters.push(this.loadMove(mymove))
      //   }
      // }
      // await Promise.all(waiters)
      return arr
    }

    addToList({ mapper: prayerMapper, type: 'ready' })
    addToList({ mapper: idleMapper, type: 'ready' })
    addToList({ mapper: gestureMapper, type: 'ready' })

    addToList({ mapper: thrillerMapper, type: 'dance' })
    addToList({ mapper: breakdancesMapper, type: 'dance' })
    addToList({ mapper: danceingMapper, type: 'dance' })

    addToList({ mapper: superheroMapper, type: 'action' })

    addToList({ mapper: kneeMapper, type: 'combat' })
    addToList({ mapper: kickMapper, type: 'combat' })
    addToList({ mapper: boxingMapper, type: 'combat' })
    addToList({ mapper: mmaMapper, type: 'combat' })
    addToList({ mapper: boxinghitMapper, type: 'combat' })
    addToList({ mapper: hurtMapper, type: 'combat' })

    addToList({ mapper: locomotionMapper, type: 'control' })
    addToList({ mapper: rifleMapper, type: 'control' })
    addToList({ mapper: controlMapper, type: 'control' })
    addToList({ mapper: capoeiraMapper, type: 'dance' })

    return movesOrig
  }
}

