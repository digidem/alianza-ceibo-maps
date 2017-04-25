#!/usr/bin/env node

const fs = require('fs')

const geojson = require('../../data.json').Comunidades

geojson.features = geojson.features.map(f => ({
  type: f.type,
  geometry: f.geometry,
  properties: {
    name: f.properties.Comunidad
  }
}))

fs.writeFileSync('comunidades.geojson', JSON.stringify(geojson, null, 2))
