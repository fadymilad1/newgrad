'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { hospitalAdminApi } from '@/lib/hospitalAdminApi';
import type { Department, HospitalProfile } from '@/types/hospital';

export default function HospitalEmergencyPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [hotline, setHotline] = useState('1-800-MEDIFY');
  const [isSaving, setIsSaving] = useState(false);
  const [emergencyIds, setEmergencyIds] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      // Load departments
      const deptResponse = await hospitalAdminApi.listDepartments();
      let loadedDepts: Department[] = [];
      if (deptResponse.data) {
        loadedDepts = deptResponse.data;
        setDepartments(loadedDepts);
      }

      // Load profile to get current emergency number & ids
      const profileResponse = await hospitalAdminApi.getProfile();
      if (profileResponse.data) {
        setProfile(profileResponse.data);
        const savedNumber = profileResponse.data.theme_settings?.emergencyNumber;
        if (savedNumber) setHotline(savedNumber);
        
        const savedIds = profileResponse.data.theme_settings?.emergencyDepartmentIds;
        if (Array.isArray(savedIds)) {
          setEmergencyIds(savedIds);
        } else {
          // Fallback to name-based match if not yet configured
          const defaultIds = loadedDepts
            .filter((d) => d.name.toLowerCase().includes('emerg'))
            .map((d) => d.id);
          setEmergencyIds(defaultIds);
        }
      }
    };
    void load();
  }, []);

  const handleSaveHotline = async () => {
    if (!profile) return;
    setIsSaving(true);
    const updatedThemeSettings = {
      ...(profile.theme_settings || {}),
      emergencyNumber: hotline
    };
    
    const response = await hospitalAdminApi.updateProfile({
      theme_settings: updatedThemeSettings
    });
    
    if (response.data) {
      setProfile(response.data);
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const toggleEmergencyDepartment = async (deptId: string, isAdding: boolean) => {
    if (!profile) return;
    
    const newIds = isAdding 
      ? [...emergencyIds, deptId] 
      : emergencyIds.filter(id => id !== deptId);
    
    setEmergencyIds(newIds);
    
    const updatedThemeSettings = {
      ...(profile.theme_settings || {}),
      emergencyDepartmentIds: newIds
    };
    
    const response = await hospitalAdminApi.updateProfile({
      theme_settings: updatedThemeSettings
    });
    
    if (response.data) {
      setProfile(response.data);
    }
  };

  const emergencyDepartments = departments.filter((d) => emergencyIds.includes(d.id));
  const otherDepartments = departments.filter((d) => !emergencyIds.includes(d.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark">Emergency</h1>
        <p className="mt-1 text-neutral-gray">Central emergency actions and escalation support.</p>
      </div>

      <Card className="border border-red-200 bg-red-50 p-6 relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Emergency Hotline</p>
            
            {isEditing ? (
              <div className="mt-2 flex items-center gap-2">
                <Input 
                  value={hotline} 
                  onChange={(e) => setHotline(e.target.value)}
                  className="max-w-[250px] text-lg font-bold text-red-700 bg-white"
                />
                <Button onClick={handleSaveHotline} disabled={isSaving} className="bg-red-600 hover:bg-red-700">
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="secondary" onClick={() => {
                  setIsEditing(false);
                  setHotline(profile?.theme_settings?.emergencyNumber || '1-800-MEDIFY');
                }} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-4">
                <p className="text-3xl font-bold text-red-700">{hotline}</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-semibold text-red-600 underline hover:no-underline"
                >
                  Edit Number
                </button>
              </div>
            )}
            
            <p className="mt-2 text-sm text-red-700/85">
              Trigger critical communication and rapid response workflows.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button className="bg-red-600 hover:bg-red-700">Activate Code Blue</Button>
          <Button variant="secondary" className="border-red-300 text-red-700 hover:bg-red-100">
            Notify On-call Team
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-dark">Emergency-capable departments</h2>
          <p className="text-sm text-neutral-gray mb-4">These departments are highlighted on the public website for emergency access.</p>
          <div className="space-y-2">
            {emergencyDepartments.length === 0 ? (
              <p className="text-sm text-neutral-gray italic">No emergency departments added yet.</p>
            ) : (
              emergencyDepartments.map((department) => (
                <div key={department.id} className="flex justify-between items-center rounded-lg border border-red-200 bg-red-50 p-3">
                  <div>
                    <p className="font-semibold text-red-800">{department.name}</p>
                  </div>
                  <button 
                    onClick={() => toggleEmergencyDepartment(department.id, false)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-dark">Available departments</h2>
          <p className="text-sm text-neutral-gray mb-4">Add departments to the emergency list.</p>
          <div className="space-y-2">
            {otherDepartments.length === 0 ? (
              <p className="text-sm text-neutral-gray italic">All departments are currently emergency-capable.</p>
            ) : (
              otherDepartments.map((department) => (
                <div key={department.id} className="flex justify-between items-center rounded-lg border border-neutral-border bg-white p-3">
                  <div>
                    <p className="font-semibold text-neutral-dark">{department.name}</p>
                  </div>
                  <button 
                    onClick={() => toggleEmergencyDepartment(department.id, true)}
                    className="text-sm font-medium text-primary hover:text-primary-strong"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
