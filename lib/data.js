const xhr = require('xhr')
const assign = require('object-assign')
const whichPolygon = require('which-polygon')
const extent = require('@mapbox/geojson-extent')

const areaGeometries = addIds(require('../static/areas.json'))

// Create a geo index for matching communities to areas
const areaPointIndex = whichPolygon(areaGeometries)

const NATIONS_KEY = 'Nacionalidades'
const NATION_NAME_PROP = 'Nacionalidad'
const COLOR_PROP = 'Color'
const AREAS_KEY = 'Areas'
const AREA_NAME_PROP = 'Area nombre'
const COMMUNITIES_KEY = 'Comunidades'
const COMMUNITY_LIST_PROP = 'Comunidades'
const COMMUNITY_NAME_PROP = 'Comunidad'
const SOLAR_COUNT_PROP = 'Solar'
const WATER_COUNT_PROP = 'Agua'
const PROGRAM_PROP = 'Programas'
const WATER_PROGRAM = 'Sistemas de agua'
const SOLAR_PROGRAM = 'Sistemas solares'

// transform & dataStructure exports are only for testing
// TODO: test airtable data structure - avoid problems if
// somebody changes a column or table name
module.exports = {
  fetch: fetchData,
  transform: transformData,
  dataStructure: {
    NATIONS_KEY,
    NATION_NAME_PROP,
    COLOR_PROP,
    AREAS_KEY,
    AREA_NAME_PROP,
    COMMUNITIES_KEY,
    COMMUNITY_LIST_PROP,
    COMMUNITY_NAME_PROP,
    SOLAR_COUNT_PROP,
    WATER_COUNT_PROP
  }
}

function fetchData (cb) {
  xhr.get('/data.json', { headers: {
    'Content-Type': 'application/json'
  }}, function (err, resp, body) {
    if (err) return cb(err)

    const featureCollections = JSON.parse(body)

    cb(null, transformData(featureCollections))
  })
}

function transformData (featureCollections) {
  // This will be our data structure
  const data = {
    byId: {},
    nations: {},
    areas: {},
    stats: {
      solar: 0,
      water: 0,
      communities: 0
    }
  }

  // The data from airtable is a map of GeoJSON FeatureCollections
  Object.keys(featureCollections).forEach(function (key) {
    // Add ids as a feature property, because mapbox-gl does not return
    // feature ids when you click on the map, it only returns properties
    const fc = addIds(featureCollections[key])

    // Index the features in our data structure
    // add a _type property
    fc.features.forEach(function (feature) {
      const fProps = feature.properties
      // Index nations by nation name
      if (key === NATIONS_KEY) {
        fProps._type = 'nation'
        data.nations[fProps[NATION_NAME_PROP].trim()] = feature
        fProps._nationName = fProps[NATION_NAME_PROP].trim()
        fProps._color = fProps[COLOR_PROP]
      }
      if (key === COMMUNITIES_KEY) {
        // Filter any communities that have no location
        if (!feature.geometry) return
        fProps._type = 'community'
        fProps._communityName = fProps[COMMUNITY_NAME_PROP].trim()
        addIconFieldAndFilter(feature)
      }
      // We don't index areas, that data comes from areas.json
      if (key === AREAS_KEY) return

      // Create an index of all features by id
      data.byId[feature.id] = feature
    })
  })

  // Add nation names to the Airtable area data
  featureCollections[AREAS_KEY].features.forEach(function (feature) {
    const fProps = feature.properties
    const nationId = fProps[NATION_NAME_PROP] &&
      fProps[NATION_NAME_PROP][0]
    const nation = data.byId[nationId]
    fProps._nationName = nation.properties._nationName
    fProps._areaName = fProps[AREA_NAME_PROP].trim()
  })

  // For areas, the shp/GeoJSON in this repo is the source of truth.
  // We try and match areas in the Airtable data by both area name
  // and nationality. We match communities by geo-join or by data from
  // airtable, then accumulate stats
  areaGeometries.features.forEach(function (feature) {
    const fProps = feature.properties

    // add a bbox to the Feature object
    feature.bbox = extent(feature)

    // Add custom props
    fProps._type = 'area'
    fProps._zoom = 7
    fProps._color = data.nations[fProps._nationName] &&
      data.nations[fProps._nationName].properties[COLOR_PROP]

    // Clunky, but we need to structure the data in a way that we can merge
    // extensions for map interaction
    const areaKey = fProps._areaName + (fProps._extension === 1 ? '@@extension' : '')

    data.areas[areaKey] = feature
    data.byId[feature.id] = feature

    // join properties from the Airtable data
    joinAreas(feature, featureCollections[AREAS_KEY])
  })

  // When you click an area which has an extension, we want to zoom to
  // the area that includes both, so we expand the bbox
  areaGeometries.features.forEach(function (feature) {
    const extension = data.areas[feature.properties._areaName + '@@extension']
    if (!extension) return
    if (extension === feature) return

    const bboxOfAreaAndExtension = unionBboxes(feature.bbox, extension.bbox)
    feature.bbox = extension.bbox = bboxOfAreaAndExtension
  })

  // Nest communities under nations, and accumulate stats
  Object.keys(data.nations).forEach(function (nation) {
    // The data from Airtable lists the communities in a nation as a array of ids
    const communitiesIds = data.nations[nation].properties[COMMUNITY_LIST_PROP] || []

    const stats = data.nations[nation].stats = {
      solar: 0,
      water: 0,
      communities: communitiesIds.length
    }

    // Iterate through community ids and attach community Feature object to nation,
    // indexed by community name
    data.nations[nation].communities = communitiesIds.reduce(function (acc, id) {
      const community = data.byId[id]
      // Communities without a geometry (location) are not in this index,
      // we don't show them at all on the map
      if (!community) return acc
      community.properties._nationName = nation
      acc[community.properties[COMMUNITY_NAME_PROP].trim()] = community
      community.stats = {
        solar: community.properties[SOLAR_COUNT_PROP] || 0,
        water: community.properties[WATER_COUNT_PROP] || 0
      }
      stats.solar += community.stats.solar
      stats.water += community.stats.water
      return acc
    }, {})

    // Accumulate stats for entire dataset
    data.stats.solar += stats.solar
    data.stats.water += stats.water
    data.stats.communities += stats.communities
  })

  // Nest communities under areas, and accumulate stats
  // TODO: The data from Airtable does not associate communities with areas
  Object.keys(data.areas).forEach(function (areaName) {
    const areaFeature = data.areas[areaName]

    // The data from Airtable should list the communities in an area as a array of ids
    let communitiesIds = areaFeature.properties[COMMUNITY_LIST_PROP] || []

    // Currently the Airtable data does not actually list this, so we use
    // a geographic join to associate communities with an area
    if (!communitiesIds.length) {
      communitiesIds = featureCollections[COMMUNITIES_KEY].features
        .filter(function (f) {
          if (!f.geometry) return
          const match = areaPointIndex(f.geometry.coordinates)
          return match && match._areaName === areaName
        })
        .map(function (f) { return f.id })
    }

    const stats = areaFeature.stats = {
      solar: 0,
      water: 0,
      communities: communitiesIds.length
    }

    // Iterate through community ids and attach community Feature object to nation,
    // indexed by community name
    // TODO: Add stats for an area + its extension
    areaFeature.communities = communitiesIds.reduce(function (acc, id) {
      const community = data.byId[id]
      // Communities without a geometry (location) are not in this index,
      // we don't show them at all on the map
      if (!community) return acc
      community.properties._areaName = areaName
      acc[community.properties[COMMUNITY_NAME_PROP].trim()] = community
      stats.solar += (community.properties[SOLAR_COUNT_PROP] || 0)
      stats.water += (community.properties[WATER_COUNT_PROP] || 0)
      return acc
    }, {})

    const nationFeature = data.nations[areaFeature.properties._nationName]

    nationFeature.bbox = unionBboxes(nationFeature.bbox, areaFeature.bbox)
  })

  // Add bbox for all data
  Object.keys(data.nations).forEach(function (nation) {
    data.bbox = unionBboxes(data.nations[nation].bbox, data.bbox)
  })

  return data
}

