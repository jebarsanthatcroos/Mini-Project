import {
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi';

interface StatsCardsProps {
  stats: {
    totalPatients: number;
    appointmentsToday: number;
    monthlyEarnings: number;
    averageRating: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients.toLocaleString(),
      icon: FiUsers,
      color: 'blue',
      change: '+12%',
      trending: 'up' as const,
    },
    {
      title: "Today's Appointments",
      value: stats.appointmentsToday.toString(),
      icon: FiCalendar,
      color: 'green',
      change: '+2',
      trending: 'up' as const,
    },
    {
      title: 'Monthly Earnings',
      value: `$${stats.monthlyEarnings.toLocaleString()}`,
      icon: FiDollarSign,
      color: 'purple',
      change: '+18%',
      trending: 'up' as const,
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: FiStar,
      color: 'yellow',
      change: '+0.2',
      trending: 'up' as const,
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      icon: 'text-purple-600',
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      icon: 'text-yellow-600',
    },
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {cards.map(card => {
        const Icon = card.icon;
        const TrendingIcon =
          card.trending === 'up' ? FiTrendingUp : FiTrendingDown;

        return (
          <div
            key={card.title}
            className='bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow'
          >
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-600 mb-1'>
                  {card.title}
                </p>
                <p className='text-2xl font-bold text-gray-900 mb-2'>
                  {card.value}
                </p>
                <div
                  className={`flex items-center text-xs font-medium ${colorClasses[card.color as keyof typeof colorClasses].text}`}
                >
                  <TrendingIcon className='h-3 w-3 mr-1' />
                  {card.change} from last month
                </div>
              </div>
              <div
                className={`p-3 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses].bg}`}
              >
                <Icon className='h-6 w-6' />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
