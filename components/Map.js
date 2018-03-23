import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import injectSheet from 'react-jss'
import mapboxgl from 'mapbox-gl'
import extent from '@mapbox/geojson-extent'
import whichPolygon from 'which-polygon'

import layerStyles from '../lib/layer_styles'
import getPopupData from '../lib/popup_data'
import Popup from './Popup'

/* Mapbox [API access token](https://www.mapbox.com/help/create-api-access-token/) */
mapboxgl.accessToken = 'pk.eyJ1IjoiZ21hY2xlbm5hbiIsImEiOiJSaWVtd2lRIn0.ASYMZE2HhwkAw4Vt7SavEg'

const MAP_STYLE = 'mapbox://styles/gmaclennan/cjb1e10ya5lwl2sr0hqbzo2l8?optimize=true'
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
  // The first time our component mounts, render a new map into `mapContainer`
  // with settings from props.
  componentDidMount () {
    const map = window.map = this.map = new mapboxgl.Map({
      style: MAP_STYLE,
      pitchWithRotate: false,
      dragRotate: false,
      container: this.mapContainer
    })

    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 7
    })
    this.popupNode = window.document.createElement('div')
    this.popup.setDOMContent(this.popupNode)

    // Starting view shows Ecuador and neighbouring countries
    map.fitBounds(INITIAL_BOUNDS, {duration: 0})

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'top-left')

    map.on('click', 'alianza-areas-fill', this.handleClick)
    map.on('click', 'alianza-communities-dots', this.handleClick)
    map.on('click', 'alianza-communities-houses', this.handleClick)

    const {data, nation, area, community} = this.props
    if (data) {
      console.log('layer setup during mount')
      this.setupLayersAndData(data, nation, area, community)
    }
  }

  componentWillReceiveProps ({data, nation, area, community, show, hover, location}) {
    const map = this.map
    if (!map || !data) return

    // If the data has loaded, add it to the map
    // **NB**: Strange things will happen if the data prop changes, it will
    // try to re-add the same layers to the map and probably break.
    if (data && data !== this.props.data) {
      this.setupLayersAndData(data, nation, area, community)
    }

    // Navigation event (user had clicked a link to navigate the app)
    if (location !== this.props.location) {
      this.zoomToData(data, nation, area, community)
    }

    const hoverNation = hover && data.byId[hover].properties._type === 'nation'
    const hoverArea = hover && data.byId[hover].properties._type === 'area'

    // Change the cursor to a pointer if a feature is hovered
    // Add a popup to hovered features, but not if the hovered feature
    // is the active area
    if (hover !== this.props.hover || area !== this.props.area) {
      map.getCanvas().style.cursor = typeof hover === 'undefined' ? '' : 'pointer'
      if (typeof hover === 'undefined' || hoverNation ||
        (hoverArea && hover && data.byId[hover].properties._areaName === area)) {
        this.popup.remove()
      } else {
        this.popup.addTo(map)
      }
    }

    // We want to highlight:
    // 1. The currently selected feature (the feature that is shown in the sidebar)
    // 2. The feature that is currently hovered by the mouse
    // 3. If the hovered feature is a community, we should also highlight the area
    //    that the community is in.
    const highlightIds = this.getHighlightIds(data, nation, area, community, hover)
    highlightIds.forEach(id => {
      const areaFeature = data.byId[id]
      if (!areaFeature || areaFeature.properties._type !== 'area') return
      if (data.areas[areaFeature.properties._areaName + '@@extension']) {
        highlightIds.push(data.areas[areaFeature.properties._areaName + '@@extension'].id)
      }
      if (data.areas[areaFeature.properties._areaName.replace(/@@extension$/, '')]) {
        highlightIds.push(data.areas[areaFeature.properties._areaName.replace(/@@extension$/, '')].id)
      }
    })
    const communityFilter = ['in', '_id'].concat(highlightIds)

    // If a nation is selected (or hovered in the sidebar) then we highlight all
    // areas from the same nation
    const nationHighlight = (!area && !community && nation) ||
      (hoverNation && data.byId[hover].properties._nationName)

    const areaFilter = nationHighlight
      ? ['any', ['==', '_nationName', nationHighlight], communityFilter]
      : communityFilter

    this.ready(() => {
      map.setFilter('alianza-communities-highlight', communityFilter)
      map.setFilter('alianza-areas-highlight', areaFilter)
    })

    ReactDOM.render(<Popup show={show} {...getPopupData(data, hover)} />, this.popupNode)
  }

  // We don't use React to update this component. All update logic and diffing
  // is in componentWillReceiveProps()
  shouldComponentUpdate () {
    return false
  }

  componentWillUnmount () {
    this.map.off('mousemove', this.handleMouseMove)
    this.map.off('click', this.handleClick)
    this.map.remove()
  }

  handleClick = (e) => {
    const id = e.features[0].properties._id
    this.props.onClick(id)
  }

  handleMouseMove = (e) => {
    this.popup.setLngLat(e.lngLat)
    // Check if the mouse is over a community
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

    // Check if the mouse is inside an area
    const area = this.polygonIndex([e.lngLat.lng, e.lngLat.lat])
    if (area) {
      if (area._id === this.props.hover) return
      return this.props.onHover(area._id)
    }

    // If the mouse is not over a community or area, clear the hover
    if (this.props.hover) {
      return this.props.onHover()
    }
  }

  setupLayersAndData (data, nation, area, community) {
    console.log('setup layers and data')
    const map = this.map
    const areaGeoJSON = this.getAreaGeoJSON(data)
    const communityGeoJSON = this.getCommunityGeoJSON(data)
    // We build an index for interaction testing, because map.queryRenderedFeatures()
    // is too slow for these large polygons
    this.polygonIndex = whichPolygon(areaGeoJSON)
    this.ready(() => {
      console.log('map is ready now')
      // Wait until the map is ready and add all the custom layers
      map.addSource('areas', {type: 'geojson', data: areaGeoJSON})
      map.addSource('communities', {type: 'geojson', data: communityGeoJSON})
      map.addSource('bing', bingSource)
      map.addLayer(layerStyles.bingSatellite, 'aerialway')
      map.addLayer(layerStyles.areasFill)
      map.addLayer(layerStyles.areasLabel)
      map.addLayer(layerStyles.areasUnlegalized)
      map.addLayer(layerStyles.areasLine)
      map.addLayer(layerStyles.areasHighlight)
      map.addLayer(layerStyles.communitiesHighlight)
      map.addLayer(layerStyles.communitiesHouses)
      map.addLayer(layerStyles.communitiesDots)
      map.on('mousemove', this.handleMouseMove)
      this.loaded = true
      // Wait for 2 seconds then zoom into the data
      this.zoomTimerId = setTimeout(
        () => this.zoomToData(data, nation, area, community),
        2000
      )
    })
  }

  zoomToData (data, nation, area, community) {
    const map = this.map
    console.log('zoom to data')

    // Navigation to `/` - zoom to all data
    if (!nation && !area && !community) {
      return map.fitBounds(data.bbox, {padding: 20, duration: 3000})
    }

    // If the current nation does not exist, return
    // (this is probably unnecessary, we should 404 before this)
    const nationFeature = data.nations[nation]
    if (!nationFeature) return

    // If current navigation is a community, zoom to that community
    // at zoom 14
    if (nation && community) {
      const communityFeature = nationFeature.communities[community]
      if (!communityFeature || !communityFeature.geometry) return
      return map.flyTo({
        center: communityFeature.geometry.coordinates,
        zoom: 14
      })
    }

    // If navigation is an area, zoom to that area
    if (nation && area) {
      const areaFeature = data.areas[area]
      if (!areaFeature || !areaFeature.bbox) return
      return map.fitBounds(areaFeature.bbox, {padding: 20})
    }

    // If current navigation is a nation, zoom to all areas for that nation
    if (nation) {
      if (!nationFeature || !nationFeature.bbox) return
      return map.fitBounds(nationFeature.bbox, {padding: 20})
    }
  }

  // Transform the data for areas into a GeoJSON FeatureCollection
  // Add a prop for the zoom value when the area bounds fit to the map bounds
  getAreaGeoJSON (data) {
    const areaFeatures = Object.keys(data.areas)
      .map(key => data.areas[key])

    areaFeatures.forEach(feature => (feature.properties._zoom = this.getZoom(feature)))

    return {
      type: 'FeatureCollection',
      features: areaFeatures
    }
  }

  // Transform the data for communities into a GeoJSON FeatureCollection
  // Add a prop for the zoom value when the communty's area fits the map bounds
  getCommunityGeoJSON (data) {
    const show = this.props.show
    const communityFeatures = Object.keys(data.byId)
      .map(key => data.byId[key])
      .filter(f => f.properties._type === 'community')

    communityFeatures.forEach(f => {
      if (show && f.properties._icon === 'comunidad-agua-solar') {
        f.properties._icon = `comunidad-${show}`
      }
      const area = data.areas[f.properties._areaName]
      if (!area) f.properties._zoom = 10
      else f.properties._zoom = area.properties._zoom
    })

    return {
      type: 'FeatureCollection',
      features: communityFeatures
    }
  }

  // Get the zoom value when the feature will fit to the map bounds
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
      console.log('waiting for style data to load before calling ready(fn)')
      this.map.once('data', () => this.ready(fn))
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
