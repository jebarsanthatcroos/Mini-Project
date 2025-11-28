export const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const getGenderText = (gender: string): string => {
  switch (gender) {
    case 'MALE':
      return 'Male';
    case 'FEMALE':
      return 'Female';
    case 'OTHER':
      return 'Other';
    default:
      return gender;
  }
};
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (timeString: string): string => {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const getAppointmentStatusColor = (status: string): string => {
  switch (status) {
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800';
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'COMPLETED':
      return 'bg-purple-100 text-purple-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getAppointmentStatusText = (status: string): string => {
  return status
    .toLowerCase()
    .replace('_', ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};
