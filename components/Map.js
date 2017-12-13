const React = require('react')
const PropTypes = require('prop-types')
const injectSheet = require('react-jss').default
const mapboxgl = require('mapbox-gl')
const extent = require('@mapbox/geojson-extent')
const whichPolygon = require('which-polygon')

const layerStyles = require('../lib/layer_styles')

/* Mapbox [API access token](https://www.mapbox.com/help/create-api-access-token/) */
mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

const MAP_STYLE = 'mapbox://styles/gmaclennan/cjb1e10ya5lwl2sr0hqbzo2l8'
// const MAP_STYLE = 'http://localhost:8080/style.json'
const INITIAL_BOUNDS = [-82.573242, -5.287887, -74.750977, 1.834403]

const bingSource = {
  type: 'raster',
  tiles: [
    'https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869',
    'https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=5869'
  ],
  minzoom: 1,
  maxzoom: 21,
  tileSize: 256
}

const styles = {
  root: {
    width: '100%',
    height: '100%'
  }
}

class MapView extends React.Component {
  state = {}

  // The first time our component mounts, render a new map into `mapContainer`
  // with settings from props.
  componentDidMount () {
    const map = window.map = this.map = new mapboxgl.Map({
      style: MAP_STYLE,
      hash: false,
      container: this.mapContainer
    })

    map.fitBounds(INITIAL_BOUNDS, {duration: 0})

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl(), 'top-left')
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

