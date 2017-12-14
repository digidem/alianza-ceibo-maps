const fs = require('fs')

const data = require('../static/data.json')
const {transform} = require('../lib/data')
const extent = require('@mapbox/geojson-extent')

fs.writeFileSync('test.json', JSON.stringify(transform(data), null, 2))

// const areas = require('../static/areas.json')

// const areasWithBounds = extent.bboxify(areas)

// fs.writeFileSync('test2.json', JSON.stringify(areasWithBounds, null, 2))
