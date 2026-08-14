import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export default function AdminRootPage() {
  redirect(ROUTES.adminDashboard)
}
