import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiInfo, FiClock, FiDroplet } from 'react-icons/fi';
import { TestSelectionProps, LabTest } from '@/types/lab';

type LocalTestSelectionProps = Omit<TestSelectionProps, 'onTestSelect'> & {
  onTestSelect: (test: LabTest | null) => void;
};

const TestSelection: React.FC<LocalTestSelectionProps> = ({
  availableTests,
  selectedTest,
  onTestSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const categories = [
    'ALL',
    ...Array.from(new Set(availableTests.map(test => test.category))),
  ];

  const filteredTests = availableTests.filter(test => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTestSelect = (test: LabTest) => {
    onTestSelect(test);
  };

  const clearSelection = () => {
    onTestSelect(null);
  };

  const getSampleTypeIcon = (sampleType: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const icons: { [key: string]: React.ComponentType<any> } = {
      BLOOD: FiDroplet,
      URINE: FiDroplet,
      STOOL: FiDroplet,
      SALIVA: FiDroplet,
      TISSUE: FiDroplet,
      SWAB: FiDroplet,
      CSF: FiDroplet,
      SPUTUM: FiDroplet,
    };
    return icons[sampleType] || FiDroplet;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-4'>
        Test Selection
      </h2>

      {selectedTest ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='bg-green-50 border border-green-200 rounded-lg p-4'
        >
          <div className='flex justify-between items-start'>
            <div className='flex-1'>
              <h3 className='font-semibold text-gray-900 text-lg'>
                {selectedTest.name}
              </h3>

              <div className='mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600'>
                <div>
                  <span className='font-medium'>Category:</span>
                  <span className='ml-2'>{selectedTest.category}</span>
                </div>
                <div className='flex items-center'>
                  <FiClock className='w-4 h-4 mr-1' />
                  <span>{selectedTest.duration} minutes</span>
                </div>
                <div>
                  <span className='font-medium'>Sample Type:</span>
                  <span className='ml-2 capitalize'>
                    {selectedTest.sampleType.toLowerCase()}
                  </span>
                </div>
                <div>
                  <span className='font-medium'>Price:</span>
                  <span className='ml-2'>${selectedTest.price}</span>
                </div>
              </div>

              {selectedTest.description && (
                <p className='mt-2 text-sm text-gray-600'>
                  {selectedTest.description}
                </p>
              )}
            </div>

            <button
              onClick={clearSelection}
              className='text-gray-400 hover:text-gray-600 transition-colors ml-4'
            >
              <FiX className='w-5 h-5' />
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Search */}
          <div className='space-y-4 mb-4'>
            <div className='relative'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <input
                type='text'
                placeholder='Search tests by name or description...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Categories */}
            <div className='flex flex-wrap gap-2'>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Tests List */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto'>
            {filteredTests.map(test => {
              const SampleIcon = getSampleTypeIcon(test.sampleType);
              return (
                <motion.div
                  key={test._id}
                  layout
                  onClick={() => handleTestSelect(test)}
                  className='border rounded-lg p-4 cursor-pointer transition-all border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900'>
                        {test.name}
                      </h3>

                      <div className='flex items-center mt-1 text-sm text-gray-600'>
                        <SampleIcon className='w-4 h-4 mr-1' />
                        <span className='capitalize'>
                          {test.sampleType.toLowerCase()}
                        </span>
                        <span className='mx-2'>•</span>
                        <FiClock className='w-4 h-4 mr-1' />
                        <span>{test.duration}m</span>
                      </div>

                      <div className='flex justify-between items-center mt-2'>
                        <span className='text-sm text-gray-500'>
                          {test.category}
                        </span>
                        <span className='font-semibold text-green-600'>
                          ${test.price}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setShowDetails(
                          showDetails === test._id ? null : test._id
                        );
                      }}
                      className='ml-2 text-gray-400 hover:text-gray-600 transition-colors'
                    >
                      <FiInfo className='w-4 h-4' />
                    </button>
                  </div>

                  {/* Details */}
                  <AnimatePresence>
                    {showDetails === test._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='mt-3 pt-3 border-t border-gray-200'
                      >
                        {test.description && (
                          <p className='text-sm text-gray-600 mb-2'>
                            {test.description}
                          </p>
                        )}

                        {test.preparationInstructions && (
                          <div className='text-sm'>
                            <span className='font-medium'>Preparation:</span>
                            <p className='text-gray-600 mt-1'>
                              {test.preparationInstructions}
                            </p>
                          </div>
                        )}

                        {test.normalRange && (
                          <div className='text-sm mt-2'>
                            <span className='font-medium'>Normal Range:</span>
                            <p className='text-gray-600'>{test.normalRange}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {filteredTests.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              No tests found matching your criteria.
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default TestSelection;
