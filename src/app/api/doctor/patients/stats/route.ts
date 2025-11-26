/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { authOptions } from '@/lib/auth';

// GET - Get simplified patient statistics
export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active patients
    const patients = await Patient.find({ isActive: true }).lean();

    // Calculate statistics
    const total = patients.length;

    // Gender counts
    const male = patients.filter(p => p.gender === 'MALE').length;
    const female = patients.filter(p => p.gender === 'FEMALE').length;
    const other = patients.filter(p => p.gender === 'OTHER').length;

    // Age calculations
    const now = new Date();
    const adults = patients.filter(p => {
      const birthDate = new Date(p.dateOfBirth);
      const age = now.getFullYear() - birthDate.getFullYear();
      return age >= 18;
    }).length;

    const children = patients.filter(p => {
      const birthDate = new Date(p.dateOfBirth);
      const age = now.getFullYear() - birthDate.getFullYear();
      return age < 18;
    }).length;

    // Recent patients (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recent = patients.filter(
      p => new Date(p.createdAt) >= thirtyDaysAgo
    ).length;

    // Patients with medical data
    const withAllergies = patients.filter(
      p => p.allergies && p.allergies.length > 0
    ).length;

    const withMedications = patients.filter(
      p => p.medications && p.medications.length > 0
    ).length;

    const stats = {
      total,
      recent,
      male,
      female,
      other,
      adults,
      children,
      withAllergies,
      withMedications,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching patient statistics:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch patient statistics',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
