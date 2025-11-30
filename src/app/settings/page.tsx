/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/hooks/settings';
import {
  LANGUAGE_OPTIONS,
  SRI_LANKA_TIMEZONES,
  DATE_FORMATS,
} from '@/types/settings';
import {
  FiSettings,
  FiBell,
  FiShield,
  FiUser,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiMoon,
  FiSun,
  FiMonitor,
  FiMessageSquare,
  FiMail,
  FiSmartphone,
  FiCalendar,
  FiFileText,
  FiDroplet,
  FiCreditCard,
  FiBarChart2,
  FiMapPin,
} from 'react-icons/fi';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<
    'general' | 'notifications' | 'privacy' | 'security'
  >('general');
  const {
    settings,
    isLoading,
    error,
    saveStatus,
    updateSettings,
    updateNotificationPreferences,
    resetToDefaults,
  } = useSettings();

  const tabs = [
    { id: 'general', name: 'General', icon: FiSettings },
    { id: 'notifications', name: 'Notifications', icon: FiBell },
    { id: 'privacy', name: 'Privacy', icon: FiUser },
    { id: 'security', name: 'Security', icon: FiShield },
  ];

  // Sri Lanka specific timezone options
  const timezoneOptions = [
    ...SRI_LANKA_TIMEZONES,
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
  ];

  if (!session) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-2xl font-bold text-gray-900 mb-2'
          >
            Please Sign In
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='text-gray-600'
          >
            You need to be signed in to access settings.
          </motion.p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4'
          />
          <p className='text-gray-600'>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-2xl font-bold text-gray-900 mb-2'
          >
            Settings Not Found
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='text-gray-600'
          >
            Unable to load your settings.
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <FiSettings className='h-6 w-6 text-blue-600' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
                <p className='text-gray-600'>
                  Manage your account preferences and privacy settings
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <AnimatePresence>
                {saveStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className='flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg'
                  >
                    <FiCheck className='h-4 w-4' />
                    <span className='text-sm font-medium'>Saved!</span>
                  </motion.div>
                )}
                {saveStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className='flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg'
                  >
                    <FiX className='h-4 w-4' />
                    <span className='text-sm font-medium'>Save failed</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetToDefaults}
                className='flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                <FiRefreshCw className='h-4 w-4' />
                <span>Reset to Defaults</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'
          >
            <div className='flex items-center'>
              <FiX className='h-5 w-5 text-red-400 mr-2' />
              <p className='text-red-800 text-sm'>{error}</p>
            </div>
          </motion.div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className='lg:col-span-1'
          >
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
              <nav className='space-y-1 p-4'>
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className='h-5 w-5' />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='lg:col-span-3 space-y-6'
          >
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-6'>
                  General Settings
                </h2>
                <div className='space-y-6'>
                  {/* Theme */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-3'>
                      Theme
                    </label>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                      {[
                        { value: 'light', icon: FiSun, label: 'Light' },
                        { value: 'dark', icon: FiMoon, label: 'Dark' },
                        { value: 'system', icon: FiMonitor, label: 'System' },
                      ].map(theme => {
                        const Icon = theme.icon;
                        return (
                          <motion.button
                            key={theme.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              updateSettings({ theme: theme.value as any })
                            }
                            className={`flex items-center space-x-3 p-4 border rounded-lg transition-all duration-200 ${
                              settings.theme === theme.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            <Icon className='h-5 w-5' />
                            <span className='font-medium'>{theme.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label
                      htmlFor='language'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Language
                    </label>
                    <select
                      id='language'
                      value={settings.language}
                      onChange={e =>
                        updateSettings({ language: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      {LANGUAGE_OPTIONS.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}{' '}
                          {lang.nativeName !== lang.name
                            ? `(${lang.nativeName})`
                            : ''}
                        </option>
                      ))}
                    </select>
                    <div className='mt-2 grid grid-cols-1 md:grid-cols-3 gap-2'>
                      {LANGUAGE_OPTIONS.filter(lang =>
                        ['en', 'si', 'ta'].includes(lang.code)
                      ).map(lang => (
                        <motion.button
                          key={lang.code}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            updateSettings({ language: lang.code })
                          }
                          className={`flex items-center justify-center p-3 border rounded-lg transition-all duration-200 ${
                            settings.language === lang.code
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <span className='font-medium'>{lang.nativeName}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label
                      htmlFor='timezone'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Timezone
                    </label>
                    <div className='flex items-center space-x-2 mb-2'>
                      <FiMapPin className='h-4 w-4 text-gray-400' />
                      <span className='text-sm text-gray-600'>
                        Sri Lanka Timezones
                      </span>
                    </div>
                    <select
                      id='timezone'
                      value={settings.timezone}
                      onChange={e =>
                        updateSettings({ timezone: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <optgroup label='Sri Lanka & Region'>
                        {SRI_LANKA_TIMEZONES.map(tz => (
                          <option key={tz} value={tz}>
                            {tz} {tz === 'Asia/Colombo' ? '(Sri Lanka)' : ''}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label='Other Regions'>
                        {timezoneOptions
                          .filter(tz => !SRI_LANKA_TIMEZONES.includes(tz))
                          .map(tz => (
                            <option key={tz} value={tz}>
                              {tz}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Date & Time Format */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='dateFormat'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Date Format
                      </label>
                      <select
                        id='dateFormat'
                        value={settings.dateFormat}
                        onChange={e =>
                          updateSettings({ dateFormat: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      >
                        {DATE_FORMATS.map(format => (
                          <option key={format.value} value={format.value}>
                            {format.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor='timeFormat'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Time Format
                      </label>
                      <select
                        id='timeFormat'
                        value={settings.timeFormat}
                        onChange={e =>
                          updateSettings({ timeFormat: e.target.value as any })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      >
                        <option value='12h'>12-hour (1:30 PM)</option>
                        <option value='24h'>24-hour (13:30)</option>
                      </select>
                    </div>
                  </div>

                  {/* Current Settings Preview */}
                  <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                    <h3 className='text-sm font-medium text-gray-900 mb-2'>
                      Preview
                    </h3>
                    <div className='text-sm text-gray-600 space-y-1'>
                      <div>
                        Language:{' '}
                        {
                          LANGUAGE_OPTIONS.find(
                            lang => lang.code === settings.language
                          )?.nativeName
                        }
                      </div>
                      <div>Timezone: {settings.timezone}</div>
                      <div>
                        Date:{' '}
                        {new Date().toLocaleDateString(
                          settings.language === 'si'
                            ? 'si-LK'
                            : settings.language === 'ta'
                              ? 'ta-LK'
                              : 'en-US'
                        )}
                      </div>
                      <div>
                        Time:{' '}
                        {new Date().toLocaleTimeString(
                          settings.language === 'si'
                            ? 'si-LK'
                            : settings.language === 'ta'
                              ? 'ta-LK'
                              : 'en-US',
                          {
                            hour12: settings.timeFormat === '12h',
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs remain the same as previous implementation */}
            {activeTab === 'notifications' && (
              <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-6'>
                  Notification Preferences
                </h2>
                <div className='space-y-6'>
                  {/* Notification Channels */}
                  <div>
                    <h3 className='text-sm font-medium text-gray-900 mb-3'>
                      Notification Channels
                    </h3>
                    <div className='space-y-3'>
                      {[
                        {
                          key: 'email',
                          icon: FiMail,
                          label: 'Email Notifications',
                        },
                        {
                          key: 'push',
                          icon: FiSmartphone,
                          label: 'Push Notifications',
                        },
                        {
                          key: 'sms',
                          icon: FiMessageSquare,
                          label: 'SMS Notifications',
                        },
                      ].map(channel => (
                        <div
                          key={channel.key}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center space-x-3'>
                            <channel.icon className='h-5 w-5 text-gray-400' />
                            <span className='text-sm text-gray-700'>
                              {channel.label}
                            </span>
                          </div>
                          <label className='relative inline-flex items-center cursor-pointer'>
                            <input
                              type='checkbox'
                              checked={
                                settings.notifications[
                                  channel.key as keyof typeof settings.notifications
                                ] as boolean
                              }
                              onChange={e =>
                                updateNotificationPreferences({
                                  [channel.key]: e.target.checked,
                                })
                              }
                              className='sr-only peer'
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div>
                    <h3 className='text-sm font-medium text-gray-900 mb-3'>
                      Notification Types
                    </h3>
                    <div className='space-y-3'>
                      {[
                        {
                          key: 'appointmentReminders',
                          icon: FiCalendar,
                          label: 'Appointment Reminders',
                        },
                        {
                          key: 'prescriptionUpdates',
                          icon: FiFileText,
                          label: 'Prescription Updates',
                        },
                        {
                          key: 'labResults',
                          icon: FiDroplet,
                          label: 'Lab Results',
                        },
                        {
                          key: 'billingAlerts',
                          icon: FiCreditCard,
                          label: 'Billing Alerts',
                        },
                        {
                          key: 'marketingEmails',
                          icon: FiMail,
                          label: 'Marketing Emails',
                        },
                        {
                          key: 'newsletter',
                          icon: FiBarChart2,
                          label: 'Newsletter',
                        },
                      ].map(type => (
                        <div
                          key={type.key}
                          className='flex items-center justify-between'
                        >
                          <div className='flex items-center space-x-3'>
                            <type.icon className='h-5 w-5 text-gray-400' />
                            <span className='text-sm text-gray-700'>
                              {type.label}
                            </span>
                          </div>
                          <label className='relative inline-flex items-center cursor-pointer'>
                            <input
                              type='checkbox'
                              checked={
                                settings.notifications[
                                  type.key as keyof typeof settings.notifications
                                ] as boolean
                              }
                              onChange={e =>
                                updateNotificationPreferences({
                                  [type.key]: e.target.checked,
                                })
                              }
                              className='sr-only peer'
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy and Security tabs would go here */}
            {/* ... (same as previous implementation) ... */}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
