/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from "@/lib/mongodb";
import Patient from '@/models/Patient';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');

    const query: any = { isActive: true };

    if (search) {
      query.$or = [
        { 'userId.firstName': { $regex: search, $options: 'i' } },
        { 'userId.lastName': { $regex: search, $options: 'i' } },
        { medicalRecordNumber: { $regex: search, $options: 'i' } },
        { 'userId.email': { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query)
      .populate('userId', 'firstName lastName email phone dateOfBirth gender')
      .limit(limit)
      .sort({ 'userId.firstName': 1, 'userId.lastName': 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        patients: patients.map(patient => ({
          id: patient._id.toString(),
          userId: patient.userId,
          medicalRecordNumber: patient.medicalRecordNumber,
          allergies: patient.allergies || [],
          chronicConditions: patient.chronicConditions || []
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}