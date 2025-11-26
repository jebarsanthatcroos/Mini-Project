'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function LabTestsPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('ALL');
  const [isActive, setIsActive] = useState('ALL');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1,
  });

  const { register, handleSubmit, reset } = useForm();

  // Fetch tests
  const fetchTests = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
    });

    if (category !== 'ALL') params.set('category', category);
    if (isActive !== 'ALL') params.set('isActive', isActive);

    const res = await fetch(`/api/lab/tests?${params.toString()}`);
    const data = await res.json();

    setTests(data.tests || []);
    setPagination(data.pagination);
    setLoading(false);
  };

  useEffect(() => {
    fetchTests();
  }, [page, category, isActive]);

  // Create test
  const onSubmit = async (formData: any) => {
    try {
      const res = await fetch('/api/lab/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Test created successfully!');
        reset();
        fetchTests();
      } else {
        alert(data.error || data.details?.[0] || 'Error creating test');
      }
    } catch (error) {
      alert('Error creating test');
      console.error('Submission error:', error);
    }
  };

  return (
    <div className='p-6 space-y-6'>
      {/* Title */}
      <h1 className='text-2xl font-semibold'>Lab Tests</h1>

      {/* Filters */}
      <div className='flex items-center gap-4'>
        <select
          className='border p-2 rounded'
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value='ALL'>All Categories</option>
          <option value='HEMATOLOGY'>Hematology</option>
          <option value='BIOCHEMISTRY'>Biochemistry</option>
          <option value='MICROBIOLOGY'>Microbiology</option>
          <option value='IMMUNOLOGY'>Immunology</option>
          <option value='PATHOLOGY'>Pathology</option>
          <option value='URINALYSIS'>Urinalysis</option>
          <option value='ENDOCRINOLOGY'>Endocrinology</option>
          <option value='TOXICOLOGY'>Toxicology</option>
          <option value='MOLECULAR_DIAGNOSTICS'>Molecular Diagnostics</option>
          <option value='OTHER'>Other</option>
        </select>

        <select
          className='border p-2 rounded'
          value={isActive}
          onChange={e => setIsActive(e.target.value)}
        >
          <option value='ALL'>All</option>
          <option value='true'>Active</option>
          <option value='false'>Inactive</option>
        </select>
      </div>

      {/* Add Test Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='border p-4 rounded grid grid-cols-2 gap-4 bg-gray-50'
      >
        <input
          {...register('name')}
          placeholder='Test Name'
          className='border p-2 rounded'
          required
        />

        <select
          {...register('category')}
          className='border p-2 rounded'
          required
        >
          <option value=''>Select Category</option>
          <option value='HEMATOLOGY'>Hematology</option>
          <option value='BIOCHEMISTRY'>Biochemistry</option>
          <option value='MICROBIOLOGY'>Microbiology</option>
          <option value='IMMUNOLOGY'>Immunology</option>
          <option value='PATHOLOGY'>Pathology</option>
          <option value='URINALYSIS'>Urinalysis</option>
          <option value='ENDOCRINOLOGY'>Endocrinology</option>
          <option value='TOXICOLOGY'>Toxicology</option>
          <option value='MOLECULAR_DIAGNOSTICS'>Molecular Diagnostics</option>
          <option value='OTHER'>Other</option>
        </select>

        <input
          {...register('price')}
          type='number'
          step='0.01'
          min='0'
          placeholder='Price'
          className='border p-2 rounded'
          required
        />

        <input
          {...register('duration')}
          type='number'
          min='1'
          placeholder='Duration (mins)'
          className='border p-2 rounded'
          required
        />

        <select
          {...register('sampleType')}
          className='border p-2 rounded'
          required
        >
          <option value=''>Select Sample Type</option>
          <option value='BLOOD'>Blood</option>
          <option value='URINE'>Urine</option>
          <option value='STOOL'>Stool</option>
          <option value='SALIVA'>Saliva</option>
          <option value='TISSUE'>Tissue</option>
          <option value='SWAB'>Swab</option>
          <option value='CSF'>CSF</option>
          <option value='SPUTUM'>Sputum</option>
          <option value='OTHER'>Other</option>
        </select>

        <div className='col-span-2'>
          <textarea
            {...register('description')}
            placeholder='Description (optional)'
            className='border p-2 rounded w-full'
            rows={2}
          />
        </div>

        <div className='col-span-2'>
          <textarea
            {...register('preparationInstructions')}
            placeholder='Preparation Instructions (optional)'
            className='border p-2 rounded w-full'
            rows={2}
          />
        </div>

        <input
          {...register('normalRange')}
          placeholder='Normal Range (optional)'
          className='border p-2 rounded'
        />

        <input
          {...register('units')}
          placeholder='Units (optional)'
          className='border p-2 rounded'
        />

        <div className='col-span-2 flex items-center gap-2'>
          <input
            {...register('isActive')}
            type='checkbox'
            defaultChecked
            className='w-4 h-4'
          />
          <label>Active Test</label>
        </div>

        <button
          type='submit'
          className='bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors col-span-2'
        >
          Add Test
        </button>
      </form>

      {/* Table */}
      <div className='border rounded'>
        {loading ? (
          <div className='p-4 text-center'>Loading...</div>
        ) : (
          <table className='w-full border-collapse'>
            <thead className='bg-gray-200'>
              <tr>
                <th className='border p-2'>Name</th>
                <th className='border p-2'>Category</th>
                <th className='border p-2'>Price</th>
                <th className='border p-2'>Duration</th>
                <th className='border p-2'>Sample</th>
                <th className='border p-2'>Status</th>
              </tr>
            </thead>

            <tbody>
              {tests.map((test: any) => (
                <tr key={test._id}>
                  <td className='border p-2'>{test.name}</td>
                  <td className='border p-2'>{test.category}</td>
                  <td className='border p-2'>${test.price}</td>
                  <td className='border p-2'>{test.duration} min</td>
                  <td className='border p-2'>{test.sampleType}</td>
                  <td className='border p-2'>
                    {test.isActive ? (
                      <span className='text-green-600'>Active</span>
                    ) : (
                      <span className='text-red-600'>Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className='flex justify-center items-center gap-4'>
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className='px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50'
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.pages}
        </span>
        <button
          disabled={page === pagination.pages}
          onClick={() => setPage(p => p + 1)}
          className='px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50'
        >
          Next
        </button>
      </div>
    </div>
  );
}