    map.on('click', 'alianza-areas-fill', this.handleClick)
    map.on('click', 'alianza-communities-dots', this.handleClick)
    map.on('click', 'alianza-communities-houses', this.handleClick)
  }

  componentWillReceiveProps ({data, nation, area, community, hover, location}) {
    const map = this.map
    if (!map) return

    if (!data) return

    if (data && data !== this.props.data) {
      const areaGeoJSON = this.getAreaGeoJSON(data)
      const communityGeoJSON = this.getCommunityGeoJSON(data)
      this.polygonIndex = whichPolygon(areaGeoJSON)
      this.ready(() => {
        map.addSource('areas', {type: 'geojson', data: areaGeoJSON})
        map.addSource('communities', {type: 'geojson', data: communityGeoJSON})
        map.addSource('bing', bingSource)
        map.addLayer(layerStyles.bingSatellite, 'aerialway')
        map.addLayer(layerStyles.areasHighlight)
        map.addLayer(layerStyles.areasLine)
        map.addLayer(layerStyles.areasFill)
        map.addLayer(layerStyles.communitiesHighlight)
        map.addLayer(layerStyles.communitiesHouses)
        map.addLayer(layerStyles.communitiesDots)
        map.on('mousemove', this.handleMouseMove)
        this.loaded = true
        this.zoomTimerId = setTimeout(
          () => this.zoomToData(data, nation, area, community),
          2000
        )
      })
    }

    // Navigation event
    if (location !== this.props.location) {
      this.zoomToData(data, nation, area, community)
    }

    if (hover) {
      map.getCanvas().style.cursor = 'pointer'
    } else {
      map.getCanvas().style.cursor = ''
    }

    const highlightIds = this.getHighlightIds(data, nation, area, community, hover)
    const communityFilter = ['in', '_id'].concat(highlightIds)

    const nationHighlight = (!area && !community && nation) ||
      (hover && data.byId[hover].properties._type === 'nation' && data.byId[hover].properties._nationName)

    const areaFilter = nationHighlight
      ? ['any', ['==', '_nationName', nationHighlight], communityFilter]
      : communityFilter

    this.ready(() => {
      map.setFilter('alianza-communities-highlight', communityFilter)
      map.setFilter('alianza-areas-highlight', areaFilter)
    })
  }

  shouldComponentUpdate () {
    return false
  }

  componentWillUnmount () {
    // this.map.off('moveend', this.handleMapMoveOrZoom)
    this.map.off('click', this.handleClick)
    // this.map.off('mousemove', this.handleMouseMove)
    this.map.remove()
  }

  handleClick = (e) => {
    const id = e.features[0].properties._id
    this.props.onClick(id)
  }

  handleMouseEnter = (e) => {
    const id = e.features[0].properties._id
    this.props.onHover(id)
  }

  handleMouseMove = (e) => {
    const communities = this.map.queryRenderedFeatures(e.point, {
      layers: [
        'alianza-communities-houses',
        'alianza-communities-dots',
        'alianza-communities-highlight']
    })
    if (communities.length) {
      if (communities[0].properties._id === this.props.hover) return
      return this.props.onHover(communities[0].properties._id)
    }
    const area = this.polygonIndex([e.lngLat.lng, e.lngLat.lat])
    if (area) {
      if (area._id === this.props.hover) return
      return this.props.onHover(area._id)
    }
    if (this.props.hover) {
      return this.props.onHover()
    }
  }

  handleMouseLeave = (e) => {
    this.props.onHover()
  }

  zoomToData (data, nation, area, community) {
    const map = this.map

    if (!nation && !area && !community) {
      return map.fitBounds(data.bbox, {padding: 20, duration: 3000})
    }

    const nationFeature = data.nations[nation]
    if (!nationFeature) return

    if (nation && community) {
      const communityFeature = nationFeature.communities[community]
      if (!communityFeature) return
      return map.flyTo({
        center: communityFeature.geometry.coordinates,
        zoom: 14
      })
    }

    if (nation && area) {
      const areaFeature = data.areas[area]
      if (!areaFeature) return
      return map.fitBounds(areaFeature.bbox, {padding: 20})
    }

    if (nation) {
      return map.fitBounds(nationFeature.bbox, {padding: 20})
    }
  }

  getAreaGeoJSON (data) {
    const areaFeatures = Object.keys(data.areas)
      .map(key => data.areas[key])

    areaFeatures.forEach(feature => (feature.properties._zoom = this.getZoom(feature)))

    return {
      type: 'FeatureCollection',
      features: areaFeatures
    }
  }

  getCommunityGeoJSON (data) {
    const communityFeatures = Object.keys(data.byId)
      .map(key => data.byId[key])
      .filter(f => f.properties._type === 'community')

    communityFeatures.forEach(f => {
      const area = data.areas[f.properties._areaName]
      if (!area) f.properties._zoom = 10
      else f.properties._zoom = area.properties._zoom
    })

    return {
      type: 'FeatureCollection',
      features: communityFeatures
    }
  }

  getZoom (feature) {
    var padding = 20
    var maxZoom = 18

    var bounds = mapboxgl.LngLatBounds.convert(extent(feature))

    var tr = this.map.transform
    var nw = tr.project(bounds.getNorthWest())
    var se = tr.project(bounds.getSouthEast())
    var size = se.sub(nw)
    var scaleX = (tr.width - padding * 2) / size.x
    var scaleY = (tr.height - padding * 2) / size.y

    return Math.min(tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)), maxZoom)
  }

  // Returns an array of ids of features which should be highlighted on the map,
  // based on what is currently being hovered and which is selected
  getHighlightIds (data, nation, area, community, hover) {
    const highlight = []

    const nationFeature = data.nations[nation]

    const communityFeature = nationFeature && nationFeature.communities[community]
    if (communityFeature) {
      highlight.push(communityFeature.id)
      const areaName = communityFeature.properties._areaName
      if (areaName && data.areas[areaName]) {
        highlight.push(data.areas[areaName].id)
      }
    }

    const areaFeature = data.areas[area]
    if (areaFeature) {
      highlight.push(areaFeature.id)
    }

    if (typeof hover !== 'undefined') {
      highlight.push(hover)
      const areaName = data.byId[hover].properties._areaName
      if (areaName && data.areas[areaName] && data.byId[hover].properties._type === 'community') {
        highlight.push(data.areas[areaName].id)
      }
    } else {
      highlight.push('')
    }

    return highlight
  }

  ready (fn) {
    if (this.map.isStyleLoaded() || this.loaded) {
      fn()
    } else {
      this.map.once('styledata', () => fn.call(this))
    }
  }

  render () {
    const {classes} = this.props
    return (
      <div className={classes.root} ref={(el) => (this.mapContainer = el)} />
    )
  }
}

module.exports = injectSheet(styles)(MapView)
