const React = require('react')
const injectSheet = require('react-jss').default
const {Redirect} = require('react-router-dom')
const {TransitionGroup, Transition} = require('react-transition-group')

const Sidebar = require('./Sidebar')
const Topbar = require('./Topbar')
const MapView = require('./Map')
const getSidebarData = require('../lib/get_sidebar_data')
const {fetch: fetchData} = require('../lib/data')

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
    flex: 2,
    display: 'flex',
    flexDirection: 'column'
  },
  topbar: {
    flex: '1 0 auto',
    zIndex: 9999
  },
  map: {
  }
}

class Main extends React.Component {
  state = {}

  componentDidMount () {
    fetchData((err, data) => {
      if (err) return console.error(err)
      this.setState({data: data})
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
      .filter(nation => nation.name !== 'Kichwa')
  }

  getSidebarData () {
    const {nation, area, community} = this.props
    const {data} = this.state

    if (!data) return {}

    if (nation && area && community) {
      return getSidebarData.community(data, nation, community)
    } else if (nation && area) {
      return getSidebarData.area(data, area)
    } else if (nation) {
      return getSidebarData.nation(data, nation)
    } else {
      return getSidebarData.home(data)
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
    const {classes, nation, area, community, location} = this.props
    const sidebarProps = this.getSidebarData()

    if (!sidebarProps) return <Redirect to='/' />

    return <div className={classes.root}>
      <TransitionGroup className={classes.sidebar}>
        <Transition
          timeout={200}
          key={location.key}>
          {state => {
            return <Sidebar
              className={classes.sidebarAnimationBase + ' ' + classes['sidebar-' + state]}
              {...sidebarProps}
              onHover={this.handleHover} />
          }}
        </Transition>
      </TransitionGroup>
      <div className={classes.main}>
        <Topbar
          className={classes.topbar}
          nation={nation}
          area={area}
          community={community}
          nationList={this.getNationList()} />
        <MapView
          data={this.state.data}
          nation={nation}
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

module.exports = injectSheet(styles)(Main)

function getPath (nation, area, community) {
  let path = '/' + nation
  if (area) path += '/' + area
  if (!area && community) path += '/_'
  if (community) path += '/' + community
  return path
}
