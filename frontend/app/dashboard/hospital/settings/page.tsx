'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Toggle } from '@/components/ui/Toggle';
import { hospitalAdminApi } from '@/lib/hospitalAdminApi';
import type { HospitalProfile } from '@/types/hospital';

type TabKey = 'hospital-info' | 'appearance' | 'notifications';

type ThemeAppearance = {
  primaryColor: string;
  typography: 'inter' | 'merriweather';
};

type NotificationPreferences = {
  newPatientRegistration: boolean;
  appointmentCancellations: boolean;
  labResultsAvailable: boolean;
  emergencyCodeBlue: boolean;
};

const COLOR_OPTIONS = ['#1B76FF', '#0EA5E9', '#8B5CF6', '#EC4899', '#10B981', '#0F172A'];

export default function HospitalSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('hospital-info');
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [appearance, setAppearance] = useState<ThemeAppearance>({
    primaryColor: '#1B76FF',
    typography: 'inter',
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    newPatientRegistration: true,
    appointmentCancellations: true,
    labResultsAvailable: false,
    emergencyCodeBlue: true,
  });

  useEffect(() => {
    const load = async () => {
      const response = await hospitalAdminApi.getProfile();
      if (!response.data) return;

      setProfile(response.data);
      setName(response.data.name || '');
      setDescription(response.data.description || '');
      setTimezone(response.data.timezone || 'UTC');

      const appearanceFromProfile = response.data.theme_settings?.appearance as ThemeAppearance | undefined;
      const notificationsFromProfile = response.data.theme_settings?.notifications as NotificationPreferences | undefined;

      if (appearanceFromProfile) {
        setAppearance({
          primaryColor: appearanceFromProfile.primaryColor || '#1B76FF',
          typography: appearanceFromProfile.typography || 'inter',
        });
      }

      if (notificationsFromProfile) {
        setNotifications({
          newPatientRegistration: Boolean(notificationsFromProfile.newPatientRegistration),
          appointmentCancellations: Boolean(notificationsFromProfile.appointmentCancellations),
          labResultsAvailable: Boolean(notificationsFromProfile.labResultsAvailable),
          emergencyCodeBlue: Boolean(notificationsFromProfile.emergencyCodeBlue),
        });
      }
    };
    void load();
  }, []);

  const previewFont = useMemo(
    () => (appearance.typography === 'merriweather' ? 'Merriweather, serif' : 'Inter, sans-serif'),
    [appearance.typography],
  );

  const persistThemeSettings = async (nextAppearance: ThemeAppearance, nextNotifications: NotificationPreferences) => {
    if (!profile) return;
    const response = await hospitalAdminApi.updateProfile({
      theme_settings: {
        ...(profile.theme_settings || {}),
        appearance: nextAppearance,
        notifications: nextNotifications,
      },
    });
    if (response.data) {
      setProfile(response.data);
    }
  };

  const saveHospitalInfo = async () => {
    setSaving(true);
    setSaveMessage('');
    const response = await hospitalAdminApi.updateProfile({
      name,
      description,
      timezone,
    });
    if (response.data) {
      setProfile(response.data);
      setSaveMessage('Hospital profile updated.');
    } else if (response.error) {
      setSaveMessage(response.error);
    }
    setSaving(false);
  };

  const saveAppearance = async () => {
    setSaving(true);
    setSaveMessage('');
    await persistThemeSettings(appearance, notifications);
    setSaveMessage('Appearance preferences saved.');
    setSaving(false);
  };

  const saveNotifications = async () => {
    setSaving(true);
    setSaveMessage('');
    await persistThemeSettings(appearance, notifications);
    setSaveMessage('Notification preferences saved.');
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark">Settings</h1>
        <p className="mt-1 text-neutral-gray">Manage hospital details and system preferences.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          { key: 'hospital-info', label: 'Hospital Info' },
          { key: 'appearance', label: 'Appearance' },
          { key: 'notifications', label: 'Notifications' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-light text-primary border border-primary/25'
                : 'bg-white text-neutral-gray border border-neutral-border hover:text-neutral-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'hospital-info' && (
        <Card className="p-6">
          <div className="grid gap-4">
            <Input label="Hospital Name" value={name} onChange={(event) => setName(event.target.value)} />
            <Textarea
              label="Description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Input label="Timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)} />
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={saveHospitalInfo} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'appearance' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-dark">Brand Colors</h2>
            <p className="mt-1 text-sm text-neutral-gray">Set the primary accent color for dashboard UI.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAppearance((current) => ({ ...current, primaryColor: color }))}
                  className={`h-8 w-8 rounded-full border-2 ${
                    appearance.primaryColor === color ? 'border-neutral-dark' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-neutral-dark">Typography</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAppearance((current) => ({ ...current, typography: 'inter' }))}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    appearance.typography === 'inter'
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-neutral-border text-neutral-gray'
                  }`}
                >
                  Inter
                </button>
                <button
                  type="button"
                  onClick={() => setAppearance((current) => ({ ...current, typography: 'merriweather' }))}
                  className={`rounded-lg border px-4 py-2 text-sm ${
                    appearance.typography === 'merriweather'
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-neutral-border text-neutral-gray'
                  }`}
                >
                  Merriweather
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={saveAppearance} disabled={saving}>
                {saving ? 'Saving...' : 'Apply Theme'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-dark">Live Preview</h2>
            <div className="mt-4 rounded-xl border border-neutral-border bg-neutral-light p-4">
              <div className="rounded-lg bg-white p-4">
                <p className="text-lg font-semibold" style={{ color: appearance.primaryColor, fontFamily: previewFont }}>
                  Medify Dashboard
                </p>
                <div className="mt-3 h-3 w-2/3 rounded bg-neutral-border" />
                <div className="mt-2 h-3 w-1/2 rounded bg-neutral-border" />
                <button
                  className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: appearance.primaryColor, fontFamily: previewFont }}
                >
                  Primary Button
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-dark">System Notifications</h2>
          <p className="mt-1 text-sm text-neutral-gray">Choose which alerts are sent to staff.</p>

          <div className="mt-6 space-y-5">
            <Toggle
              label="New Patient Registration"
              description="Notify admin desk when a patient self-registers online."
              checked={notifications.newPatientRegistration}
              onChange={(value) => setNotifications((current) => ({ ...current, newPatientRegistration: value }))}
            />
            <Toggle
              label="Appointment Cancellations"
              description="Alert assigned doctors when a patient cancels."
              checked={notifications.appointmentCancellations}
              onChange={(value) => setNotifications((current) => ({ ...current, appointmentCancellations: value }))}
            />
            <Toggle
              label="Lab Results Available"
              description="Send summary to attending physician when labs complete."
              checked={notifications.labResultsAvailable}
              onChange={(value) => setNotifications((current) => ({ ...current, labResultsAvailable: value }))}
            />
            <Toggle
              label="Emergency Code Blue"
              description="Push urgent notification to active on-call devices."
              checked={notifications.emergencyCodeBlue}
              onChange={(value) => setNotifications((current) => ({ ...current, emergencyCodeBlue: value }))}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveNotifications} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </Card>
      )}

      {saveMessage ? <p className="text-sm text-primary">{saveMessage}</p> : null}
    </div>
  );
}
