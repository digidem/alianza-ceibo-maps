const React = require('react')
const classNames = require('classnames')
const PropTypes = require('prop-types')
const injectSheet = require('react-jss').default

const styles = {
  root: {
    height: 0,
    position: 'relative',
    width: '100%'
  },
  ratio1x1: {
    paddingBottom: '100%'
  },
  ratio3x2: {
    paddingBottom: '66.666%'
  },
  ratio4x3: {
    paddingBottom: '75%'
  },
  ratio16x9: {
    paddingBottom: '56.25%'
  },
  image: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundSize: 'cover',
    backgroundReport: 'no-repeat',
    backgroundPosition: 'center'
  }
}

const Image = ({
  src,
  ratio,
  className: classNameProp,
  classes,
  ...other
}) => {
  const className = classNames(
    classes.root,
    classes['ratio' + ratio],
    classNameProp
  )
  return <div className={className} {...other}>
    <div style={{backgroundImage: 'url(' + src + ')'}} className={classes.image} />
  </div>
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  ratio: PropTypes.oneOf([
    '1x1',
    '3x2',
    '4x3',
    '16x9'
  ]),
  className: PropTypes.string,
  classes: PropTypes.object.isRequired
}

Image.defaultProps = {
  ratio: '3x2'
}

module.exports = injectSheet(styles)(Image)
