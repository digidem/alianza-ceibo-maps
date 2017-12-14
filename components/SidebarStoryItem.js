const React = require('react')
const PropTypes = require('prop-types')
const injectSheet = require('react-jss').default
const {Link} = require('react-router-dom')

const gett = require('../lib/get_translations')
const Typography = require('./Typography')
const Image = require('./Image')

const styles = {
  root: {
    margin: '2rem',
    position: 'relative',
    boxShadow: '0px 0px 8px 0px #dedede'
  },
  link: {
    textDecoration: 'none',
    display: 'block',
    '&:hover': {
      backgroundColor: '#FFF5E5',
      cursor: 'pointer'
    }
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '6rem',
    overflow: 'hidden',
    flexWrap: 'wrap',
    flexDirection: 'row-reverse'
  },
  label: {
    minWidth: 0,
    height: '6rem',
    display: 'flex',
    flex: '1 1 6rem',
    padding: '1rem',
    boxSizing: 'border-box',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  storyLink: {
    textTransform: 'none'
  },
  image: {
    width: '6rem',
    position: 'relative'
  }
}

const SidebarStoryItem = ({name, image, url, classes}) => (
  <li className={classes.root}>
    <a href={url} className={classes.link}>
      <div className={classes.wrapper}>
        <div className={classes.label}>
          <Typography type='listTitle'>{name}</Typography>
          <Typography type='listSubtitle' noWrap className={classes.storyLink}>
            {url.replace(/^https?:\/\//, '')}
          </Typography>
        </div>
        <div className={classes.image}>
          {image && <Image src={image} ratio='1x1' />}
        </div>
      </div>
    </a>
  </li>
)

SidebarStoryItem.propTypes = {
  url: PropTypes.string,
  name: PropTypes.string.isRequired,
  image: PropTypes.string,
  classes: PropTypes.object.isRequired
}

SidebarStoryItem.defaultProps = {
  baseUrl: '',
  solar: 0,
  water: 0,
  featured: false
}

module.exports = injectSheet(styles)(SidebarStoryItem)
