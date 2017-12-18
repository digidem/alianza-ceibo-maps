import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import injectSheet from 'react-jss'

const styles = {
  root: {
    fontFamily: '"Montserrat", "sans-serif"',
    fontWeight: 400,
    margin: 0,
    display: 'block',
    lineHeight: 1.4
  },
  title: {
    fontSize: '1.8rem',
    color: 'white',
    fontWeight: 600,
    lineHeight: 1.2
  },
  subtitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: 'rgb(102, 153, 204)',
    fontWeight: 600,
    letterSpacing: '0.03em'
  },
  sectionTitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: 'rgb(54, 89, 115)',
    fontWeight: 600,
    letterSpacing: '0.03em'
  },
  legendItem: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    color: '#eeeeee',
    fontWeight: 400,
    letterSpacing: '0.05em'
  },
  listTitle: {
    fontSize: '1.3rem',
    color: 'rgb(153, 51, 0)',
    fontWeight: 600,
    lineHeight: 1.2,
    marginBottom: '0.15em',
    display: '-webkit-box',
    maxHeight: 2 * 1.2 * 1.3 + 'rem',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden'
  },
  listSubtitle: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: 'rgb(153, 153, 153)',
    fontWeight: 500,
    letterSpacing: '0.03em'
  },
  body: {
    fontSize: '0.8rem',
    lineHeight: 1.6,
    color: 'rgb(102, 102, 102)'
  },
  count: {
    fontSize: '1.4rem',
    color: 'rgb(54, 89, 115)',
    fontWeight: 600,
    letterSpacing: '0.04em'
  },
  countLabel: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: 'rgb(54, 89, 115)',
    fontWeight: 500
  },
  noWrap: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  gutterBottom: {
    marginBottom: '0.35em'
  }
}

const headlineMapping = {
  title: 'h1',
  subtitle: 'h2',
  sectionTitle: 'h3',
  legendItem: 'span',
  listTitle: 'h4',
  listSubtitle: 'h5',
  body: 'p',
  countLabel: 'span',
  count: 'span'
}

const Typography = ({
  type,
  noWrap,
  classes,
  className: classNameProp,
  color,
  gutterBottom,
  ...other
}) => {
  const className = classNames(
    classes.root,
    classes[type],
    {
      [classes.noWrap]: noWrap,
      [classes.gutterBottom]: gutterBottom
    },
    classNameProp
  )
  const Component = headlineMapping[type] || 'p'

  return <Component className={className} style={{color: color}} {...other} />
}

Typography.propTypes = {
  type: PropTypes.oneOf([
    'title',
    'subtitle',
    'sectionTitle',
    'listTitle',
    'listSubtitle',
    'body',
    'count',
    'countLabel',
    'legendItem'
  ]),
  noWrap: PropTypes.bool,
  color: PropTypes.string,
  classes: PropTypes.object.isRequired
}

Typography.defaultProps = {
  type: 'body',
  noWrap: false,
  gutterBottom: false
}

module.exports = injectSheet(styles)(Typography)
