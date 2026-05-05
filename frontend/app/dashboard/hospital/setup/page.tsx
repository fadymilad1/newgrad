'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { FiDollarSign } from 'react-icons/fi'
import { getScopedItem, setScopedItem } from '@/lib/storage'
import { websiteSetupApiV2 } from '@/lib/api'

interface Feature {
  key: string
  label: string
  description: string
  price: number
}

type FeatureState = {
  reviewSystem: boolean
  aiChatbot: boolean
  ambulanceOrdering: boolean
  patientPortal: boolean
  prescriptionRefill: boolean
}

const DEFAULT_FORM_STATE: FeatureState = {
  reviewSystem: false,
  aiChatbot: false,
  ambulanceOrdering: false,
  patientPortal: false,
  prescriptionRefill: false,
}

const FEATURES: Feature[] = [
  { key: 'reviewSystem', label: 'Review System', description: 'Allow patients to leave reviews and ratings', price: 19 },
  { key: 'aiChatbot', label: 'AI Chatbot', description: 'AI-powered chatbot for patient inquiries (monthly subscription)', price: 29 },
  { key: 'ambulanceOrdering', label: 'Order Ambulance', description: 'Enable patients to request ambulance services', price: 29 },
  { key: 'patientPortal', label: 'Patient Portal', description: 'Enable patient portal access', price: 39 },
  { key: 'prescriptionRefill', label: 'Prescription Refill', description: 'Allow online prescription refills', price: 19 },
]

export default function HospitalSetupPage() {
  const router = useRouter()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [userType, setUserType] = useState<'hospital' | 'pharmacy'>('hospital')
  const [formData, setFormData] = useState<FeatureState>(DEFAULT_FORM_STATE)
  const [isHydrated, setIsHydrated] = useState(false)

  // Check user type and redirect pharmacy users
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      const businessType = user.businessType || user.business_type || 'hospital'
      setUserType(businessType)

      if (businessType === 'pharmacy') {
        router.push('/dashboard/pharmacy/templates')
        return
      }
    }
  }, [router])

  useEffect(() => {
    const hydrate = async () => {
      let backendFeatures: Partial<FeatureState> | null = null
      let storedFeatures: Partial<FeatureState> | null = null

      try {
        const token = localStorage.getItem('access_token')
        if (token) {
          const response = await websiteSetupApiV2.get()
          const payload = response.data as any
          const setup = Array.isArray(payload?.results)
            ? payload.results[0]
            : Array.isArray(payload)
              ? payload[0]
              : payload

          if (setup) {
            backendFeatures = {
              reviewSystem: Boolean(setup.review_system),
              aiChatbot: Boolean(setup.ai_chatbot),
              ambulanceOrdering: Boolean(setup.ambulance_ordering),
              patientPortal: Boolean(setup.patient_portal),
              prescriptionRefill: Boolean(setup.prescription_refill),
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load hospital feature setup from backend:', error)
      }

      try {
        const storedRaw = getScopedItem('selectedFeatures')
        if (storedRaw) {
          const parsed = JSON.parse(storedRaw) as Partial<FeatureState>
          storedFeatures = {
            reviewSystem: Boolean(parsed.reviewSystem),
            aiChatbot: Boolean(parsed.aiChatbot),
            ambulanceOrdering: Boolean(parsed.ambulanceOrdering),
            patientPortal: Boolean(parsed.patientPortal),
            prescriptionRefill: Boolean(parsed.prescriptionRefill),
          }
        }
      } catch (error) {
        console.warn('Failed to load stored hospital features:', error)
      }

      const resolvedFeatures = backendFeatures || storedFeatures || null
      if (backendFeatures) {
        setScopedItem('selectedFeatures', JSON.stringify(backendFeatures))
      }

      setFormData((prev) => ({
        ...prev,
        ...(resolvedFeatures || {}),
      }))

      setIsHydrated(true)
    }

    void hydrate()
  }, [])

  // Calculate total price dynamically
  const totalPrice = useMemo(() => {
    let total = 0
    FEATURES.forEach((feature) => {
      if (formData[feature.key as keyof FeatureState]) {
        total += feature.price
      }
    })
    return total
  }, [formData])

  // Auto-save features to backend whenever they change
  useEffect(() => {
    if (!isHydrated) return

    setScopedItem('selectedFeatures', JSON.stringify(formData))
    setScopedItem('totalPrice', totalPrice.toString())

    const persist = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) return
        await websiteSetupApiV2.update({
          review_system: formData.reviewSystem,
          ai_chatbot: formData.aiChatbot,
          ambulance_ordering: formData.ambulanceOrdering,
          patient_portal: formData.patientPortal,
          prescription_refill: formData.prescriptionRefill,
          total_price: totalPrice,
        })
      } catch (error) {
        console.warn('Failed to auto-save hospital features:', error)
      }
    }

    void persist()
  }, [formData, isHydrated, totalPrice])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentOpen(true)
  }

  const handlePaymentSuccess = async () => {
    setScopedItem('selectedFeatures', JSON.stringify(formData))
    setScopedItem('totalPrice', totalPrice.toString())
    router.push('/dashboard/business-info?type=hospital')
  }

  const handleSaveDraft = () => {
    setScopedItem('selectedFeatures', JSON.stringify(formData))
    setScopedItem('totalPrice', totalPrice.toString())
    alert('Draft saved successfully!')
  }

  // Don't render anything for pharmacy users (they'll be redirected)
  if (userType === 'pharmacy') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-neutral-gray">Redirecting to templates...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark mb-2">Hospital Website Setup</h1>
        <p className="text-neutral-gray">
          Select the features you want on your hospital website. You can manage your doctors and
          departments from the{' '}
          <a href="/dashboard/hospital/doctors" className="text-primary underline">
            Doctors tab
          </a>
          .
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Features Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-dark">Features</h2>
              <div className="flex items-center gap-2 bg-primary-light px-4 py-2 rounded-lg">
                <FiDollarSign className="text-primary" size={20} />
                <span className="text-2xl font-bold text-primary">${totalPrice}</span>
              </div>
            </div>
            <div className="space-y-4">
              {FEATURES.map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 border border-neutral-border rounded-lg">
                  <div className="flex-1">
                    <Toggle
                      label={feature.label}
                      checked={formData[feature.key as keyof FeatureState]}
                      onChange={(checked) =>
                        setFormData({ ...formData, [feature.key]: checked })
                      }
                      description={feature.description}
                    />
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-lg font-semibold text-neutral-dark">${feature.price}</p>
                    <p className="text-xs text-neutral-gray">{feature.key === 'aiChatbot' ? '/month' : 'one-time'}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="secondary" type="button" onClick={handleSaveDraft}>
              Save Draft
            </Button>
            <Button variant="primary" type="submit" formNoValidate>
              <FiDollarSign className="mr-2" />
              Continue to Payment (${totalPrice})
            </Button>
          </div>
        </div>
      </form>

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        amount={totalPrice}
        description="Payment for selected hospital website features"
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
