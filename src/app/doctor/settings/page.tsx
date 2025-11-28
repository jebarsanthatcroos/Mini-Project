/* eslint-disable no-undef */
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DoctorSettings, Message } from '@/types/doctor';
import LoadingSpinner from '@/components/Loading';
import SettingsHeader from '@/components/Doctor/settings/SettingsHeader';
import MessageAlert from '@/components/Doctor/settings/MessageAlert';
import PersonalInfoSection from '@/components/Doctor/settings/PersonalInfoSection';
import ProfessionalInfoSection from '@/components/Doctor/settings/ProfessionalInfoSection';
import AvailabilitySection from '@/components/Doctor/settings/AvailabilitySection';
import FormActions from '@/components/Doctor/settings/FormActions';

export default function DoctorSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>({ type: '', content: '' });

  const [settings, setSettings] = useState<DoctorSettings>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    hospital: '',
    bio: '',
    consultationFee: 0,
    availableHours: {
      start: '09:00',
      end: '17:00',
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.role !== 'DOCTOR') {
      router.push('/unauthorized');
      return;
    }

    if (session?.user) {
      fetchDoctorSettings();
    }
  }, [session, status, router]);

  const fetchDoctorSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/doctor/settings');

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        setMessage({ type: 'error', content: 'Failed to load settings' });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', content: 'Error loading settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await fetch('/api/doctor/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          content: 'Settings updated successfully!',
        });
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          content: error.error || 'Failed to update settings',
        });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', content: 'Error updating settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof DoctorSettings] as object),
          [child]: value,
        },
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleWorkingDayChange = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleCancel = () => {
    router.back();
  };

  if (status === 'loading' || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white shadow rounded-lg'>
          <SettingsHeader
            title='Doctor Settings'
            subtitle='Manage your profile and practice settings'
          />

          <MessageAlert message={message} />

          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            <PersonalInfoSection settings={settings} onChange={handleChange} />

            <ProfessionalInfoSection
              settings={settings}
              onChange={handleChange}
            />

            <AvailabilitySection
              settings={settings}
              onChange={handleChange}
              onWorkingDayChange={handleWorkingDayChange}
            />

            <FormActions saving={saving} onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </div>
  );
}
