import { DefaultLoadingManager } from 'three'
DefaultLoadingManager.loadProgress = 0
DefaultLoadingManager.stats = { itemsLoaded: 0, itemsTotal: 1 }
DefaultLoadingManager.hooks = []
DefaultLoadingManager.onURL = (url, progress) => {
  let { itemsLoaded, itemsTotal } = DefaultLoadingManager.stat
  let overallProgressDetailed = itemsLoaded / itemsTotal + progress / itemsTotal
  DefaultLoadingManager.loadProgress = (overallProgressDetailed)
  // DefaultLoadingManager.hooks.forEach(e => e(DefaultLoadingManager.loadProgress))
}
DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  DefaultLoadingManager.loadProgress = (itemsLoaded / itemsTotal)
  DefaultLoadingManager.stat = { itemsLoaded, itemsTotal }
  DefaultLoadingManager.hooks.forEach(e => e(DefaultLoadingManager.loadProgress))
}
DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
  DefaultLoadingManager.loadProgress = (itemsLoaded / itemsTotal)
  DefaultLoadingManager.stat = { itemsLoaded, itemsTotal }
  DefaultLoadingManager.hooks.forEach(e => e(DefaultLoadingManager.loadProgress))
}
DefaultLoadingManager.onEnd = (url, itemsLoaded, itemsTotal) => {
  DefaultLoadingManager.loadProgress = (itemsLoaded / itemsTotal)
  DefaultLoadingManager.stat = { itemsLoaded, itemsTotal }
  DefaultLoadingManager.hooks.forEach(e => e(DefaultLoadingManager.loadProgress))
}

export const LoadingManager = DefaultLoadingManager