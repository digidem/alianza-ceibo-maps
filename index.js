/* global mapboxgl, d3, geojsonExtent */

mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

var data
var dataIndex = {}
var pending = 2
var inView = []

var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
  center: [-78.415, -1.639], // starting position
  zoom: 5.5, // starting zoom
  hash: true,
  dragRotate: false,
  keyboard: false
}).on('load', done)

d3.json('data.json', function (err, _data) {
  if (err) return console.error(err)
  data = _data
  Object.keys(data).forEach(function (key) {
    data[key].features.forEach(function (feature) {
      dataIndex[feature.id] = feature
    })
  })
  done()
})

function done () {
  if (--pending > 0) return

  var landTitleAreas = addIds(filterGeom(data['Land Title Area']))
  var settlements = addIds(unfurlSettlements(filterGeom(data['Settlements']), dataIndex))
  map.addLayer({
    id: 'land-title-areas',
    type: 'fill',
    source: {
      type: 'geojson',
      data: landTitleAreas
    },
    layout: {},
    paint: {
      'fill-color': '#088',
      'fill-opacity': 0.8
    }
  })
  map.addLayer({
    id: 'settlements',
    type: 'circle',
    source: {
      type: 'geojson',
      data: settlements
    },
    layout: {},
    paint: {},
    filter: ['in', 'Land Title Area']
  })

  map.fitBounds(geojsonExtent(landTitleAreas), {padding: 20})

  map.on('move', function () {
    var bounds = getBounds(map, {padding: '20%'})
    var toShow = landTitleAreas.features
      .filter(overlapsBounds(bounds))
      .map(function (f) {
        return f.properties['Land Title Area']
      })
    if (arrayEqual(inView, toShow)) return
    map.setFilter('settlements', ['in', 'Land Title Area'].concat(inView = toShow))
  })

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: true
  })

  map.on('mousemove', function (e) {
    var areas = map.queryRenderedFeatures(e.point, { layers: ['land-title-areas'] })
    var settlements = map.queryRenderedFeatures(e.point, { layers: ['settlements'] })

    if (!settlements.length && (!areas.length || inView.indexOf(areas[0].properties['Land Title Area']) > -1)) {
      map.getCanvas().style.cursor = ''
      popup.remove()
      return
    }
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer'

    if (settlements.length) {
      var feature = dataIndex[settlements[0].properties._id]
      popup.setLngLat(feature.geometry.coordinates)
        .setHTML(renderSettlementPopup(feature.properties))
        .addTo(map)
      return
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(map.unproject(e.point))
        .setHTML(renderAreaPopup(dataIndex[areas[0].properties._id].properties))
        .addTo(map)
  })

  map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['land-title-areas'] })

    if (!features.length || inView.indexOf(features[0].properties['Land Title Area']) > -1) {
      return
    }

    var feature = dataIndex[features[0].properties._id]

    map.fitBounds(geojsonExtent(feature), {padding: 20})
  })
}

// Only return features with geometry
function filterGeom (fc) {
  return {
    type: 'FeatureCollection',
    features: fc.features.filter(function (f) { return f.geometry })
  }
}

// Return features which overlap a bounding box i.e.
// the bounding box is inside the feature
function overlapsBounds (bounds) {
  return function (feature) {
    var bbox = geojsonExtent(feature)
    return (
      bbox[0] < bounds.getWest() &&
      bbox[2] > bounds.getEast()
    ) || (
      bbox[1] < bounds.getSouth() &&
      bbox[3] > bounds.getNorth()
    )
  }
}

// Like map.getBounds() but accepts padding
function getBounds (map, options) {
  var padX
  var padY
  var padding = padX = padY = (options && options.padding) || 0
  if (typeof padding === 'string') {
    if (/%$/.test(padding)) {
      padX = map.transform.width * parseInt(padding) / 100
      padY = map.transform.height * parseInt(padding) / 100
    }
  }
  return new mapboxgl.LngLatBounds(
    map.unproject(new mapboxgl.Point(padX, map.transform.height - padY)),
    map.unproject(new mapboxgl.Point(map.transform.width - padX, padY)))
}

function unfurlSettlements (settlements, index) {
  return {
    type: 'FeatureCollection',
    features: settlements.features.map(function (f) {
      var props = f.properties
      var newProps = Object.assign({}, props)
      newProps['Land Title Area'] = index[props['Land Title Area'][0]].properties['Land Title Area']
      newProps['Nationality'] = index[props['Nationality'][0]].properties['Nationality']
      return Object.assign({}, f, {
        properties: newProps
      })
    })
  }
}

function arrayEqual (arr1, arr2) {
  if (arr1 === arr2) return true
  if (arr1.length !== arr2.length) return false
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false
  }
  return true
}

function addIds (fc) {
  return {
    type: 'FeatureCollection',
    features: fc.features.map(function (f) {
      return Object.assign({}, f, {
        properties: Object.assign({}, f.properties, {_id: f.id})
      })
    })
  }
}

function renderAreaPopup (props) {
  var nationality = dataIndex[props.Nationality[0]].properties.Nationality
  return '<h1>' + nationality + '</h1>' +
  '<img style="width: 200px; height: 200px" src="' + props.Photo[0].thumbnails.large.url + '">'
}

function renderSettlementPopup (props) {
  return '<h1>' + props.Settlement + '</h1>' +
    '<p><b>Installations: </b>' + props['Installation Count'] + '</p>'
}
