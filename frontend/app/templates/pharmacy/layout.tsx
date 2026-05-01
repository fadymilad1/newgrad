'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { pharmacyApi } from '@/lib/pharmacy'
import {
  getPharmacyThemeCssVariables,
  getStoredPharmacyThemeSettings,
  normalizePharmacyThemeSettings,
  persistPharmacyThemeSettings,
} from '@/lib/pharmacyTheme'
import { getSiteItem, getStoredUser, setPublicSiteItem, setSiteItem, setSiteOwnerId } from '@/lib/storage'

type BusinessInfoSnapshot = {
  name?: string
  logo?: string
  about?: string
  address?: string
  contactPhone?: string
  workingHours?: Record<string, unknown>
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export default function PharmacyTemplatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<div className="pharmacy-theme-root">{children}</div>}>
      <PharmacyTemplatesLayoutContent>{children}</PharmacyTemplatesLayoutContent>
    </React.Suspense>
  )
}

function PharmacyTemplatesLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const ownerId = searchParams?.get('owner') || ''
  const isDemo = searchParams?.get('demo') === '1' || searchParams?.get('demo') === 'true'
  // Keep first render deterministic across server/client to avoid hydration mismatches.
  const [themeSettings, setThemeSettings] = useState(() => normalizePharmacyThemeSettings(null))

  useEffect(() => {
    const syncThemeFromStorage = () => {
      setThemeSettings(getStoredPharmacyThemeSettings())
    }

    syncThemeFromStorage()
    window.addEventListener('storage', syncThemeFromStorage)

    if (ownerId) {
      setSiteOwnerId(ownerId)
    }

    const currentUser = getStoredUser()
    if (!ownerId && currentUser?.id) {
      setSiteOwnerId(currentUser.id)
    }

    if (!isDemo) {
      const cachedInfo = safeJsonParse<BusinessInfoSnapshot>(getSiteItem('businessInfo'))
      const token = localStorage.getItem('access_token')
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

      if (token) {
        void fetch(`${apiBase}/business-info/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => (response.ok ? response.json() : null))
          .then((data) => {
            if (!data?.logo_url) return

            const merged: BusinessInfoSnapshot = {
              ...(cachedInfo || {}),
              name: data.name || cachedInfo?.name || '',
              about: data.about || cachedInfo?.about || '',
              address: data.address || cachedInfo?.address || '',
              contactPhone: data.contact_phone || cachedInfo?.contactPhone || '',
              workingHours: data.working_hours || cachedInfo?.workingHours || {},
              logo: data.logo_url,
            }

            const serialized = JSON.stringify(merged)
            setSiteItem('businessInfo', serialized)
            setPublicSiteItem('businessInfo', serialized)
          })
          .catch(() => {
            // Ignore network errors; pages already support local fallbacks.
          })
      }

      void pharmacyApi
        .getProfile()
        .then((profileRes) => {
          if (!profileRes.data?.theme_settings) return
          const normalized = normalizePharmacyThemeSettings(profileRes.data.theme_settings)
          persistPharmacyThemeSettings(normalized)
          setThemeSettings(normalized)
        })
        .catch(() => {
          // Ignore profile hydration errors and use cached values.
        })
    }

    return () => {
      window.removeEventListener('storage', syncThemeFromStorage)
    }
  }, [isDemo, ownerId])

  const themeVariables = useMemo(
    () => getPharmacyThemeCssVariables(themeSettings),
    [themeSettings],
  )

  return (
    <div className="pharmacy-theme-root" style={themeVariables as React.CSSProperties}>
      {children}
    </div>
  )
}