function addIds (featureCollection) {
  var featuresWithIds = featureCollection.features.map(function (f, i) {
    return assign({}, f, {
      id: f.id || i + Date.now() + '',
      properties: assign({}, f.properties, {_id: f.id || i + Date.now() + ''})
    })
  })
  return fc(featuresWithIds)
}

// If any additional data for the area is in the Airtable data,
// add that to the area feature properties. Match is based on both
// the area name and nation name matching.
// **NOTE**: mutates the input feature
function joinAreas (feature, airtableAreas) {
  const fProps = feature.properties

  const matches = airtableAreas.features.filter(function (feature) {
    return feature.properties._nationName === fProps._nationName &&
      feature.properties._areaName === fProps._areaName
  })

  if (!matches[0]) return

  assign(feature.properties, matches[0].properties)
}

// For any two bboxes, return a bbox which includes both
function unionBboxes (bbox1, bbox2) {
  if (!bbox1) return bbox2
  if (!bbox2) return bbox1
  return [
    Math.min(bbox1[0], bbox2[0]),
    Math.min(bbox1[1], bbox2[1]),
    Math.max(bbox1[2], bbox2[2]),
    Math.max(bbox1[3], bbox2[3])
  ]
}

function fc (features) {
  return {
    type: 'FeatureCollection',
    features: features
  }
}

function addIconFieldAndFilter (f) {
  let icon
  const programas = f.properties[PROGRAM_PROP] || []
  const hasWater = includes(programas, WATER_PROGRAM)
  const hasSolar = includes(programas, SOLAR_PROGRAM)
  const hasStory = f.properties.Historias && f.properties.Historias.length

  if (hasStory) {
    icon = 'community-story'
  } else if (hasWater && hasSolar) {
    icon = 'comunidad-agua-solar'
  } else if (hasWater) {
    icon = 'comunidad-agua'
  } else if (hasSolar) {
    icon = 'comunidad-solar'
  } else {
    icon = 'comunidad'
  }
  f.properties._icon = icon
  return f
}

function includes (arr, value) {
  return arr.indexOf(value) > -1
}
