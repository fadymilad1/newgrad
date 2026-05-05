'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { hospitalAdminApi } from '@/lib/hospitalAdminApi';
import type { Department, Doctor } from '@/types/hospital';
import { FiPlus, FiEdit2, FiChevronDown, FiChevronRight, FiUpload, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DoctorFormData {
  name: string;
  title: string;
  specialty: string;
  bio: string;
  email: string;
  experience: string;
  department: string;   // department id
  newDeptName: string;  // if creating new dept
  is_active: boolean;
}

interface ImportRow {
  name: string;
  title: string;
  specialty: string;
  email: string;
  experience: string;
  department: string;
  bio: string;
}

const EMPTY_FORM: DoctorFormData = {
  name: '', title: '', specialty: '', bio: '', email: '',
  experience: '', department: '', newDeptName: '', is_active: true,
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(t => t[0]?.toUpperCase() ?? '').join('');
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-dark mb-1">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT = 'w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none';

// ─── Doctor Form Modal ────────────────────────────────────────────────────────

interface DoctorModalProps {
  mode: 'add' | 'edit';
  initialData: DoctorFormData;
  departments: Department[];
  onClose: () => void;
  onSave: (data: DoctorFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
}

function DoctorModal({ mode, initialData, departments, onClose, onSave, saving, error }: DoctorModalProps) {
  const [form, setForm] = useState<DoctorFormData>(initialData);
  const set = (k: keyof DoctorFormData, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-border">
          <h2 className="text-xl font-semibold text-neutral-dark">
            {mode === 'add' ? 'Add New Doctor' : 'Edit Doctor'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-light text-neutral-gray">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <FiAlertCircle className="flex-shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" required>
              <input className={INPUT} value={form.name} placeholder="Dr. Ahmed Ali"
                onChange={e => set('name', e.target.value)} />
            </Field>
            <Field label="Title">
              <input className={INPUT} value={form.title} placeholder="Consultant Cardiologist"
                onChange={e => set('title', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Specialty" required>
              <input className={INPUT} value={form.specialty} placeholder="e.g. Cardiology"
                onChange={e => set('specialty', e.target.value)} />
            </Field>
            <Field label="Experience">
              <input className={INPUT} value={form.experience} placeholder="e.g. 10 years"
                onChange={e => set('experience', e.target.value)} />
            </Field>
          </div>

          <Field label="Email">
            <input className={INPUT} type="email" value={form.email} placeholder="doctor@hospital.com"
              onChange={e => set('email', e.target.value)} />
          </Field>

          <Field label="Bio">
            <textarea className={INPUT + ' resize-none'} rows={3} value={form.bio}
              placeholder="Brief biography..."
              onChange={e => set('bio', e.target.value)} />
          </Field>

          <Field label="Department" required>
            <select className={INPUT} value={form.department} onChange={e => set('department', e.target.value)}>
              <option value="">-- Select department --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
              <option value="__new__">+ Create new department…</option>
            </select>
          </Field>

          {form.department === '__new__' && (
            <Field label="New Department Name" required>
              <input className={INPUT} value={form.newDeptName} placeholder="e.g. Neurology"
                onChange={e => set('newDeptName', e.target.value)} />
            </Field>
          )}

          {mode === 'edit' && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_active}
                onChange={e => set('is_active', e.target.checked)}
                className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm font-medium text-neutral-dark">Active (visible on website)</span>
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-neutral-border">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(form)} disabled={saving}>
            {saving ? 'Saving…' : mode === 'add' ? 'Add Doctor' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Import Preview Modal ─────────────────────────────────────────────────────

function ImportModal({ rows, departments, onClose, onConfirm, importing }: {
  rows: ImportRow[];
  departments: Department[];
  onClose: () => void;
  onConfirm: () => Promise<void>;
  importing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-border">
          <div>
            <h2 className="text-xl font-semibold text-neutral-dark">Import Preview</h2>
            <p className="text-sm text-neutral-gray mt-0.5">{rows.length} doctor(s) found. Review before importing.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-light text-neutral-gray"><FiX size={20} /></button>
        </div>
        <div className="overflow-auto flex-1 p-6">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-border text-left text-neutral-gray">
                {['Name','Title','Specialty','Email','Experience','Department','Bio'].map(h => (
                  <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-neutral-border/60 hover:bg-neutral-light/40">
                  <td className="px-3 py-2 font-medium text-neutral-dark">{r.name || <span className="text-error">Missing</span>}</td>
                  <td className="px-3 py-2 text-neutral-gray">{r.title}</td>
                  <td className="px-3 py-2 text-neutral-gray">{r.specialty}</td>
                  <td className="px-3 py-2 text-neutral-gray">{r.email}</td>
                  <td className="px-3 py-2 text-neutral-gray">{r.experience}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      departments.some(d => d.name.toLowerCase() === r.department.toLowerCase())
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {r.department || 'General'}{' '}
                      {!departments.some(d => d.name.toLowerCase() === r.department.toLowerCase()) && '(new)'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-neutral-gray max-w-[200px] truncate">{r.bio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-neutral-border">
          <Button variant="secondary" onClick={onClose} disabled={importing}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm} disabled={importing}>
            {importing ? 'Importing…' : `Import ${rows.length} Doctor(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HospitalDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDepts, setOpenDepts] = useState<Set<string>>(new Set());

  // Modal state
  const [addOpen, setAddOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Import state
  const [importRows, setImportRows] = useState<ImportRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [docRes, deptRes] = await Promise.all([
      hospitalAdminApi.listDoctors(),
      hospitalAdminApi.listDepartments(),
    ]);
    if (docRes.data) setDoctors(docRes.data);
    if (deptRes.data) {
      setDepartments(deptRes.data);
      setOpenDepts(new Set(deptRes.data.map(d => d.id)));
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  // ── Filtered doctors grouped by department ─────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? doctors.filter(d =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.department_name.toLowerCase().includes(q),
        )
      : doctors;
  }, [doctors, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, { dept: { id: string; name: string }; docs: Doctor[] }>();
    for (const doc of filtered) {
      const key = doc.department || 'unknown';
      if (!map.has(key)) map.set(key, { dept: { id: key, name: doc.department_name || 'Unknown' }, docs: [] });
      map.get(key)!.docs.push(doc);
    }
    return [...map.values()].sort((a, b) => a.dept.name.localeCompare(b.dept.name));
  }, [filtered]);

  const toggleDept = (id: string) => {
    setOpenDepts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Resolve or create department ───────────────────────────────────────────
  const resolveDepartment = async (form: DoctorFormData): Promise<string | null> => {
    if (form.department === '__new__') {
      if (!form.newDeptName.trim()) { setModalError('Please enter a department name.'); return null; }
      const res = await hospitalAdminApi.createDepartment({ name: form.newDeptName.trim() });
      if (res.error || !res.data) { setModalError(res.error ?? 'Failed to create department.'); return null; }
      setDepartments(prev => [...prev, res.data!]);
      return res.data.id;
    }
    if (!form.department) { setModalError('Please select a department.'); return null; }
    return form.department;
  };

  // ── Add doctor ─────────────────────────────────────────────────────────────
  const handleAdd = async (form: DoctorFormData) => {
    if (!form.name.trim()) { setModalError('Name is required.'); return; }
    if (!form.specialty.trim()) { setModalError('Specialty is required.'); return; }
    setModalSaving(true);
    setModalError(null);
    const deptId = await resolveDepartment(form);
    if (!deptId) { setModalSaving(false); return; }
    const bio = [form.title, form.experience].filter(Boolean).join(' • ') || form.bio;
    const res = await hospitalAdminApi.createDoctor({ name: form.name, specialty: form.specialty, bio, department: deptId });
    if (res.error || !res.data) { setModalError(res.error ?? 'Failed to create doctor.'); setModalSaving(false); return; }
    await hospitalAdminApi.createDefaultSchedules(res.data.id);
    await load();
    setAddOpen(false);
    setModalSaving(false);
  };

  // ── Edit doctor ────────────────────────────────────────────────────────────
  const handleEdit = async (form: DoctorFormData) => {
    if (!editDoctor) return;
    if (!form.name.trim()) { setModalError('Name is required.'); return; }
    setModalSaving(true);
    setModalError(null);
    const deptId = await resolveDepartment(form);
    if (!deptId) { setModalSaving(false); return; }
    const bio = form.bio || [form.title, form.experience].filter(Boolean).join(' • ');
    const res = await hospitalAdminApi.updateDoctor(editDoctor.id, {
      name: form.name, specialty: form.specialty, bio, department: deptId, is_active: form.is_active,
    });
    if (res.error) { setModalError(res.error); setModalSaving(false); return; }
    await load();
    setEditDoctor(null);
    setModalSaving(false);
  };

  // ── Excel/CSV import ───────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
    const rows: ImportRow[] = raw.map(r => ({
      name: String(r['Name'] ?? r['name'] ?? '').trim(),
      title: String(r['Title'] ?? r['title'] ?? '').trim(),
      specialty: String(r['Specialty'] ?? r['specialty'] ?? r['Specialization'] ?? '').trim(),
      email: String(r['Email'] ?? r['email'] ?? '').trim(),
      experience: String(r['Experience'] ?? r['experience'] ?? '').trim(),
      department: String(r['Department'] ?? r['department'] ?? '').trim(),
      bio: String(r['Bio'] ?? r['bio'] ?? '').trim(),
    })).filter(r => r.name);
    if (rows.length === 0) { alert('No valid rows found. Make sure your file has a "Name" column.'); return; }
    setImportRows(rows);
  };

  const handleImportConfirm = async () => {
    if (!importRows) return;
    setImporting(true);
    let created = 0;
    // Build dept name → id map (case-insensitive)
    const deptMap = new Map<string, string>(departments.map(d => [d.name.toLowerCase(), d.id]));

    for (const row of importRows) {
      try {
        const deptKey = (row.department || 'General').toLowerCase();
        let deptId = deptMap.get(deptKey);
        if (!deptId) {
          const res = await hospitalAdminApi.createDepartment({ name: row.department || 'General' });
          if (res.data) { deptId = res.data.id; deptMap.set(deptKey, deptId); setDepartments(p => [...p, res.data!]); }
        }
        if (!deptId) continue;
        const bio = row.bio || [row.title, row.experience].filter(Boolean).join(' • ');
        const docRes = await hospitalAdminApi.createDoctor({ name: row.name, specialty: row.specialty || 'General', bio, department: deptId });
        if (docRes.data) { await hospitalAdminApi.createDefaultSchedules(docRes.data.id); created++; }
      } catch { /* skip bad rows */ }
    }

    await load();
    setImportRows(null);
    setImporting(false);
    setImportSuccess(`Successfully imported ${created} doctor(s).`);
    setTimeout(() => setImportSuccess(null), 5000);
  };

  // ── Build edit initial form ─────────────────────────────────────────────────
  const editInitial = (doc: Doctor): DoctorFormData => {
    const parts = (doc.bio ?? '').split(' • ');
    return {
      name: doc.name,
      title: parts[0] ?? '',
      specialty: doc.specialty,
      bio: doc.bio ?? '',
      email: '',
      experience: parts[1] ?? '',
      department: doc.department ?? '',
      newDeptName: '',
      is_active: doc.is_active,
    };
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark">Doctors Directory</h1>
          <p className="mt-1 text-neutral-gray">Manage your medical staff, grouped by department.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <FiUpload className="mr-2" /> Import Excel / CSV
          </Button>
          <Button variant="primary" onClick={() => { setModalError(null); setAddOpen(true); }}>
            <FiPlus className="mr-2" /> Add Doctor
          </Button>
        </div>
      </div>

      {/* Success banner */}
      {importSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium">
          <FiCheck className="flex-shrink-0" /> {importSuccess}
        </div>
      )}

      {/* Search */}
      <Card className="p-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search doctors by name, specialty, or department…"
          className="input-field w-full md:max-w-lg"
        />
      </Card>

      {/* Import tip */}
      <div className="text-xs text-neutral-gray bg-neutral-light border border-neutral-border rounded-lg px-4 py-2">
        📋 <strong>Excel import columns:</strong> Name, Title, Specialty, Email, Experience, Department, Bio
        — departments are created automatically if they don&apos;t exist yet.
      </div>

      {/* Content */}
      {loading ? (
        <Card className="p-6 text-sm text-neutral-gray">Loading doctors…</Card>
      ) : grouped.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-neutral-gray mb-4">{search ? 'No doctors match your search.' : 'No doctors yet.'}</p>
          {!search && (
            <Button variant="primary" onClick={() => { setModalError(null); setAddOpen(true); }}>
              <FiPlus className="mr-2" /> Add your first doctor
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ dept, docs }) => {
            const isOpen = openDepts.has(dept.id);
            return (
              <Card key={dept.id} className="overflow-hidden">
                {/* Department header — clickable to expand/collapse */}
                <button
                  type="button"
                  onClick={() => toggleDept(dept.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-light/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isOpen ? <FiChevronDown className="text-primary" size={18} /> : <FiChevronRight className="text-neutral-gray" size={18} />}
                    <span className="font-semibold text-neutral-dark text-lg">{dept.name}</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-primary-light text-primary text-xs font-semibold">
                      {docs.length} doctor{docs.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>

                {/* Doctor rows */}
                {isOpen && (
                  <div className="border-t border-neutral-border divide-y divide-neutral-border/60">
                    {docs.map(doc => (
                      <div key={doc.id} className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-light/30 transition-colors">
                        {/* Avatar */}
                        <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-primary-light text-primary text-sm font-bold">
                          {initials(doc.name)}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-3">
                          <p className="font-medium text-neutral-dark truncate">{doc.name}</p>
                          <p className="text-sm text-primary truncate">{doc.specialty}</p>
                          <p className="text-sm text-neutral-gray truncate">{doc.bio?.split(' • ')[1] ?? ''}</p>
                          <div>
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              doc.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {doc.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => { setModalError(null); setEditDoctor(doc); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-border text-sm text-neutral-gray hover:bg-primary-light hover:text-primary hover:border-primary/30 transition-colors flex-shrink-0"
                        >
                          <FiEdit2 size={14} /> Edit
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Doctor Modal */}
      {addOpen && (
        <DoctorModal
          mode="add"
          initialData={EMPTY_FORM}
          departments={departments}
          onClose={() => setAddOpen(false)}
          onSave={handleAdd}
          saving={modalSaving}
          error={modalError}
        />
      )}

      {/* Edit Doctor Modal */}
      {editDoctor && (
        <DoctorModal
          mode="edit"
          initialData={editInitial(editDoctor)}
          departments={departments}
          onClose={() => setEditDoctor(null)}
          onSave={handleEdit}
          saving={modalSaving}
          error={modalError}
        />
      )}

      {/* Import Preview Modal */}
      {importRows && (
        <ImportModal
          rows={importRows}
          departments={departments}
          onClose={() => setImportRows(null)}
          onConfirm={handleImportConfirm}
          importing={importing}
        />
      )}
    </div>
  );
}
