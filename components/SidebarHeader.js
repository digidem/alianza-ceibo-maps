const React = require('react')
const PropTypes = require('prop-types')
const injectSheet = require('react-jss').default
const classNames = require('classnames')

const gett = require('../lib/get_translations')
const Typography = require('./Typography')

const t = {
  es: {
    installations: 'instalaciones en total',
    in: 'en',
    communities: 'comunidades'
  },
  en: {
    installations: 'total installations',
    in: 'in',
    communities: 'communities'
  }
}

const styles = {
  root: {
    padding: '2em',
    backgroundColor: '#365973',
    color: 'white'
  }
}

const SidebarHeader = ({title, installationsCount, communitiesCount, className, classes}) => (
  <div className={classNames(classes.root, className)}>
    <Typography gutterBottom type='title'>{title}</Typography>
    {!!installationsCount && <Typography type='subtitle'>
      {installationsCount} {gett(t).installations}
    </Typography>}
    {!!communitiesCount && <Typography type='subtitle'>
      {communitiesCount} {gett(t).communities}
    </Typography>}
  </div>
)

SidebarHeader.propTypes = {
  title: PropTypes.string.isRequired,
  installationsCount: PropTypes.number.isRequired,
  communitiesCount: PropTypes.number,
  className: PropTypes.string,
  classes: PropTypes.object.isRequired
}

module.exports = injectSheet(styles)(SidebarHeader)
