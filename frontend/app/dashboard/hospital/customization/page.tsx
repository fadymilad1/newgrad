'use client'

import React, { useEffect, useState, useRef } from 'react'
import { FiSave, FiUpload, FiImage, FiSettings, FiLayout, FiMessageSquare } from 'react-icons/fi'
import { hospitalAdminApi } from '@/lib/hospitalAdminApi'
import { normalizeLogoUrl } from '@/lib/storage'
import type { HospitalProfile } from '@/types/hospital'

interface ThemeSettings {
  primaryColor?: string
  backgroundColor?: string
  fontFamily?: string
  chatbotName?: string
  chatbotColor?: string
  borderRadius?: string
  emergencyNumber?: string
}

const DEFAULT_THEME: ThemeSettings = {
  primaryColor: '#2563eb',
  backgroundColor: '#f8fafc',
  fontFamily: 'Inter',
  chatbotName: 'Hospital Medical AI',
  chatbotColor: '#2563eb',
  borderRadius: '0.5rem',
  emergencyNumber: '911',
}

const AVAILABLE_FONTS = [
  { value: 'Inter', label: 'Inter (Clean & Modern)' },
  { value: 'Roboto', label: 'Roboto (Professional)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
  { value: 'Outfit', label: 'Outfit (Friendly)' },
]

export default function CustomizationPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profile, setProfile] = useState<HospitalProfile | null>(null)
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME)
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    const res = await hospitalAdminApi.getProfile()
    if (res.data) {
      setProfile(res.data)
      if (res.data.theme_settings && Object.keys(res.data.theme_settings).length > 0) {
        setTheme({ ...DEFAULT_THEME, ...res.data.theme_settings })
      }
      if (res.data.logo) {
        setLogoPreview(normalizeLogoUrl(res.data.logo))
      }
    } else {
      setError('Failed to load profile')
    }
    setLoading(false)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleThemeChange = (key: keyof ThemeSettings, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('theme_settings', JSON.stringify(theme))
      
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const res = await hospitalAdminApi.updateProfile(formData)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess('Website customization saved successfully!')
        if (res.data) {
          setProfile(res.data)
          if (res.data.logo) {
            setLogoPreview(normalizeLogoUrl(res.data.logo))
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred while saving.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-dark">Website Customization</h1>
          <p className="text-neutral-gray mt-1">Design your hospital's public-facing website and AI chatbot.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm"
        >
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Brand & Logo Settings */}
        <div className="rounded-xl border border-neutral-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-dark">
            <FiImage className="text-primary" />
            <h2>Brand & Logo</h2>
          </div>
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-border bg-neutral-light relative group">
                {logoPreview ? (
                  <img src={logoPreview} alt="Hospital Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-neutral-gray text-center text-sm p-4">No logo uploaded</div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white bg-primary rounded-full p-2"
                  >
                    <FiUpload />
                  </button>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                Change Logo
              </button>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark mb-1">Emergency Hotline Number</label>
                <input
                  type="text"
                  value={theme.emergencyNumber}
                  onChange={(e) => handleThemeChange('emergencyNumber', e.target.value)}
                  placeholder="e.g. 911 or 1-800-MEDIFY"
                  className="w-full rounded-lg border border-neutral-border px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Theme & Aesthetics */}
        <div className="rounded-xl border border-neutral-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-dark">
            <FiLayout className="text-primary" />
            <h2>Theme & Aesthetics</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-neutral-border p-1"
                />
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                  className="w-full rounded-lg border border-neutral-border px-3 py-2 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-neutral-border p-1"
                />
                <input
                  type="text"
                  value={theme.backgroundColor}
                  onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                  className="w-full rounded-lg border border-neutral-border px-3 py-2 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Typography (Font)</label>
              <select
                value={theme.fontFamily}
                onChange={(e) => handleThemeChange('fontFamily', e.target.value)}
                className="w-full rounded-lg border border-neutral-border px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
              >
                {AVAILABLE_FONTS.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Corner Style (Border Radius)</label>
              <select
                value={theme.borderRadius}
                onChange={(e) => handleThemeChange('borderRadius', e.target.value)}
                className="w-full rounded-lg border border-neutral-border px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
              >
                <option value="0rem">Sharp (0px)</option>
                <option value="0.25rem">Subtle (4px)</option>
                <option value="0.5rem">Rounded (8px)</option>
                <option value="1rem">Pill (16px)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Chatbot Customization */}
        <div className="rounded-xl border border-neutral-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-neutral-dark">
            <FiMessageSquare className="text-primary" />
            <h2>AI Chatbot Settings</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Chatbot Display Name</label>
              <input
                type="text"
                value={theme.chatbotName}
                onChange={(e) => handleThemeChange('chatbotName', e.target.value)}
                placeholder="e.g. St. Jude Assistant"
                className="w-full rounded-lg border border-neutral-border px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Chatbot Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.chatbotColor}
                  onChange={(e) => handleThemeChange('chatbotColor', e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-neutral-border p-1"
                />
                <input
                  type="text"
                  value={theme.chatbotColor}
                  onChange={(e) => handleThemeChange('chatbotColor', e.target.value)}
                  className="w-full rounded-lg border border-neutral-border px-3 py-2 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
