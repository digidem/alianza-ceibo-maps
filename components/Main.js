import React from 'react'
import classNames from 'classnames'

import injectSheet from 'react-jss'
import { Redirect } from 'react-router-dom'
import { TransitionGroup, Transition } from 'react-transition-group'
import { injectIntl, intlShape } from 'react-intl'
import Media from 'react-media'

import Sidebar from './Sidebar'
import Mobilebar from './Mobilebar'
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
  mobilebar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 9999
  },
  sidebarDesktop: {
    maxWidth: 400,
    minWidth: 350
  },
  sidebar: {
    flex: 1,
    position: 'relative'
  },
  'sidebarMobile': {
    minWidth: '100%',
    'margin-bottom': 50
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
    flexDirection: 'column',
    width: '100%',
    height: '100%'
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
    page: 'listView'
  }

  componentDidMount () {
    var show = this.props.show
    fetchData(show, (err, data) => {
      if (err) return console.error(err)
      this.setState({
        data: data
      })
    })
  }

  getNationList () {
    const data = this.state.data
    if (!data) return []
    return Object.keys(data.nations)
      .map(key => ({
        name: data.nations[key].properties._nationName,
        color: data.nations[key].properties._color
      }))
  }

  getSidebarData () {
    const {nation, area, community, intl, show} = this.props
    const {data} = this.state

    if (!data) return {}

    if (nation && area && community) {
      return getSidebarData.community(data, intl, nation, community)
    } else if (nation && area) {
      return getSidebarData.area(data, intl, area)
    } else if (nation) {
      return getSidebarData.nation(data, intl, nation)
    } else {
      return getSidebarData.home(data, intl, show)
    }
  }

  handleHover = (id) => {
    this.setState({hover: id})
  }

  handleMapPageClick = () => {
    this.setState({page: 'mapView'})
  }

  handleListPageClick = () => {
    this.setState({page: 'listView'})
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
    const {page} = this.state
    const sidebarProps = this.getSidebarData()
    const sideBarClassName = state => classNames(
      classes.sidebarAnimationBase,
      classes['sidebar-' + state]
    )
    if (!sidebarProps) return <Redirect to='/' />

    return <div className={classes.root}>
      <Media query='(max-width: 599px)'>
        {smallScreen =>
          <TransitionGroup className={classNames(classes.sidebar,
            smallScreen ? classes.sidebarMobile : classes.sidebarDesktop,
            {[classes.closed]: smallScreen && page === 'mapView'})}>
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
        }
      </Media>
      <div className={classes.main}>
        <Media query='(min-width: 600px)'
          render={() => <Topbar
            className={classes.topbar}
            nation={nation}
            show={show}
            area={area}
            community={community}
            nationList={this.getNationList()} />} />
        <MapView
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
      <Media query='(max-width: 599px)'
        render={() => <Mobilebar
          className={classes.mobilebar}
          page={this.state.page}
          handleListPageClick={this.handleListPageClick}
          handleMapPageClick={this.handleMapPageClick}
          nationList={this.getNationList()} />} />
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
