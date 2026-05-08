import { useState } from 'react'
import { Outlet, useMatch } from 'react-router-dom'
import ProfileSidebar from './ProfileSidebar'
import ProfileDashboard from './ProfileDashboard'
import EditProfileModal from './EditProfileModal'

export default function Profile() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const isFavorites = useMatch('/perfil/favoritos')

  return (
    <div className="flex flex-1">
      <ProfileSidebar
        isDrawerOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEditProfile={() => setIsEditModalOpen(true)}
      />
      {isFavorites ? (
        <Outlet />
      ) : (
        <ProfileDashboard onOpenSidebar={() => setIsDrawerOpen(true)} />
      )}
      {isEditModalOpen && (
        <EditProfileModal onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  )
}
