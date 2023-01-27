import { useContext } from "react"
import { AuthContext } from "src/context/AuthContext";

// ** Custom Menu Components
import VerticalNavLink from './VerticalNavLink'
import VerticalNavGroup from './VerticalNavGroup'
import VerticalNavSectionTitle from './VerticalNavSectionTitle'

const resolveNavItemComponent = item => {
  if (item.sectionTitle) return VerticalNavSectionTitle
  if (item.children) return VerticalNavGroup

  return VerticalNavLink
}

const VerticalNavItems = props => {
  // ** Props
  const { verticalNavItems } = props
  const authContext = useContext(AuthContext);

  const RenderMenuItems = verticalNavItems?.map((item, index) => {
    const TagName = resolveNavItemComponent(item)
    const user = authContext.user;

    return user && item.permission.includes(user.role) && <TagName {...props} key={index} item={item} />
  })

  return <>{RenderMenuItems}</>
}

export default VerticalNavItems
