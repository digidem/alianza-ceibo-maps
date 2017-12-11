const React = require('react')
const PropTypes = require('prop-types')
const injectSheet = require('react-jss').default
const Markdown = require('react-markdown')
const classNames = require('classnames')
const shallowequal = require('shallowequal')

const gett = require('../lib/get_translations')
const Typography = require('./Typography')
const SidebarHeader = require('./SidebarHeader')
const SidebarCounts = require('./SidebarCounts')
const SidebarList = require('./SidebarList')
const SidebarListItem = require('./SidebarListItem')
const SidebarStoryItem = require('./SidebarStoryItem')
const Image = require('./Image')

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    overflowY: 'scroll',
    borderRight: '1px solid #E3E3E3',
    height: '100%'
  },
  padding: {
    padding: '2em'
  },
  sectionTitle: {
    padding: '0.625em 2em',
    borderTop: '1px solid #E3E3E3',
    borderBottom: '1px solid #E3E3E3'
  }
}

const t = {
  en: {
    installations: 'Installations'
  },
  es: {
    installations: 'Instalaciones'
  }
}

class Sidebar extends React.Component {
  componentWillReceiveProps (nextProps) {
    if (shallowequal(this.props, nextProps) || !this.scrollContent) return
    this.scrollContent.scrollTop = 0
  }

  render () {
    const {
      image,
      title,
      solar,
      water,
      text,
      listTitle,
      list,
      className: classNameProp,
      classes,
      stories
    } = this.props

    const className = classNames(classNameProp, classes.root)

    return <div className={className}>
      <SidebarHeader title={title} installationsCount={solar + water} />
      <div className={classes.content} ref={el => (this.scrollContent = el)}>
        {image && <Image src={image} ratio='4x3' />}
        {text && <div className={classes.padding}>
          <Markdown source={text} parserOptions={{smart: true}} renderers={{
            paragraph: props => <Typography gutterBottom type='body'>{props.children}</Typography>
          }} />
        </div>}
        {!!(solar + water) && <div className={classes.sectionTitle}>
          <Typography type='sectionTitle'>{gett(t).installations}</Typography>
        </div>}
        {!!(solar + water) && <div className={classes.padding}>
          <SidebarCounts water={water} solar={solar} />
        </div>}
        {listTitle && list && !!list.length && <div className={classes.sectionTitle}>
          <Typography type='sectionTitle'>{listTitle}</Typography>
        </div>}
        {list && <SidebarList>
          {list.map(item => stories
            ? <SidebarStoryItem key={item.name} {...item} />
            : <SidebarListItem key={item.name} {...item} />
          )}
        </SidebarList>}
      </div>
    </div>
  }
}

Sidebar.propTypes = {
  /* Sidebar title */
  title: PropTypes.string,
  /* Total number of solar installations for this sidebar context */
  solar: PropTypes.number.isRequired,
  /* Total number of water installations for this sidebar context */
  water: PropTypes.number.isRequired,
  /* URL to image to show at top of sidebar */
  image: PropTypes.string,
  /* Sidebar body text */
  text: PropTypes.string,
  /* Title for list of places in this context */
  listTitle: PropTypes.string,
  /* List of places to show */
  list: PropTypes.array,
  className: PropTypes.string,
  classes: PropTypes.object.isRequired,
  stories: PropTypes.bool
}

Sidebar.defaultProps = {
  title: 'Title Here',
  solar: 0,
  water: 0,
  stories: false
}

module.exports = injectSheet(styles)(Sidebar)
