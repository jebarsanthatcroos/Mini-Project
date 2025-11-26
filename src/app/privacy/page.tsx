// app/privacy/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdSecurity,
  MdDataUsage,
  MdCookie,
  MdShare,
  MdDelete,
  MdSettings,
} from 'react-icons/md';
import {
  FaShieldAlt,
  FaUserLock,
  FaDatabase,
  FaEye,
  FaRegHandshake,
} from 'react-icons/fa';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: MdSecurity },
    { id: 'data-collection', title: 'Data Collection', icon: FaDatabase },
    { id: 'data-usage', title: 'Data Usage', icon: MdDataUsage },
    { id: 'data-sharing', title: 'Data Sharing', icon: MdShare },
    { id: 'cookies', title: 'Cookies', icon: MdCookie },
    { id: 'rights', title: 'Your Rights', icon: FaUserLock },
    { id: 'security', title: 'Security', icon: FaShieldAlt },
  ];

  return (
    <>
      <div className='min-h-screen bg-linear-to-br from-gray-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-12'
          >
            <div className='flex justify-center mb-6'>
              <Logo />
            </div>
            <h1 className='text-4xl font-bold bg-linear-to-r from-gray-900 to-green-700 bg-clip-text text-transparent mb-4'>
              Privacy Policy
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Last updated:{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </motion.div>

          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='lg:w-1/4'
            >
              <div className='bg-white rounded-2xl shadow-lg p-6 sticky top-8'>
                <h3 className='font-semibold text-gray-900 mb-4 flex items-center'>
                  <FaEye className='mr-2 text-green-600' />
                  Policy Sections
                </h3>
                <nav className='space-y-2'>
                  {sections.map(section => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center ${
                          activeSection === section.id
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className='mr-3 shrink-0' />
                        <span className='text-sm font-medium'>
                          {section.title}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='lg:w-3/4'
            >
              <div className='bg-white rounded-2xl shadow-lg p-8'>
                {/* Introduction */}
                <section id='introduction' className='mb-12'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                    <MdSecurity className='mr-3 text-green-600' />
                    1. Introduction
                  </h2>
                  <div className='space-y-4 text-gray-700'>
                    <p>
                      At <strong>jebarsanthatcroos</strong>, we are committed to
                      protecting your privacy and ensuring the security of your
                      personal information. This Privacy Policy explains how we
                      collect, use, disclose, and safeguard your information
                      when you use our services.
                    </p>
                    <p>
                      By using our services, you consent to the data practices
                      described in this policy. If you do not agree with the
                      terms, please do not access or use our services.
                    </p>

                    <div className='bg-green-50 border border-green-200 rounded-lg p-4 mt-6'>
                      <h3 className='font-semibold text-green-900 mb-2 flex items-center'>
                        <FaRegHandshake className='mr-2 text-green-600' />
                        Our Commitment
                      </h3>
                      <ul className='text-sm text-green-800 space-y-1'>
                        <li>• We only collect necessary information</li>
                        <li>• We never sell your personal data</li>
                        <li>• You have control over your information</li>
                        <li>• We implement strong security measures</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Data Collection */}
                <section id='data-collection' className='mb-12'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                    <FaDatabase className='mr-3 text-blue-600' />
                    2. Information We Collect
                  </h2>
                  <div className='space-y-6 text-gray-700'>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>
                        Personal Information
                      </h3>
                      <p>We collect information you provide directly to us:</p>
                      <ul className='list-disc list-inside space-y-1 ml-4 mt-2'>
                        <li>Account information (name, email, profile data)</li>
                        <li>
                          Contact information when you communicate with us
                        </li>
                        <li>
                          Payment information (processed securely by our payment
                          providers)
                        </li>
                        <li>
                          Content you create or share through our services
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className='font-semibold text-gray-900 mb-2'>
                        Automatically Collected Information
                      </h3>
                      <p>
                        When you use our services, we automatically collect:
                      </p>
                      <ul className='list-disc list-inside space-y-1 ml-4 mt-2'>
                        <li>
                          Device information (browser type, operating system)
                        </li>
                        <li>
                          Log data (IP address, access times, pages viewed)
                        </li>
                        <li>Usage information and preferences</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Data Usage */}
                <section id='data-usage' className='mb-12'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                    <MdDataUsage className='mr-3 text-purple-600' />
                    3. How We Use Your Information
                  </h2>
                  <div className='space-y-4 text-gray-700'>
                    <p>
                      We use the information we collect for various purposes,
                      including:
                    </p>
                    <ul className='list-disc list-inside space-y-2 ml-4'>
                      <li>
                        Providing, maintaining, and improving our services
                      </li>
                      <li>
                        Processing transactions and sending related information
                      </li>
                      <li>Personalizing your experience and content</li>
                      <li>
                        Sending technical notices, updates, and security alerts
                      </li>
                      <li>Responding to your comments and questions</li>
                      <li>Monitoring and analyzing trends and usage</li>
                      <li>
                        Detecting, preventing, and addressing technical issues
                      </li>
                      <li>Complying with legal obligations</li>
                    </ul>
                  </div>
                </section>

                {/* Data Sharing */}
                <section id='data-sharing' className='mb-12'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                    <MdShare className='mr-3 text-orange-600' />
                    4. Information Sharing & Disclosure
                  </h2>
                  <div className='space-y-4 text-gray-700'>
                    <p>
                      We do not sell your personal information. We may share
                      information in the following circumstances:
                    </p>

                    <h3 className='font-semibold text-gray-900 mt-4'>
                      Service Providers
                    </h3>
                    <p>
                      We may share information with third-party vendors and
                      service providers who perform services on our behalf, such
                      as hosting, analytics, and customer support.
                    </p>

                    <h3 className='font-semibold text-gray-900'>
                      Legal Requirements
                    </h3>
                    <p>
                      We may disclose information if required by law, court
                      order, or governmental authority, or when we believe
                      disclosure is necessary to protect our rights or the
                      safety of others.
                    </p>

                    <h3 className='font-semibold text-gray-900'>
                      Business Transfers
                    </h3>
                    <p>
                      In connection with a merger, acquisition, or sale of
                      assets, your information may be transferred to the new
                      entity, subject to the same privacy protections.
                    </p>
                  </div>
                </section>

                {/* Cookies */}
                <section id='cookies' className='mb-12'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                    <MdCookie className='mr-3 text-yellow-600' />
                    5. Cookies & Tracking Technologies
                  </h2>
                  <div className='space-y-4 text-gray-700'>
                    <p>
                      We use cookies and similar tracking technologies to
                      collect and use personal information about you, including
                      to serve interest-based advertising.
                    </p>

                    <h3 className='font-semibold text-gray-900'>
                      Types of Cookies We Use
                    </h3>
                    <ul className='list-disc list-inside space-y-2 ml-4'>
                      <li>
                        <strong>Essential Cookies:</strong> Required for basic
                        site functionality and security
                      </li>
                      <li>
                        <strong>Performance Cookies:</strong> Help us understand
                        how visitors interact with our website
                      </li>
                      <li>
                        <strong>Functionality Cookies:</strong> Enable enhanced
                        functionality and personalization
                      </li>
                      <li>
                        <strong>Advertising Cookies:</strong> Used to deliver
                        relevant advertisements
                      </li>
                    </ul>

                    <h3 className='font-semibold text-gray-900'>
                      Managing Cookies
                    </h3>
                    <p>
                      Most web browsers are set to accept cookies by default.
                      You can usually choose to set your browser to remove or
                      reject browser cookies. Please note that if you choose to
                      remove or reject cookies, this could affect the
                      availability and functionality of our services.
                    </p>
                  </div>
                </section>

                {/* Your Rights */}
                <section id='rights' className='mb-12'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                    <FaUserLock className='mr-3 text-red-600' />
                    6. Your Privacy Rights
                  </h2>
                  <div className='space-y-4 text-gray-700'>
                    <p>
                      Depending on your location, you may have the following
                      rights regarding your personal information:
                    </p>

                    <div className='grid md:grid-cols-2 gap-4 mt-4'>
                      <div className='bg-gray-50 p-4 rounded-lg'>
                        <h4 className='font-semibold text-gray-900 mb-2 flex items-center'>
                          <MdSettings className='mr-2 text-blue-600' />
                          Access & Correction
                        </h4>
                        <p className='text-sm'>
                          Right to access and update your personal information
                        </p>
                      </div>

                      <div className='bg-gray-50 p-4 rounded-lg'>
                        <h4 className='font-semibold text-gray-900 mb-2 flex items-center'>
                          <MdDelete className='mr-2 text-red-600' />
                          Deletion
                        </h4>
                        <p className='text-sm'>
                          Right to request deletion of your personal data
                        </p>
                      </div>

                      <div className='bg-gray-50 p-4 rounded-lg'>
                        <h4 className='font-semibold text-gray-900 mb-2'>
                          Data Portability
                        </h4>
                        <p className='text-sm'>
                          Right to receive your data in a portable format
                        </p>
                      </div>

                      <div className='bg-gray-50 p-4 rounded-lg'>
                        <h4 className='font-semibold text-gray-900 mb-2'>
                          Objection
                        </h4>
                        <p className='text-sm'>
                          Right to object to certain data processing activities
                        </p>
                      </div>
                    </div>

                    <p className='mt-4'>
                      To exercise these rights, please contact us using the
                      information provided in the &quot;Contact Us&quot; section
                      below.
                    </p>
                  </div>
                </section>

                {/* Security */}
                <section id='security'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center'>
                    <FaShieldAlt className='mr-3 text-gray-600' />
                    7. Data Security
                  </h2>
                  <div className='space-y-4 text-gray-700'>
                    <p>
                      We implement appropriate technical and organizational
                      security measures designed to protect the security of any
                      personal information we process.
                    </p>
                    <p>
                      However, despite our safeguards and efforts to secure your
                      information, no electronic transmission over the Internet
                      or information storage technology can be guaranteed to be
                      100% secure. We cannot promise or guarantee that hackers,
                      cybercriminals, or other unauthorized third parties will
                      not be able to defeat our security.
                    </p>

                    <h3 className='font-semibold text-gray-900'>
                      Data Retention
                    </h3>
                    <p>
                      We retain personal information for as long as necessary to
                      fulfill the purposes outlined in this privacy policy,
                      unless a longer retention period is required or permitted
                      by law.
                    </p>
                  </div>
                </section>

                {/* Contact & Updates */}
                <section className='mt-12 pt-8 border-t border-gray-200'>
                  <div className='bg-gray-50 rounded-lg p-6'>
                    <h3 className='font-semibold text-gray-900 mb-2'>
                      Contact Us
                    </h3>
                    <p className='text-gray-700 mb-4'>
                      If you have any questions about this Privacy Policy or our
                      data practices, please contact us at:
                    </p>
                    <div className='text-sm text-gray-600'>
                      <p>Email: jebarsanthatcroos@gmail.com</p>
                      <p className='mt-1'>
                        We will respond to your request within 30 days.
                      </p>
                    </div>

                    <h3 className='font-semibold text-gray-900 mt-6 mb-2'>
                      Policy Updates
                    </h3>
                    <p className='text-gray-700'>
                      We may update this privacy policy from time to time. The
                      updated version will be indicated by an updated &quot;Last
                      updated&quot; date and the updated version will be
                      effective as soon as it is accessible.
                    </p>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
