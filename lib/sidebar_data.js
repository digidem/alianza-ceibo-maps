import { defineMessages } from 'react-intl'

const messages = defineMessages({
  // Sidebar initial title
  homeTitle: 'Where We Work',
  // Sidebar initial list header
  homeListTitle: 'Who We Work With',
  // Sidebar initial text
  homeText: `Amazon Frontlines and the Ceibo Alliance work on concrete
initiatives with over 60 communities from the Siona, Secoya, Kofan and Waorani
indigenous nations in Ecuador, Peru and Colombia. Explore the *Where We Work*
map to learn more about the past and present of these indigenous communities.
Make sure to check out *Communities with Stories* to watch films or read
first-hand accounts of our work with these communities, from clean water and
solar energy, to territorial defense and cultural revival.`
})

module.exports = {
  home: getHomeData,
  nation: getNationData,
  area: getAreaData,
  community: getCommunityData
}

function getHomeData (data, intl) {
  const {nations, stats} = data

  const list = Object.keys(nations).map(key => ({
    id: nations[key].id,
    name: nations[key].properties._nationName,
    solar: nations[key].stats.solar,
    water: nations[key].stats.water,
    color: nations[key].properties._color,
    image: nations[key].properties.Foto &&
      nations[key].properties.Foto[0].thumbnails.large.url
  })).filter(nation => nation.name !== 'Kichwa')

  return {
    title: intl.formatMessage(messages.homeTitle),
    image: '/sidebar.jpg',
    text: intl.formatMessage(messages.homeText),
    solar: stats.solar,
    water: stats.water,
    listTitle: intl.formatMessage(messages.homeListTitle),
    list: list
  }
}

function getNationData (data, intl, nationName) {
  const nation = data.nations[nationName]
  if (!nation) return

  const {communities, stats} = nation

  const list = Object.keys(communities).map(key => ({
    id: communities[key].id,
    name: communities[key].properties._communityName,
    baseUrl: '/' + enc(communities[key].properties._nationName) + '/' +
      (enc(communities[key].properties._areaName) || '_'),
    featured: communities[key].properties.Historias &&
      !!communities[key].properties.Historias.length,
    solar: communities[key].stats.solar,
    water: communities[key].stats.water,
    color: communities[key].properties._color,
    image: communities[key].properties.Foto &&
      communities[key].properties.Foto[0].thumbnails.large.url
  }))

  const textKey = intl.locale === 'en' ? 'Resumen' : 'Resumen Español'

  return {
    title: nation.properties._nationName,
    image: nation.properties.Foto &&
      nation.properties.Foto[0].thumbnails.large.url,
    text: nation.properties[textKey],
    solar: stats.solar,
    water: stats.water,
    listTitle: nationName + ' Communities',
    list: list
  }
}

function getAreaData (data, intl, areaName) {
  const area = data.areas[areaName]
  if (!area) return

  const {communities, stats} = area

  const list = Object.keys(communities).map(key => ({
    id: communities[key].id,
    name: communities[key].properties._communityName,
    baseUrl: '/' + enc(communities[key].properties._nationName) + '/' +
      (enc(communities[key].properties._areaName) || '_'),
    featured: communities[key].properties.Historias &&
      !!communities[key].properties.Historias.length,
    solar: communities[key].stats.solar,
    water: communities[key].stats.water,
    color: communities[key].properties._color,
    image: communities[key].properties.Foto &&
      communities[key].properties.Foto[0].thumbnails.large.url
  }))

  // For areas we include the nation name in the title, unless if
  // the area name already includes the nation name
  let title = area.properties._areaName
  const nationName = area.properties._nationName
  if (title.indexOf(nationName) !== 0) title = nationName + ': ' + title

  const nationTextKey = intl.locale === 'en' ? 'Resumen' : 'Resumen Español'

  // Include the text from the nation too for areas
  let text = area.properties.Resumen
  const nationText = data.nations[nationName] && data.nations[nationName].properties[nationTextKey]
  if (nationText) text = nationText + (text ? '\n\n' + text : '')

  // If there is no image for the area, use the image from the nation
  const image = (area.properties.Foto && area.properties.Foto[0].thumbnails.large.url) ||
    (data.nations[nationName] && data.nations[nationName].properties.Foto &&
    data.nations[nationName].properties.Foto[0].thumbnails.large.url)

  return {
    title: title,
    image: image,
    text: text,
    solar: stats.solar,
    water: stats.water,
    listTitle: 'Communities in ' + areaName,
    list: list
  }
}

function getCommunityData (data, intl, nationName, communityName) {
  const nation = data.nations[nationName]
  if (!nation) return
  const community = nation.communities[communityName]
  if (!community) return

  const stories = (community.properties.Historias || [])
    .map(storyId => data.byId[storyId])
    // filter out undefined values
    .filter(Boolean)

  const list = Object.keys(stories).map(key => ({
    name: stories[key].properties.Titulo,
    url: stories[key].properties.Vinculo,
    image: stories[key].properties.Foto &&
      stories[key].properties.Foto[0].thumbnails.large.url
  }))

  const textKey = intl.locale === 'en' ? 'Description English' : 'Descripción'

  return {
    title: community.properties._communityName,
    image: community.properties.Foto &&
      community.properties.Foto[0].thumbnails.large.url,
    text: community.properties[textKey],
    solar: community.stats.solar,
    water: community.stats.water,
    listTitle: 'Stories',
    list: list,
    stories: true
  }
}

// Some names include a `/`, which needs to be encoded for route paths to work
function enc (str) {
  return str && window.encodeURIComponent(str)
}
