const React = require('react')
const PropTypes = require('prop-types')
const injectSheet = require('react-jss').default
const Markdown = require('react-markdown')
const classNames = require('classnames')

const gett = require('../util/get_translations')
const Typography = require('./Typography')
const SidebarHeader = require('./SidebarHeader')
const SidebarCounts = require('./SidebarCounts')
const SidebarList = require('./SidebarList')
const SidebarListItem = require('./SidebarListItem')
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

const Sidebar = ({image, title, solar, water, text, listTitle, list, className, classes}) => (
  <div className={classNames(className, classes.root)}>
    <SidebarHeader title={title} installationsCount={solar + water} />
    <div className={classes.content}>
      {image && <Image src={image} ratio='16x9' />}
      {text && <div className={classes.padding}>
        <Markdown source={text} renderers={{
          paragraph: props => <Typography gutterBottom type='body'>{props.children}</Typography>
        }} />
      </div>}
      {!!(solar + water) && <div className={classes.sectionTitle}>
        <Typography type='sectionTitle'>{gett(t).installations}</Typography>
      </div>}
      {!!(solar + water) && <div className={classes.padding}>
        <SidebarCounts water={water} solar={solar} />
      </div>}
      {listTitle && <div className={classes.sectionTitle}>
        <Typography type='sectionTitle'>{listTitle}</Typography>
      </div>}
      {list && <SidebarList>
        {list.map(item => <SidebarListItem {...item} />)}
      </SidebarList>}
    </div>
  </div>
)

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
  classes: PropTypes.object.isRequired
}

Sidebar.defaultProps = {
  title: 'Where We Work',
  solar: 0,
  water: 0,
  image: 'sidebar.jpg',
  text: `Our focus on building solutions is not about quick technological fixes,
    nor the naïve belief in the power of "good intentions" to resolve a deep
    human health, social and environmental crisis, but rather it is about working
    side-by-side with indigenous peoples struggling to secure life’s basic
    necessities in a first imperiled by the industrial frontier.`
}

module.exports = injectSheet(styles)(Sidebar)
