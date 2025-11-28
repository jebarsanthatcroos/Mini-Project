'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import ErrorComponent from '@/components/Error';
import {
  LabSample,
  SamplesResponse,
  SampleStatus,
  SamplePriority,
} from '@/types/lab';
import SamplesHeader from '@/components/lab/samples/SamplesHeader';
import SamplesFilter from '@/components/lab/samples/SamplesFilter';
import SamplesTable from '@/components/lab/samples/SamplesTable';
import SamplesStats from '@/components/lab/samples/SamplesStats';
import EmptySamplesState from '@/components/lab/samples/EmptySamplesState';

// Define filter types
type StatusFilter = SampleStatus | 'ALL';
type PriorityFilter = SamplePriority | 'ALL';
type DateFilter = 'ALL' | 'TODAY' | 'THIS_WEEK';

export default function LabSamplesPage() {
  const router = useRouter();
  const [samples, setSamples] = useState<LabSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/lab/samples');

      if (!response.ok) {
        throw new Error('Failed to fetch samples');
      }

      const result: SamplesResponse = await response.json();

      if (result.success && result.samples) {
        setSamples(result.samples);
      } else {
        throw new Error(result.message || 'Failed to fetch samples');
      }
    } catch (error) {
      console.error('Error fetching samples:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load samples'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSamples();
  };

  const handleCreateSample = () => {
    router.push('/lab/samples/create');
  };

  const handleViewSample = (sampleId: string) => {
    router.push(`/lab/samples/${sampleId}`);
  };

  const handleEditSample = (sampleId: string) => {
    router.push(`/lab/samples/${sampleId}/edit`);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    dateFilter !== 'ALL';

  // Filter samples based on current filters
  const filteredSamples = samples.filter(sample => {
    const matchesSearch =
      sample.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.sampleId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || sample.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'ALL' || sample.priority === priorityFilter;

    const matchesDate =
      dateFilter === 'ALL' ||
      (dateFilter === 'TODAY' && isToday(new Date(sample.collectedDate))) ||
      (dateFilter === 'THIS_WEEK' &&
        isThisWeek(new Date(sample.collectedDate)));

    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setDateFilter('ALL');
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <ErrorComponent message={error} onRetry={fetchSamples} />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <SamplesHeader
          samplesCount={filteredSamples.length}
          onCreateSample={handleCreateSample}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <SamplesStats samples={samples} />

        <SamplesFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
        />

        {filteredSamples.length > 0 ? (
          <SamplesTable
            samples={filteredSamples}
            onViewSample={handleViewSample}
            onEditSample={handleEditSample}
            refreshing={refreshing}
          />
        ) : (
          <EmptySamplesState
            hasSamples={samples.length > 0}
            searchTerm={searchTerm}
            onClearFilters={clearFilters}
            onCreateSample={handleCreateSample}
            filtersActive={hasActiveFilters}
          />
        )}
      </div>
    </div>
  );
}

// Utility functions
function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isThisWeek(date: Date): boolean {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
}
