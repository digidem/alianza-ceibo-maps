const xhr = require('xhr')

const areaGeometries = require('../static/areas.json')

module.exports = fetchData

function fetchData (cb) {
  xhr.get('data.json', { headers: {
    'Content-Type': 'application/json'
  }}, function (err, resp, body) {
    if (err) return cb(err)

    const featureCollections = JSON.parse(body)

    const data = {
      featuresById: {},
      nations: {},
      areas: {},
      communities: {}
    }

    Object.keys(featureCollections).forEach(function (key) {
      featureCollections[key].features.forEach(function (feature) {
        data.featuresById[feature.id] = feature
        if (key === 'Areas') data.areas[feature.properties['Area nombre']] = feature
        else if (key === 'Nacionalidades') data.nations[feature.properties.Nacionalidad] = feature
      })
    })

    cb(null, data)
  })
}
