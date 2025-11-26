// app/api/doctor/records/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import MedicalRecord, { IMedicalRecord } from '@/models/MedicalRecord';
import { authOptions } from '@/lib/auth';

// GET specific medical record by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await connectDB();

    const recordId = params.id;

    const medicalRecord = await MedicalRecord.findById(recordId)
      .populate('patient', 'name email phone dateOfBirth gender')
      .populate('doctor', 'name email specialization')
      .lean();

    if (!medicalRecord) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      );
    }

    // Verify the doctor owns this record
    if (medicalRecord.doctorId._id.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied to this medical record' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: medicalRecord,
    });
  } catch (error) {
    console.error('Error fetching medical record:', error);

    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid medical record ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE specific medical record by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const recordId = params.id;
    const body = await request.json();
    const {
      diagnosis,
      treatment,
      medications,
      notes,
      vitalSigns,
      followUpDate,
    } = body;

    await connectDB();

    // Check if record exists and doctor owns it
    const existingRecord = await MedicalRecord.findOne({
      _id: recordId,
      doctor: session.user.id,
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Medical record not found or access denied' },
        { status: 404 }
      );
    }

    const existingData: IMedicalRecord = existingRecord.toObject();

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      recordId,
      {
        diagnosis: diagnosis || existingData.diagnosis,
        treatment: treatment !== undefined ? treatment : existingData.treatment,
        medications: medications || existingData.medications,
        notes: notes !== undefined ? notes : existingData.notes,
        vitalSigns: vitalSigns || existingData.vitalSigns,
        followUpDate:
          followUpDate !== undefined ? followUpDate : existingData.followUpDate,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('patient', 'name email phone dateOfBirth gender')
      .populate('doctor', 'name email specialization');

    return NextResponse.json({
      success: true,
      message: 'Medical record updated successfully',
      data: updatedRecord,
    });
  } catch (error) {
    console.error('Error updating medical record:', error);

    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid medical record ID' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE specific medical record by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await connectDB();

    const recordId = params.id;

    // Check if record exists and doctor owns it
    const existingRecord = await MedicalRecord.findOne({
      _id: recordId,
      doctor: session.user.id,
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Medical record not found or access denied' },
        { status: 404 }
      );
    }

    await MedicalRecord.findByIdAndDelete(recordId);

    return NextResponse.json({
      success: true,
      message: 'Medical record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting medical record:', error);

    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid medical record ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
