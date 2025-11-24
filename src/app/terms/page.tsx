// app/terms/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  MdDescription, 
  MdGavel, 
  MdAccountCircle,
  MdWarning,
  MdCheckCircle
} from "react-icons/md";
import { 
  FaUserShield, 
  FaFileContract,
  FaBalanceScale
} from "react-icons/fa";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction", icon: MdDescription },
    { id: "accounts", title: "User Accounts", icon: MdAccountCircle },
    { id: "content", title: "Content & Conduct", icon: MdGavel },
    { id: "privacy", title: "Privacy & Data", icon: FaUserShield },
    { id: "termination", title: "Termination", icon: MdWarning },
    { id: "liability", title: "Liability", icon: FaBalanceScale },
  ];

  return (
    <><div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        
          <div className="max-w-6xl mx-auto">
              {/* Header */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-12"
              >
                  <div className="flex justify-center mb-6">
                      <Logo />
                  </div>
                  <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent mb-4">
                      Terms of Service
                  </h1>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Last updated: {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                      })}
                  </p>
              </motion.div>

              <div className="flex flex-col lg:flex-row gap-8">
                  {/* Sidebar Navigation */}
                  <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="lg:w-1/4"
                  >
                      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <FaFileContract className="mr-2 text-blue-600" />
                              Table of Contents
                          </h3>
                          <nav className="space-y-2">
                              {sections.map((section) => {
                                  const Icon = section.icon;
                                  return (
                                      <button
                                          key={section.id}
                                          onClick={() => setActiveSection(section.id)}
                                          className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center ${activeSection === section.id
                                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                  : "text-gray-600 hover:bg-gray-50"}`}
                                      >
                                          <Icon className="mr-3 shrink-0" />
                                          <span className="text-sm font-medium">{section.title}</span>
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
                      className="lg:w-3/4"
                  >
                      <div className="bg-white rounded-2xl shadow-lg p-8">
                          {/* Introduction */}
                          <section id="introduction" className="mb-12">
                              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                  <MdDescription className="mr-3 text-blue-600" />
                                  1. Introduction
                              </h2>
                              <div className="space-y-4 text-gray-700">
                                  <p>
                                      Welcome to <strong>jebarsanthatcroos</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
                                      These Terms of Service govern your use of our website, applications, and services.
                                  </p>
                                  <p>
                                      By accessing or using our services, you agree to be bound by these Terms and our
                                      Privacy Policy. If you disagree with any part of these terms, you may not access our services.
                                  </p>

                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                      <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                                          <MdCheckCircle className="mr-2 text-blue-600" />
                                          Key Points
                                      </h3>
                                      <ul className="text-sm text-blue-800 space-y-1">
                                          <li>• You must be at least 13 years old to use our services</li>
                                          <li>• You are responsible for maintaining account security</li>
                                          <li>• We may update these terms with notice</li>
                                          <li>• You retain rights to your content</li>
                                      </ul>
                                  </div>
                              </div>
                          </section>

                          {/* User Accounts */}
                          <section id="accounts" className="mb-12">
                              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                  <MdAccountCircle className="mr-3 text-green-600" />
                                  2. User Accounts
                              </h2>
                              <div className="space-y-4 text-gray-700">
                                  <h3 className="font-semibold text-gray-900">Account Creation</h3>
                                  <p>
                                      To access certain features, you must create an account. You agree to provide
                                      accurate and complete information during registration and keep it updated.
                                  </p>

                                  <h3 className="font-semibold text-gray-900">Account Security</h3>
                                  <p>
                                      You are responsible for maintaining the confidentiality of your account credentials
                                      and for all activities that occur under your account. Notify us immediately of any
                                      unauthorized use or security breaches.
                                  </p>

                                  <h3 className="font-semibold text-gray-900">Age Requirements</h3>
                                  <p>
                                      You must be at least 13 years old to use our services. If you are under 18, you
                                      represent that you have your parent or guardian&apos;s permission to use our services.
                                  </p>
                              </div>
                          </section>

                          {/* Content & Conduct */}
                          <section id="content" className="mb-12">
                              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                  <MdGavel className="mr-3 text-red-600" />
                                  3. Content & Conduct
                              </h2>
                              <div className="space-y-4 text-gray-700">
                                  <h3 className="font-semibold text-gray-900">User Content</h3>
                                  <p>
                                      You retain ownership of any content you create or share through our services.
                                      By posting content, you grant us a worldwide, non-exclusive license to use,
                                      display, and distribute your content in connection with our services.
                                  </p>

                                  <h3 className="font-semibold text-gray-900">Prohibited Activities</h3>
                                  <p>You agree not to:</p>
                                  <ul className="list-disc list-inside space-y-2 ml-4">
                                      <li>Violate any laws or regulations</li>
                                      <li>Infringe upon intellectual property rights</li>
                                      <li>Harass, abuse, or harm others</li>
                                      <li>Distribute malware or malicious code</li>
                                      <li>Attempt to gain unauthorized access to our systems</li>
                                      <li>Use our services for any illegal or unauthorized purpose</li>
                                  </ul>
                              </div>
                          </section>

                          {/* Privacy & Data */}
                          <section id="privacy" className="mb-12">
                              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                  <FaUserShield className="mr-3 text-purple-600" />
                                  4. Privacy & Data
                              </h2>
                              <div className="space-y-4 text-gray-700">
                                  <p>
                                      Your privacy is important to us. Our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> explains
                                      how we collect, use, and protect your personal information.
                                  </p>
                                  <p>
                                      We implement reasonable security measures to protect your data, but cannot
                                      guarantee absolute security. You are responsible for taking precautions to
                                      protect your personal information.
                                  </p>
                              </div>
                          </section>

                          {/* Termination */}
                          <section id="termination" className="mb-12">
                              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                  <MdWarning className="mr-3 text-orange-600" />
                                  5. Termination
                              </h2>
                              <div className="space-y-4 text-gray-700">
                                  <p>
                                      We may suspend or terminate your account and access to our services at our
                                      sole discretion, without notice, for conduct that we believe violates these
                                      Terms or is harmful to other users, us, or third parties.
                                  </p>
                                  <p>
                                      You may terminate your account at any time by contacting us or using the
                                      account deletion features in your settings.
                                  </p>
                              </div>
                          </section>

                          {/* Liability */}
                          <section id="liability">
                              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                                  <FaBalanceScale className="mr-3 text-gray-600" />
                                  6. Liability & Disclaimer
                              </h2>
                              <div className="space-y-4 text-gray-700">
                                  <h3 className="font-semibold text-gray-900">Service &quot;As Is&quot;</h3>
                                  <p>
                                      Our services are provided &quot;as is&quot; without warranties of any kind, either express
                                      or implied. We do not guarantee that our services will be uninterrupted or error-free.
                                  </p>

                                  <h3 className="font-semibold text-gray-900">Limitation of Liability</h3>
                                  <p>
                                      To the fullest extent permitted by law, we shall not be liable for any indirect,
                                      incidental, special, consequential, or punitive damages resulting from your use
                                      or inability to use our services.
                                  </p>

                                  <h3 className="font-semibold text-gray-900">Indemnification</h3>
                                  <p>
                                      You agree to indemnify and hold harmless jebarsanthatcroos and its affiliates from
                                      any claims, damages, or expenses arising from your use of our services or violation
                                      of these Terms.
                                  </p>
                              </div>
                          </section>

                          {/* Contact & Updates */}
                          <section className="mt-12 pt-8 border-t border-gray-200">
                              <div className="bg-gray-50 rounded-lg p-6">
                                  <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                                  <p className="text-gray-700 mb-4">
                                      For questions about these Terms of Service, please contact us at:
                                  </p>
                                  <div className="text-sm text-gray-600">
                                      <p>Email: jebarsanthatcroos@gmail.com</p>
                                      <p className="mt-1">We typically respond within 2-3 business days.</p>
                                  </div>

                                  <h3 className="font-semibold text-gray-900 mt-6 mb-2">Updates to Terms</h3>
                                  <p className="text-gray-700">
                                      We may update these Terms from time to time. We will notify you of significant
                                      changes by posting the new Terms on our website and updating the &quot;Last updated&quot; date.
                                  </p>
                              </div>
                          </section>
                      </div>
                  </motion.div>
              </div>
          </div>
      </div><Footer /></>
  );
}