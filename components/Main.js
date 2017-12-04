const React = require('react')
const injectSheet = require('react-jss').default

const Sidebar = require('./Sidebar')
const Topbar = require('./Topbar')

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
    minWidth: 350
  },
  main: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column'
  },
  topbar: {
  },
  map: {
  }
}

class Main extends React.Component {
  state = {}

  componentDidMount () {

  }

  getNationList () {
    return []
  }

  render () {
    const {classes, nation, area, community} = this.props
    return <div className={classes.root}>
      <Sidebar className={classes.sidebar} />
      <div className={classes.main}>
        <Topbar nation={nation} area={area} community={community} nationList={this.getNationList()} />
        <div className={classes.map} />
      </div>
    </div>
  }
}

module.exports = injectSheet(styles)(Main)
