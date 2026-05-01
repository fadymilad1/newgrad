'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiEye,
  FiLayers,
  FiPackage,
  FiShield,
  FiTrendingUp,
  FiUploadCloud,
} from 'react-icons/fi'

import { BrandLogo } from '@/components/pharmacy/BrandLogo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/ToastProvider'
import { businessInfoApi } from '@/lib/api'
import { pharmacyApi, pharmacyProductsApi, type PharmacyProfile, type ProductStats } from '@/lib/pharmacy'
import { getTemplateById } from '@/lib/pharmacyTemplates'

type BusinessInfoLite = {
  name?: string
  logo_url?: string
  address?: string
  about?: string
  is_published?: boolean
}

const initialStats: ProductStats = {
  total: 0,
  out_of_stock: 0,
  low_stock: 0,
  categories: 0,
  last_updated: null,
}

export default function PharmacyDashboardPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [profile, setProfile] = useState<PharmacyProfile | null>(null)
  const [productStats, setProductStats] = useState<ProductStats>(initialStats)
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoLite | null>(null)
  const [ownerId, setOwnerId] = useState('')

  useEffect(() => {
    const userRaw = localStorage.getItem('user')
    if (!userRaw) {
      router.push('/login')
      return
    }

    try {
      const user = JSON.parse(userRaw)
      const businessType = user.businessType || user.business_type
      if (businessType !== 'pharmacy') {
        router.push('/dashboard')
        return
      }
      if (user.id) {
        setOwnerId(String(user.id))
      }
    } catch {
      router.push('/dashboard')
      return
    }

    const load = async () => {
      setIsLoading(true)

      const [profileRes, statsRes, infoRes] = await Promise.all([
        pharmacyApi.getProfile(),
        pharmacyProductsApi.stats(),
        businessInfoApi.get(),
      ])

      if (profileRes.error) {
        showToast({
          type: 'error',
          title: 'Could not load pharmacy profile',
          message: profileRes.error,
        })
      }

      if (statsRes.error) {
        showToast({
          type: 'error',
          title: 'Could not load product stats',
          message: statsRes.error,
        })
      }

      if (infoRes.error) {
        showToast({
          type: 'error',
          title: 'Business info unavailable',
          message: infoRes.error,
        })
      }

      setProfile(profileRes.data || null)
      setProductStats(statsRes.data || initialStats)
      setBusinessInfo((infoRes.data as BusinessInfoLite) || null)
      setIsLoading(false)
    }

    void load()
  }, [router, showToast])

  const selectedTemplate = useMemo(() => getTemplateById(profile?.template_id), [profile?.template_id])
  const brandLogo = businessInfo?.logo_url || profile?.logo_url || ''
  const publishedWebsiteUrl = useMemo(() => {
    if (!profile?.is_published || !profile?.template_id) return null
    const query = ownerId ? `?owner=${ownerId}` : ''
    return `/templates/pharmacy/${profile.template_id}${query}`
  }, [profile?.is_published, profile?.template_id, ownerId])

  const isReadyToPublish = useMemo(() => {
    const hasTemplate = Boolean(profile?.template_id)
    const hasProducts = productStats.total > 0
    const hasInfo = Boolean((businessInfo?.name || '').trim() && (businessInfo?.address || '').trim())
    return hasTemplate && hasProducts && hasInfo && !profile?.is_published
  }, [businessInfo?.address, businessInfo?.name, productStats.total, profile?.is_published, profile?.template_id])

  const handlePublish = async () => {
    if (isPublishing) return
    setIsPublishing(true)

    const publishRes = await pharmacyApi.publish()
    if (publishRes.error) {
      showToast({ type: 'error', title: 'Publish failed', message: publishRes.error })
      setIsPublishing(false)
      return
    }

    setProfile((prev) => (prev ? { ...prev, is_published: true } : prev))
    showToast({ type: 'success', title: 'Website published', message: 'Your pharmacy website is now live.' })
    setIsPublishing(false)
  }

  const progressSteps = useMemo(
    () => [
      { label: 'Template selected', completed: Boolean(profile?.template_id) },
      { label: 'Products uploaded', completed: productStats.total > 0 },
      {
        label: 'Info completed',
        completed: Boolean((businessInfo?.name || '').trim() && (businessInfo?.address || '').trim()),
      },
      { label: 'Published', completed: Boolean(profile?.is_published) },
    ],
    [profile?.template_id, profile?.is_published, productStats.total, businessInfo?.name, businessInfo?.address],
  )

  const activeStep = progressSteps.findIndex((item) => !item.completed)
  const completedStepsCount = progressSteps.filter((item) => item.completed).length
  const completionPercent = Math.round((completedStepsCount / progressSteps.length) * 100)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary-light via-white to-neutral-light p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-2xl border border-primary/20 bg-white flex items-center justify-center shadow-sm">
              <BrandLogo
                src={brandLogo}
                alt="Pharmacy logo"
                fallbackText={businessInfo?.name || profile?.name || 'P'}
                imageClassName="h-full w-full object-cover"
                fallbackClassName="h-full w-full text-base font-bold text-primary flex items-center justify-center"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-dark">Pharmacy Dashboard</h1>
              <p className="text-neutral-gray mt-1">Track your storefront launch, inventory, and publishing status in one place.</p>
            </div>
          </div>

          <div>
            <div className="flex gap-2">
              <Link href="/dashboard/business-info">
                <Button variant="secondary">
                  <FiCheckCircle className="mr-2" />
                  Business Info
                </Button>
              </Link>
              <Link href="/dashboard/pharmacy/templates">
                <Button>
                  <FiEye className="mr-2" />
                  Templates
                </Button>
              </Link>
              {isReadyToPublish ? (
                <Button variant="secondary" onClick={() => void handlePublish()} disabled={isPublishing}>
                  {isPublishing ? 'Publishing...' : 'Publish Website'}
                </Button>
              ) : null}
              {publishedWebsiteUrl ? (
                <Link href={publishedWebsiteUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary">
                    <FiExternalLink className="mr-2" />
                    Open My Website
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-primary/20 bg-white/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-gray">Launch Readiness</p>
            <p className="mt-1 text-lg font-bold text-neutral-dark">{completionPercent}%</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-white/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-gray">Current Template</p>
            <p className="mt-1 text-sm font-semibold text-neutral-dark">{selectedTemplate?.name || 'Not selected yet'}</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-white/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-gray">Website Status</p>
            <p className="mt-1 text-sm font-semibold text-neutral-dark">{profile?.is_published ? 'Published' : 'Draft'}</p>
          </div>
        </div>
      </section>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-dark">Launch Progress</h2>
          <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
            {completedStepsCount}/{progressSteps.length} done
          </span>
        </div>
        <p className="mt-2 text-sm text-neutral-gray">Complete each milestone to unlock a fully published storefront.</p>
        <div className="mt-5">
          <ProgressBar steps={progressSteps} currentStep={activeStep === -1 ? progressSteps.length - 1 : activeStep} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5 border-primary/15">
          <div className="text-sm text-neutral-gray">Website Status</div>
          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-24" />
          ) : (
            <div className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
              profile?.is_published
                ? 'bg-success/10 text-success'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {profile?.is_published ? 'Published' : 'Draft'}
            </div>
          )}
        </Card>

        <Card className="p-5 border-primary/15">
          <div className="text-sm text-neutral-gray">Product Count</div>
          {isLoading ? <Skeleton className="mt-3 h-8 w-20" /> : <div className="mt-3 text-3xl font-bold">{productStats.total}</div>}
        </Card>

        <Card className="p-5 border-primary/15">
          <div className="text-sm text-neutral-gray">Last Updated</div>
          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-36" />
          ) : (
            <div className="mt-3 flex items-center gap-2 text-sm text-neutral-dark">
              <FiClock />
              <span>
                {productStats.last_updated
                  ? new Date(productStats.last_updated).toLocaleString()
                  : profile?.updated_at
                  ? new Date(profile.updated_at).toLocaleString()
                  : 'Not updated yet'}
              </span>
            </div>
          )}
        </Card>

        <Card className="p-5 border-primary/15">
          <div className="text-sm text-neutral-gray">Selected Template</div>
          {isLoading ? (
            <Skeleton className="mt-3 h-8 w-32" />
          ) : (
            <div className="mt-3 flex items-start gap-2 text-sm text-neutral-dark">
              <FiLayers className="mt-0.5" />
              <span>{selectedTemplate?.name || 'Not selected yet'}</span>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-dark">Quick Actions</h2>
          <p className="mt-1 text-sm text-neutral-gray">Move through template selection, catalog updates, and preview flow quickly.</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href="/dashboard/pharmacy/templates" className="rounded-xl border border-neutral-border p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
              <FiLayers className="text-primary" />
              <div className="mt-2 font-semibold">Choose Template</div>
              <div className="text-sm text-neutral-gray">Buy and activate a ready-made template.</div>
            </Link>
            <Link href="/dashboard/pharmacy/products" className="rounded-xl border border-neutral-border p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
              <FiUploadCloud className="text-primary" />
              <div className="mt-2 font-semibold">Upload Products</div>
              <div className="text-sm text-neutral-gray">CSV import, manual add, edit, and delete.</div>
            </Link>
            <Link href="/dashboard/pharmacy/templates" className="rounded-xl border border-neutral-border p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
              <FiEye className="text-primary" />
              <div className="mt-2 font-semibold">Preview in Templates</div>
              <div className="text-sm text-neutral-gray">Use template preview before activation.</div>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-dark">Inventory Health</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-neutral-light p-3">
              <span className="inline-flex items-center gap-2">
                <FiPackage />
                In catalog
              </span>
              <strong>{productStats.total}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-light p-3">
              <span>Out of stock</span>
              <strong>{productStats.out_of_stock}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-light p-3">
              <span>Low stock</span>
              <strong>{productStats.low_stock}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-neutral-light p-3">
              <span>Categories</span>
              <strong>{productStats.categories}</strong>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
            <p className="inline-flex items-center gap-2 rounded-lg border border-neutral-border bg-neutral-light px-3 py-2 text-neutral-dark"><FiShield className="text-primary" /> Purchase-safe activation</p>
            <p className="inline-flex items-center gap-2 rounded-lg border border-neutral-border bg-neutral-light px-3 py-2 text-neutral-dark"><FiTrendingUp className="text-primary" /> Live catalog sync</p>
          </div>

          <div className="mt-5 text-xs text-neutral-gray">
            {profile?.is_published ? (
              <span className="inline-flex items-center gap-1 text-success">
                <FiCheckCircle />
                Website is published and live-ready.
              </span>
            ) : (
              <span>Publish from settings after selecting a template and uploading products.</span>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
