const chokidar = require('chokidar')
const events = require('events')
const nodePath = require('path')

class DirWatcher extends events.EventEmitter {
  watch (path, delay) {
    const watcher = chokidar.watch(path + '/*.csv', {
      ignoreInitial: true,
      usePolling: true,
      awaitWriteFinish: {
        stabilityThreshold: delay
      }
    })

    const emitChangeEvent = (path) => {
      this.emit('dirwatcher:changed', path)
    }

    watcher
      .on('add', emitChangeEvent)
      .on('change', emitChangeEvent)
      .on('ready', () => {
        console.log('[DirWatcher] Watching', nodePath.resolve(path))
      })

    return watcher
  }
}

module.exports = DirWatcher
