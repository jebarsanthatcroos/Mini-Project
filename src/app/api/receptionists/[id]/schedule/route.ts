import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Receptionist from '@/models/Receptionist';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import { IWorkSchedule } from '@/types/Receptionist';

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
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = (await request.json()) as {
      workSchedule: Partial<IWorkSchedule>;
    };

    const receptionist = await Receptionist.findById(params.id);

    if (!receptionist) {
      return NextResponse.json(
        { success: false, error: 'Receptionist not found' },
        { status: 404 }
      );
    }

    const currentSchedule = receptionist.workSchedule as IWorkSchedule;
    const updateSchedule = body.workSchedule;

    if (!updateSchedule) {
      return NextResponse.json(
        { success: false, error: 'No schedule data provided' },
        { status: 400 }
      );
    }

    // Valid day names
    const allowedDays: (keyof IWorkSchedule)[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    // Update only the provided valid days
    for (const day of allowedDays) {
      const updateForDay = updateSchedule[day];
      if (updateForDay) {
        currentSchedule[day] = {
          ...currentSchedule[day],
          ...updateForDay,
        };
      }
    }

    receptionist.workSchedule = currentSchedule;

    await receptionist.save();

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully',
      data: receptionist.workSchedule,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
