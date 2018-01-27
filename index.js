const config = require('./config')
const DirWatcher = require('./dirwatcher')
const Importer = require('./importer')

const watcher = new DirWatcher()
const importer = new Importer({ outputPath: config.outputPath })

watcher.watch(config.importPath, 3000)
importer.listen(watcher, process.argv[2] === '--sync')
