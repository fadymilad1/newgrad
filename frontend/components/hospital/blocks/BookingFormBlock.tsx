'use client';

import React, { useState, useEffect } from 'react';
import { Doctor, AvailableSlot } from '@/types/hospital';
import { getHospitalDoctors, getAvailableSlots, createAppointment } from '@/lib/hospitalApi';

interface BookingFormBlockProps {
    settings: {
        title?: string;
        success_message?: string;
    };
    subdomain: string;
}

export default function BookingFormBlock({ settings, subdomain }: BookingFormBlockProps) {
    const title = settings.title || 'Book an Appointment';
    const successMessage = settings.success_message || 'Your appointment has been successfully booked!';

    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [departmentId, setDepartmentId] = useState<string>('');
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [slots, setSlots] = useState<AvailableSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

    const [patientName, setPatientName] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [patientPhone, setPatientPhone] = useState('');

    const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [errorMsg, setErrorMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Initial load: Fetch doctors and apply URL filters
    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const docs = await getHospitalDoctors(subdomain);
                setAllDoctors(docs);
                const params = new URLSearchParams(window.location.search);
                const deptId = params.get('department_id');
                const docId = params.get('doctor_id');
                
                let filtered = docs;
                if (deptId) {
                    setDepartmentId(deptId);
                    filtered = docs.filter(d => d.department === deptId || (d as any).department_id === deptId);
                }
                setDoctors(filtered);
                
                if (docId && docs.find(d => d.id === docId)) {
                    setSelectedDoctorId(docId);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingDoctors(false);
            }
        };
        fetchDocs();
    }, [subdomain]);

    // Fetch slots when doctor or date changes
    const fetchSlots = async () => {
        if (!selectedDoctorId || !selectedDate) {
            setSlots([]);
            setSelectedSlot(null);
            return;
        }

        setIsLoadingSlots(true);
        setSelectedSlot(null);
        try {
            const res = await getAvailableSlots(selectedDoctorId, selectedDate);
            setSlots(res.slots || []);
        } catch (err) {
            console.error(err);
            setSlots([]);
        } finally {
            setIsLoadingSlots(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [selectedDoctorId, selectedDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoctorId || !selectedSlot) return;

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const result = await createAppointment({
                doctor_id: selectedDoctorId,
                start_datetime: selectedSlot.start_datetime,
                end_datetime: selectedSlot.end_datetime,
                patient_name: patientName,
                patient_email: patientEmail,
                patient_phone: patientPhone
            });

            if ('error' in result) {
                setErrorMsg(result.error);
                if (result.status === 409) {
                    // Backend 409 is the source of truth. Auto-refresh slots.
                    await fetchSlots();
                }
            } else {
                setIsSuccess(true);
            }
        } catch (err) {
            setErrorMsg('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isSuccess) {
        return (
            <div className="py-16 px-6 container mx-auto max-w-2xl text-center">
                <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-xl shadow-sm">
                    <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h2 className="text-2xl font-bold mb-2">Success!</h2>
                    <p className="text-lg">{successMessage}</p>
                    <button 
                        onClick={() => {
                            setIsSuccess(false);
                            setSelectedSlot(null);
                            setPatientName('');
                            setPatientEmail('');
                            setPatientPhone('');
                            // Refetch slots in case they want to book again for same date
                            fetchSlots();
                        }} 
                        className="mt-6 text-green-700 underline font-medium hover:text-green-800"
                    >
                        Book another appointment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 px-6 bg-white">
            <div className="container mx-auto max-w-3xl">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10">
                    <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">{title}</h2>

                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                            <p className="font-semibold">Booking Error</p>
                            <p>{errorMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Department filter label */}
                        {departmentId && (
                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">
                                <span>Filtered by department</span>
                                <button
                                    type="button"
                                    onClick={() => { setDepartmentId(''); setDoctors(allDoctors); setSelectedDoctorId(''); }}
                                    className="ml-auto text-blue-500 hover:text-blue-700 underline"
                                >
                                    Show all doctors
                                </button>
                            </div>
                        )}

                        {/* No doctors empty state */}
                        {!isLoadingDoctors && doctors.length === 0 && (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-4xl mb-3">👨‍⚕️</p>
                                <p className="text-gray-700 font-semibold text-lg">No doctors available yet</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {departmentId
                                        ? 'No doctors in this department. Try showing all doctors.'
                                        : 'The hospital is still setting up. Please check back soon.'}
                                </p>
                                {departmentId && (
                                    <button
                                        type="button"
                                        onClick={() => { setDepartmentId(''); setDoctors(allDoctors); }}
                                        className="mt-4 text-blue-600 underline text-sm"
                                    >
                                        Show all doctors
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Step 1: Select Doctor */}
                        {(isLoadingDoctors || doctors.length > 0) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select a Doctor</label>
                            {isLoadingDoctors ? (
                                <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg border border-gray-200"></div>
                            ) : (
                                <select 
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 bg-gray-50 border transition-colors hover:bg-white"
                                    value={selectedDoctorId}
                                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose a Specialist --</option>
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id}>{doc.name} — {doc.specialty}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        )}

                        {/* Step 2: Select Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                            <input 
                                type="date"
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 bg-gray-50 border transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                value={selectedDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                disabled={!selectedDoctorId}
                                required
                            />
                            {!selectedDoctorId && <p className="text-xs text-gray-400 mt-1">Please select a doctor first.</p>}
                        </div>

                        {/* Step 3: Select Slot */}
                        {selectedDoctorId && selectedDate && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                                {isLoadingSlots ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg border border-gray-200"></div>
                                        ))}
                                    </div>
                                ) : slots.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center bg-gray-50 p-8 rounded-xl border border-gray-200 border-dashed text-center">
                                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <p className="text-gray-600 font-medium">No Availability</p>
                                        <p className="text-gray-400 text-sm mt-1">There are no open slots on this date. Please select another date.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                                        {slots.map((slot, idx) => {
                                            const isSelected = selectedSlot?.start_datetime === slot.start_datetime;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all duration-200 ${
                                                        isSelected 
                                                            ? 'bg-teal-600 text-white border-teal-600 shadow-md transform scale-105' 
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-teal-500 hover:bg-teal-50'
                                                    }`}
                                                >
                                                    {formatTime(slot.start_datetime)}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Patient Details (Only show if a slot is selected) */}
                        {selectedSlot && (
                            <div className="pt-8 mt-8 border-t border-gray-200 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h3 className="text-xl font-semibold text-gray-900">Patient Details</h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        type="text"
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 bg-gray-50 border transition-colors hover:bg-white"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input 
                                        type="email"
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 bg-gray-50 border transition-colors hover:bg-white"
                                        value={patientEmail}
                                        onChange={(e) => setPatientEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input 
                                        type="tel"
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 p-3 bg-gray-50 border transition-colors hover:bg-white"
                                        value={patientPhone}
                                        onChange={(e) => setPatientPhone(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-4 px-6 text-white text-lg font-bold rounded-lg shadow-md transition-all ${
                                            isSubmitting 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg active:scale-[0.98]'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing Booking...
                                            </span>
                                        ) : (
                                            `Confirm Appointment for ${formatTime(selectedSlot.start_datetime)}`
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
