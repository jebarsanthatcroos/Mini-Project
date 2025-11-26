import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiSearch, FiX, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import { PatientSelectionProps, Patient } from '../types';

const PatientSelection: React.FC<PatientSelectionProps> = ({
  selectedPatient,
  onPatientSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchPatients();
    } else {
      setFilteredPatients([]);
    }
  }, [searchTerm]);

  const searchPatients = async () => {
    setLoading(true);
    try {
      // In a real app, you would call your patients API
      // For now, we'll simulate a search
      const response = await fetch(`/api/patients/search?q=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
        setFilteredPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const clearSelection = () => {
    onPatientSelect(null as any);
    setSearchTerm('');
  };

  const formatPatientInfo = (patient: Patient) => {
    return `${patient.name} • ${patient.email}${patient.medicalRecordNumber ? ` • MRN: ${patient.medicalRecordNumber}` : ''}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
        <FiUser className="w-5 h-5 mr-2 text-blue-600" />
        Patient Information
      </h2>

      {selectedPatient ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {selectedPatient.name}
              </h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <FiMail className="w-4 h-4 mr-2" />
                  {selectedPatient.email}
                </div>
                {selectedPatient.phone && (
                  <div className="flex items-center">
                    <FiPhone className="w-4 h-4 mr-2" />
                    {selectedPatient.phone}
                  </div>
                )}
                {selectedPatient.dateOfBirth && (
                  <div className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
                {selectedPatient.medicalRecordNumber && (
                  <div className="flex items-center">
                    <FiUser className="w-4 h-4 mr-2" />
                    MRN: {selectedPatient.medicalRecordNumber}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="relative">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search patients by name, email, or MRN..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <AnimatePresence>
            {showDropdown && (filteredPatients.length > 0 || loading) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Searching patients...
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient._id}
                      type="button"
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {patient.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatPatientInfo(patient)}
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {!selectedPatient && (
        <p className="text-sm text-gray-500 mt-3">
          Start typing to search for patients. Minimum 3 characters required.
        </p>
      )}
    </motion.div>
  );
};

export default PatientSelection;