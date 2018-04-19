import React from 'react'
import PropTypes from 'prop-types'
import injectSheet from 'react-jss'
import { defineMessages, FormattedMessage } from 'react-intl'

import Link from './Link'
import Typography from './Typography'
import Image from './Image'

const messages = defineMessages({
  // Installation count for sidebar list subheading
  installationsCount: `{count, plural,
    =0 {0 installations}
    one {1 installation}
    other {# installations}}`
})

const styles = {
  root: {
    borderBottom: '1px solid #E3E3E3',
    position: 'relative'
  },
  link: {
    textDecoration: 'none',
    display: 'block',
    padding: '1.25rem 2rem',
    '&:hover': {
      backgroundColor: '#FFF5E5',
      cursor: 'pointer'
    }
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '4rem',
    overflow: 'hidden',
    flexWrap: 'wrap'
  },
  label: {
    minWidth: 0,
    height: '4rem',
    display: 'flex',
    flex: '1 1 6rem',
    paddingRight: '0.25rem',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  image: {
    width: '6rem',
    position: 'relative'
  },
  color: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 'calc(2rem - 5px)',
    bottom: 'calc(1.25rem - 5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  featuredIcon: {
    position: 'absolute',
    top: 35,
    left: 11,
    width: 13
  },
  playIcon: {
    height: 13
  }
}

const SidebarListItem = ({id, intlName, name, total, color, featured, image, baseUrl, onHover, classes}) => {
  return (
    <li className={classes.root} onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover()}>
      <Link to={`${baseUrl}/${window.encodeURIComponent(name)}`} className={classes.link}>
        <div className={classes.wrapper}>
          <div className={classes.label}>
            <Typography type='listTitle'>{intlName || name}</Typography>
            <Typography type='listSubtitle' noWrap>
              <FormattedMessage {...messages.installationsCount} values={{count: total}} />
            </Typography>
          </div>
          <div className={classes.image}>
            {image && <Image src={image} ratio='3x2' />}
          </div>
        </div>
        {featured && <img src='/icons/star.svg' className={classes.featuredIcon} />}
        {color && <div className={classes.color} style={{backgroundColor: color}}>
          {featured && <img src='/icons/play.svg' className={classes.playIcon} />}
        </div>}
      </Link>
    </li>
  )
}

SidebarListItem.propTypes = {
  id: PropTypes.string,
  baseUrl: PropTypes.string,
  intlName: PropTypes.string,
  name: PropTypes.string.isRequired,
  total: PropTypes.number,
  color: PropTypes.string,
  featured: PropTypes.bool,
  image: PropTypes.string,
  onHover: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
}

SidebarListItem.defaultProps = {
  baseUrl: '',
  total: 0,
  featured: false
}

module.exports = injectSheet(styles)(SidebarListItem)
