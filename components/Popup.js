const React = require('react')
const PropTypes = require('prop-types')
const injectSheet = require('react-jss').default

const styles = {
  '@global': {
    '.mapboxgl-popup-tip': {
      visibility: 'hidden'
    },
    '.mapboxgl-popup-content': {
      padding: 0,
      pointerEvents: 'none',
      borderRadius: 5
    }
  },
  root: {
    fontWeight: 'bold',
    color: 'black',
    display: 'flex',
    alignItems: 'center',
    padding: '0 7px',
    fontSize: 12,
    lineHeight: 1.2
  },
  square: {
    marginRight: 7,
    width: 10,
    height: 10,
    opacity: 0.6
  },
  name: {
    padding: '5px 7px 5px 0',
    borderRight: '1px solid black',
    '&:last-child': {
      borderRight: 'none',
      paddingRight: 0
    }
  },
  dataItem: {
    marginLeft: 7,
    display: 'flex',
    alignItems: 'end'
  },
  icon: {
    width: 13
  },
  count: {
    marginLeft: 2
  }
}

class Popup extends React.PureComponent {
  render () {
    const {name, solar, water, color, classes} = this.props
    return (<div className={classes.root}>
      {!!color && <div className={classes.square} style={{backgroundColor: color}} />}
      <div className={classes.name}>
        {name}
      </div>
      {!!water && <div className={classes.dataItem}>
        <img className={classes.icon} src='/icons/comunidad-agua-dot.svg' />
        <div className={classes.count}>{water}</div>
      </div>}
      {!!solar && <div className={classes.dataItem}>
        <img className={classes.icon} src='/icons/comunidad-solar-dot.svg' />
        <div className={classes.count}>{solar}</div>
      </div>}
    </div>)
  }
}

Popup.propTypes = {
  name: PropTypes.string.isRequired,
  solar: PropTypes.number,
  water: PropTypes.number,
  color: PropTypes.string,
  classes: PropTypes.object.isRequired
}

module.exports = injectSheet(styles)(Popup)
