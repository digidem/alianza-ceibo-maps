#!/usr/bin/env node

const fs = require('fs')
const glob = require('glob')
const roundTo = require('round-to')
const {coordEach} = require('@turf/meta')
const buffer = require('@turf/buffer')
const d3 = require('d3-ease')
const rewind = require('geojson-rewind')
const mapshaper = require('mapshaper')

const mapshaperCommands = '-simplify visvalingam weighted weighting=2 interval=2000 keep-shapes'

const all = {
  type: 'FeatureCollection',
  features: []
}

const easePoly = d3.easePolyOut.exponent(0.5)

const files = glob.sync('original/*.geojson')

files.forEach(function (filename) {
  const geojson = JSON.parse(fs.readFileSync(filename, 'utf8'))
  pushArray(all.features, geojson.features)
})

all.features = all.features
  // STEP 1: buffer each feature by 1km to smooth out boundary
  // .map(f => {
  //   const buffered = buffer(f, 1, 'kilometers')
  //   // buffered.properties = f.properties
  //   // buffered.properties._id = f.id
  //   return buffered
  // })
  // STEP 2: add multiple buffers up to 10km, gradually increasing
  // spacing between buffers to get a visually smooth gradient
  // .reduce(bufferReduce, [])
  // STEP 3: Round coordinates to 6 decimal places
  .map(round)
  .map(f => ({
    type: f.type,
    geometry: f.geometry,
    properties: {
      nacionalidad: f.properties.nacionalidad,
      name: f.properties.nombre,
      _id: f.id
    }
  }))
  // STEP 4: Ensure winding order is correct
  .map(f => rewind(f))

simplify(all, (err, geojson) => {
  if (err) return console.error(err)
  all.features = geojson.features.map(f => rewind(f))
  save()
})

function save () {
  fs.writeFileSync('areas.geojson', JSON.stringify(all, null, 2))
}

function round (f) {
  coordEach(f, function (coord) {
    for (let i = 0; i < 2; i++) {
      // roundTo bug https://github.com/sindresorhus/round-to/issues/7
      coord[i] = Math.abs(coord[i]) < 0.000001 ? 0 : roundTo(coord[i], 6)
    }
  })
  return f
}

// Mutate arr0 by concatenating with arr1
// ([].concat creates a new array)
function pushArray (arr0, arr1) {
  Array.prototype.push.apply(arr0, arr1)
}

function simplify (fc, cb) {
  mapshaper.applyCommands(mapshaperCommands, fc, (err, data) => {
    if (err) return cb(err)
    cb(null, JSON.parse(data))
  })
}

function bufferReduce (acc, f) {
  const bufferedFeatures = [f]
  let buffered
  let d
  for (let i = 5; i <= 100; i += 5) {
    d = easePoly(i / 100) * 10
    buffered = buffer(f, d, 'kilometers')
    // buffered.properties = f.properties
    // buffered.properties.buffer = d
    bufferedFeatures.push(buffered)
  }
  pushArray(acc, bufferedFeatures)
  return acc
}
