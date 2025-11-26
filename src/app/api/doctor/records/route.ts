// app/api/doctor/records/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import MedicalRecord from '@/models/MedicalRecord';
import { authOptions } from '@/lib/auth';

// Make sure this is exported as GET
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optional: Check if user is a doctor
    if (!session.user.role || session.user.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Forbidden - Doctor access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { doctor: session.user.id };
    if (patientId) query.patient = patientId;

    const records = await MedicalRecord.find(query)
      .populate('patient', 'name email phone dateOfBirth gender')
      .populate('doctor', 'name email specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await MedicalRecord.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// app/api/doctor/records
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.role || session.user.role !== 'DOCTOR') {
      return NextResponse.json(
        { error: 'Forbidden - Doctor access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      patientId,
      diagnosis,
      treatment,
      medications,
      notes,
      vitalSigns,
      followUpDate,
    } = body;

    // Validate required fields
    if (!patientId || !diagnosis) {
      return NextResponse.json(
        { error: 'Patient ID and diagnosis are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new medical record
    const medicalRecord = new MedicalRecord({
      patient: patientId,
      doctor: session.user.id,
      diagnosis,
      treatment: treatment || '',
      medications: medications || [],
      notes: notes || '',
      vitalSigns: vitalSigns || {},
      followUpDate: followUpDate || null,
    });

    await medicalRecord.save();

    // Populate the response
    const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
      .populate('patient', 'name email phone dateOfBirth gender')
      .populate('doctor', 'name email specialization');

    return NextResponse.json(
      {
        success: true,
        message: 'Medical record created successfully',
        data: populatedRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating medical record:', error);

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
