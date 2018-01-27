const path = require('path')
const fs = require('fs')

const EOL_REGEX = /\r?\n/
// https://stackoverflow.com/a/23667311/1606662
const SEPARATOR_REGEX = /"[^"]+"|(,)/g
const QUOTE_REGEX = /"/g
const SEPARATOR = '|||'

function parseLine (line) {
  return line
    .replace(SEPARATOR_REGEX, (match, group1) => {
      return group1
        ? SEPARATOR
        : match.replace(QUOTE_REGEX, '')
    })
    .split(SEPARATOR)
}

function parseCSV (content) {
  if (!content) {
    throw new Error('[Importer] Cannot parse CSV: no data')
  }

  const lines = content.split(EOL_REGEX)
  const headerCells = parseLine(lines[0])

  let result = lines
    .slice(1)
    .map((line) => {
      let columns = parseLine(line)
      return headerCells.reduce((dataRow, header, index) => {
        dataRow[header] = columns[index]
        return dataRow
      }, {})
    })

  return result
}

function getOutputFilename (outputPath, inputFilename) {
  const pathParts = path.parse(inputFilename)

  return path.format({
    dir: path.resolve(outputPath),
    name: pathParts.name,
    ext: '.json'
  })
}

function getOutputData (parseResult, outputPath, inputFilename) {
  return {
    content: JSON.stringify(parseResult, null, 2),
    filename: getOutputFilename(outputPath, inputFilename)
  }
}

class Importer {
  constructor ({ outputPath }) {
    this.outputPath = outputPath
  }

  listen (watcher, sync = false) {
    console.info('[Importer] Listening. Import:', sync ? 'sync' : 'async')

    const importMethod = (sync ? this.importSync : this.import).bind(this)

    watcher.on('dirwatcher:changed', (path) => {
      console.log('[Importer] Importing', path)
      importMethod(path)
    })
  }

  import (path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf8', (err, contents) => {
        if (err) { reject(err) }

        let result = parseCSV(contents)
        let output = getOutputData(result, this.outputPath, path)

        fs.writeFile(output.filename, output.content, 'utf8', (err) => {
          if (err) { reject(err) }

          console.info('[Importer] Imported to', output.filename)
          resolve(result)
        })
      })
    })
  }

  importSync (path) {
    let contents = fs.readFileSync(path, 'utf8')

    let result = parseCSV(contents)
    let output = getOutputData(result, this.outputPath, path)

    fs.writeFileSync(output.filename, output.content, 'utf8')
    console.info('[Importer] Imported to', output.filename)

    return result
  }
}

module.exports = Importer
