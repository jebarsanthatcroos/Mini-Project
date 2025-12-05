import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Receptionist from '@/models/Receptionist';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import mongoose from 'mongoose';
import { IReceptionist } from '@/types/Receptionist';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    const receptionist = await Receptionist.findById(params.id);

    if (!receptionist) {
      return NextResponse.json(
        { success: false, error: 'Receptionist not found' },
        { status: 404 }
      );
    }

    /**
     * Type-safe list of fields allowed to update
     */
    type Allowed = keyof Omit<
      IReceptionist,
      '_id' | 'user' | 'createdAt' | 'updatedAt'
    >;

    const allowedFields: Allowed[] = [
      'shift',
      'workSchedule',
      'department',
      'assignedDoctor',
      'maxAppointmentsPerDay',
      'skills',
      'languages',
      'emergencyContact',
      'employmentStatus',
      'employmentType',
      'terminationDate',
      'salary',
      'performanceMetrics',
      'permissions',
      'trainingRecords',
      'notes',
      'lastModifiedBy',
    ];

    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key as Allowed)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (receptionist as any)[key] = body[key];
      }
    }

    /**
     * Always update lastModifiedBy with a valid ObjectId
     */
    if (session.user.id) {
      receptionist.lastModifiedBy = new mongoose.Types.ObjectId(
        session.user.id
      );
    }

    await receptionist.save();

    await receptionist.populate('user', 'name email phone image');
    await receptionist.populate('assignedDoctor', 'name specialization');

    return NextResponse.json({
      success: true,
      data: receptionist,
      message: 'Receptionist updated successfully',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error updating receptionist:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
