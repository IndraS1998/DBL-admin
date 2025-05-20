import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  //SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
//import { TeamSwitcher } from '@/components/layout/team-switcher'
import { sidebarData } from './data/sidebar-data'
import Cookies from 'js-cookie'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const email = Cookies.get("mail")
  const firstName = Cookies.get("first_name")
  const user = {
    name: firstName || ' ',
    email: email || ' ',
    avatar: '/avatars/shadcn.jpg',
  }
  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      {
        /*
        <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
        */
      }
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
