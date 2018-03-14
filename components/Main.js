import React from 'react'
import classNames from 'classnames'

import injectSheet from 'react-jss'
import { Redirect } from 'react-router-dom'
import { TransitionGroup, Transition } from 'react-transition-group'
import { injectIntl, intlShape } from 'react-intl'

import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MapView from './Map'
import getSidebarData from '../lib/sidebar_data'
import { fetch as fetchData } from '../lib/data'

const styles = {
  root: {
    display: 'flex',
    position: 'relative',
    width: '100vw',
    height: '100vh'
  },
  sidebar: {
    flex: 1,
    maxWidth: 400,
    minWidth: 350,
    position: 'relative'
  },
  'sidebarAnimationBase': {
    position: 'absolute',
    transition: 'opacity 200ms ease-in-out',
    width: '100%',
    top: 0,
    bottom: 0
  },
  'sidebar-entering': {
    opacity: 0,
    transition: 'none'
  },
  'sidebar-exiting': {
    opacity: 0
  },
  'sidebar-entered': {
    opacity: 1
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  closed: {
    maxWidth: 0,
    minWidth: 0,
    display: 'none'
  },
  topbar: {
    flex: '2 0 auto',
    zIndex: 9999
  }
}

class Main extends React.Component {
  state = {
    mapView: true
  }

  componentDidMount () {
    fetchData((err, data) => {
      if (err) return console.error(err)
      this.setState({
        data: data
      })
    })
  }

  smallScreen () {
    return window.innerWidth < 600
  }

  getNationList () {
    const data = this.state.data
    if (!data) return []
    return Object.keys(data.nations)
      .map(key => ({
        name: data.nations[key].properties._nationName,
        color: data.nations[key].properties._color
      }))
      .filter(nation => nation.name !== 'Kichwa')
  }

  getSidebarData () {
    const {nation, area, community, intl} = this.props
    const {data} = this.state

    if (!data) return {}

    if (nation && area && community) {
      return getSidebarData.community(data, intl, nation, community)
    } else if (nation && area) {
      return getSidebarData.area(data, intl, area)
    } else if (nation) {
      return getSidebarData.nation(data, intl, nation)
    } else {
      return getSidebarData.home(data, intl)
    }
  }

  handleHover = (id) => {
    this.setState({hover: id})
  }

  handleMapClick = (id) => {
    const {history} = this.props
    const {data} = this.state
    if (!data) return
  const fProps = data.byId[id] && data.byId[id].properties
    if (!fProps) return
    history.push(getPath(fProps._nationName, fProps._areaName, fProps._communityName))
  }

  render () {
    const {classes, nation, area, community, location, show} = this.props
    const {mapView} = this.state
    const sidebarProps = this.getSidebarData()
    const smallScreen = this.smallScreen()
    const sideBarClassName = state => classNames(
      classes.sidebarAnimationBase,
      classes['sidebar-' + state]
    )
    const transitionSidebar = classNames(classes.sidebar, {[classes.closed]: smallScreen && mapView})

    if (!sidebarProps) return <Redirect to='/' />

    return <div className={classes.root}>
      <TransitionGroup className={transitionSidebar}>
        <Transition
          timeout={200}
          key={location.key}>
          {state => {
            return <Sidebar
              show={show}
              className={sideBarClassName(state)}
              {...sidebarProps}
              onHover={this.handleHover} />
          }}
        </Transition>
      </TransitionGroup>
      <div className={classes.main}>
        <Topbar
          smallScreen={smallScreen}
          className={classes.topbar}
          show={show}
          nation={nation}
          area={area}
          community={community}
          nationList={this.getNationList()} />
        <MapView
          className={classNames({[classes.closed]: smallScreen && !mapView})}
          data={this.state.data}
          nation={nation}
          show={show}
          area={area}
          community={community}
          location={location}
          hover={this.state.hover}
          onClick={this.handleMapClick}
          onHover={this.handleHover} />
      </div>
    </div>
  }
}

Main.propTypes = {
  intl: intlShape.isRequired
}

module.exports = injectIntl(injectSheet(styles)(Main))

function getPath (nation, area, community) {
  let path = '/' + nation
  if (area) path += '/' + enc(area)
  if (!area && community) path += '/_'
  if (community) path += '/' + enc(community)
  return path
}

// Some names include a `/`, which needs to be encoded for route paths to work
function enc (str) {
  return str && window.encodeURIComponent(str)
}
