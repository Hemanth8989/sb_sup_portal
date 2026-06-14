import { ProfileNav } from './_components/ProfileNav'
import { BusinessInfoForm } from './_components/BusinessInfoForm'
import { PublicProfileForm } from './_components/PublicProfileForm'
import { PerformanceStats } from './_components/PerformanceStats'
import { NotificationPrefsForm } from './_components/NotificationPrefsForm'

export const metadata = { title: 'Profile — StoneBridge' }

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 shrink-0">
        <h1 className="text-sm font-semibold text-foreground">Profile</h1>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 flex gap-8">

          {/* Left sticky nav */}
          <aside className="w-44 shrink-0 self-start sticky top-6">
            <ProfileNav />
          </aside>

          {/* Right scrollable sections */}
          <div className="flex-1 min-w-0 space-y-4 scroll-smooth">
            <BusinessInfoForm />
            <PublicProfileForm />
            <PerformanceStats />
            <NotificationPrefsForm />
          </div>

        </div>
      </div>
    </div>
  )
}
