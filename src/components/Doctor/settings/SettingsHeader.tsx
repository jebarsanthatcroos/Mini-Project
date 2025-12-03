import React from 'react';

interface SettingsHeaderProps {
  title: string;
  subtitle: string;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className='px-6 py-4 border-b border-gray-200'>
      <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
      <p className='mt-1 text-sm text-gray-600'>{subtitle}</p>
    </div>
  );
};

export default SettingsHeader;
