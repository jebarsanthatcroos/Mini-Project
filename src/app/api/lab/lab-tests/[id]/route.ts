// app/api/lab-tests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import LabTest from '@/models/LabTest';

interface Params {
  params: { id: string };
}

// GET specific lab test
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const test = await LabTest.findById(params.id).select('-__v');

    if (!test) {
      return NextResponse.json(
        { error: 'Lab test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ test });
  } catch (error) {
    console.error('Error fetching lab test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH update lab test
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'LABTECH'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Remove fields that shouldn't be updated
    const { _id, createdAt, updatedAt, ...updateData } = body;

    const test = await LabTest.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Lab test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ test });
  } catch (error: any) {
    console.error('Error updating lab test:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Test name already exists in this category' },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation error', details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE lab test (soft delete by setting isActive to false)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'LABTECH'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const test = await LabTest.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!test) {
      return NextResponse.json(
        { error: 'Lab test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Lab test deactivated successfully', test },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deactivating lab test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
