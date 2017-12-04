const React = require('react')
const PropTypes = require('prop-types')
const injectSheet = require('react-jss').default
const { Link } = require('react-router-dom')
const classNames = require('classnames')

const Typography = require('./Typography')
const gett = require('../util/get_translations')

const t = {
  en: {
    legend: 'Map Legend',
    water: 'Water Installations',
    solar: 'Solar Installations',
    waterSolar: 'Water & Solar Installations',
    story: 'Communities With Story'
  },
  es: {
    legend: 'Leyenda del Mapa',
    water: 'Instalaciones de Agua',
    solar: 'Instalaciones de Solar',
    waterSolar: 'Instalaciones de Agua y Solar',
    story: 'Comunidades con Historia'
  }
}

const styles = {
  root: {
    maxHeight: '3.0625rem',
    backgroundColor: 'rgba(51, 51, 51, 0.8)',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 1.25rem'
  },
  link: {
    color: '#999999',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer'
    }
  },
  active: {
    color: '#ffffff'
  },
  topbarItem: {
    padding: '1rem 0'
  },
  legendButton: {
    borderLeft: '1px solid #333333',
    borderRight: '1px solid #333333',
    userSelect: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1.25rem',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: 'rgba(0,0,0,0.2)'
    }
  },
  legendIcon: {
    width: '0.625rem',
    transition: 'transform 200ms ease'
  },
  collapse: {
    transform: 'rotate(180deg)'
  },
  legend: {
    overflow: 'auto',
    height: 0
  },
  legendInner: {
    overflow: 'auto',
    backgroundColor: 'rgba(0,0,0,0.85)',
    transform: 'translateY(-100%)',
    transition: 'transform 200ms ease'
  },
  open: {
    height: 'auto',
    '& $legendInner': {
      transform: 'translateY(0)'
    }
  },
  legendList: {
    margin: '1rem 1.25rem',
    padding: 0,
    listStyle: 'none'
  },
  legendDivider: {
    backgroundColor: '#000000',
    height: 1,
    border: 'none'
  }
}

const Breadcrumb = ({last, text, to, classes}) => (
  <span>{' / '}{last
  ? <span className={classes.active}>{text}</span>
  : <Link className={classes.link} to={to}>{text}</Link>}
  </span>
)

const legendItemStyles = {
  root: {
    display: 'flex',
    padding: 0,
    margin: '1rem 0',
    alignItems: 'center'
  },
  icon: {
    display: 'block',
    marginRight: '0.75rem',
    width: '1rem'
  },
  colorPatch: {
    marginRight: '0.75rem',
    width: '1rem',
    height: '1rem'
  }
}

const LegendItem = injectSheet(legendItemStyles)(({icon, color, text, classes}) => (
  <li className={classes.root}>
    {icon && <img src={icon} className={classes.icon} />}
    {color && <div className={classes.colorPatch} style={{backgroundColor: color}} />}
    <Typography type='legendItem'>{text}</Typography>
  </li>
))

class Topbar extends React.Component {
  state = {
    legendOpen: false
  }

  render () {
    const {nation, area, community, nationList, classes} = this.props
    const {legendOpen} = this.state
    const legendIconClassName = classNames(classes.legendIcon, {[classes.collapse]: legendOpen})
    const legendClassName = classNames(classes.legend, {[classes.open]: legendOpen})
    return <div className={classes.root}>
      <div>
        <Typography type='sectionTitle' color='#999999' className={classes.topbarItem}>
          <Link className={classNames(classes.link, {[classes.active]: !nation})} to='/'>
            Map Overview
          </Link>
          {!!nation && <Breadcrumb last={!area} text={nation} to={`/${nation}`} classes={classes} />}
          {!!nation && !!area && <Breadcrumb last={!community} text={area} to={`/${nation}/${area}`} classes={classes} />}
          {!!nation && !!area && !!community && <Breadcrumb last text={community} classes={classes} />}
        </Typography>
      </div>
      <div>
        <div className={classes.legendButton} onClick={() => this.setState({legendOpen: !legendOpen})}>
          <Typography type='sectionTitle' color='#999999' className={classes.topbarItem}>
            {gett(t).legend}
          </Typography>
          <img className={legendIconClassName} src='icons/expand.svg' />
        </div>
        <div className={legendClassName}>
          <div className={classes.legendInner}>
            <ul className={classes.legendList}>
              <LegendItem text={gett(t).water} icon='icons/comunidad-agua-dot.svg' />
              <LegendItem text={gett(t).solar} icon='icons/comunidad-solar-dot.svg' />
              <LegendItem text={gett(t).waterSolar} icon='icons/comunidad-agua-solar-dot.svg' />
              <LegendItem text={gett(t).story} icon='icons/star.svg' />
              <hr className={classes.legendDivider} />
              {nationList.map(nation => (
                <LegendItem text={nation.name} color={nation.color} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  }
}

Topbar.propTypes = {
  nation: PropTypes.string,
  area: PropTypes.string,
  community: PropTypes.string,
  /* List of nationalities on map */
  nationList: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired
  })),
  classes: PropTypes.object.isRequired
}

Topbar.defaultProps = {
  nationList: []
}

module.exports = injectSheet(styles)(Topbar)
