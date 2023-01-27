const navigation = () => {
  return [
    {
      title: 'Admin Management',
      path: '/crms/admins',
      icon: 'mdi:account-lock',
      permission: ['super_admin']
    }, {
      title: 'Staff Management',
      path: '/crms/staffs',
      icon: 'mdi:account-lock-open',
      permission: ['super_admin', 'admin']
    }, {
      title: 'Agent Management',
      path: '/crms/agents',
      icon: 'mdi:face-agent',
      permission: ['super_admin', 'admin']
    }, {
      title: 'Logo Management',
      path: '/crms/logo',
      icon: 'mdi:camera-image',
      permission: ['super_admin']
    }, {
      title: 'Visa Price Management',
      path: '/crms/visa-prices',
      icon: 'mdi:cash',
      permission: ['super_admin', 'admin']
    }, {
      title: 'Applications',
      path: '/crms/applications',
      icon: 'mdi:text-box-multiple',
      permission: ['super_admin', 'admin', 'staff', 'agent']
    }, {
      title: 'Communications',
      path: '/crms/communications',
      icon: 'mdi:chat-processing',
      permission: ['admin', 'agent']
    }, {
      title: 'Setting',
      path: '/crms/setting',
      icon: 'mdi:cogs',
      permission: ['super_admin', 'admin']
    },
  ]
}

export default navigation
