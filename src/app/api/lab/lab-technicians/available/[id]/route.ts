import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import LabTechnician from '@/models/LabTechnician';

interface Params {
  params: { id: string };
}

// GET available technicians for a specific test/specialization
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeWorkload = searchParams.get('includeWorkload') === 'true';
    const maxWorkload = searchParams.get('maxWorkload')
      ? parseInt(searchParams.get('maxWorkload')!)
      : undefined;

    let specialization: string | undefined;

    try {
      const LabTest = (await import('@/models/LabTest')).default;
      const test = await LabTest.findById(params.id);
      if (test && test.category) {
        specialization = test.category;
      } else {
        // If test not found or has no category, treat the ID as a specialization
        specialization = params.id.toUpperCase();
      }
    } catch (error) {
      // If there's any error, treat the ID as a specialization
      specialization = params.id.toUpperCase();
    }

    // Build query with proper type handling
    const query: any = {
      isAvailable: true,
    };

    // Add specialization filter if available and valid
    if (specialization && specialization.trim() !== '') {
      // Validate against known specializations
      const validSpecializations = [
        'HEMATOLOGY',
        'BIOCHEMISTRY',
        'MICROBIOLOGY',
        'IMMUNOLOGY',
        'PATHOLOGY',
        'URINALYSIS',
        'ENDOCRINOLOGY',
        'TOXICOLOGY',
        'MOLECULAR_DIAGNOSTICS',
        'GENERAL',
      ];

      if (validSpecializations.includes(specialization)) {
        query.specialization = specialization;
      }
    }

    // Add workload conditions - using aggregation pipeline for computed fields
    const techniciansQuery = LabTechnician.aggregate([
      { $match: query },
      {
        $addFields: {
          availableSlots: {
            $subtract: ['$maxConcurrentTests', '$currentWorkload'],
          },
          canAcceptMore: {
            $and: [
              { $eq: ['$isAvailable', true] },
              { $lt: ['$currentWorkload', '$maxConcurrentTests'] },
            ],
          },
        },
      },
      { $match: { canAcceptMore: true } },
      { $sort: { currentWorkload: 1, performanceScore: -1 } },
    ]);

    const technicians = await techniciansQuery;

    // Populate user data for each technician
    const populatedTechnicians = await LabTechnician.populate(technicians, {
      path: 'user',
      select: 'name email phone profileImage',
    });

    // Filter fields based on includeWorkload flag
    const filteredTechnicians = includeWorkload
      ? populatedTechnicians
      : populatedTechnicians.map((tech: any) => {
          const { currentWorkload, maxConcurrentTests, ...rest } = tech;
          return rest;
        });

    return NextResponse.json({
      technicians: filteredTechnicians,
      specialization: specialization || 'GENERAL',
      totalAvailable: filteredTechnicians.length,
    });
  } catch (error) {
    console.error('Error fetching available technicians:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST assign technician to a test (update workload)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !['LAB_MANAGER', 'DOCTOR', 'ADMIN'].includes(session.user.role || '')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { technicianId, action = 'assign' } = body;

    if (!technicianId || typeof technicianId !== 'string') {
      return NextResponse.json(
        { error: 'Valid technician ID is required' },
        { status: 400 }
      );
    }

    const technician = await LabTechnician.findById(technicianId);

    if (!technician) {
      return NextResponse.json(
        { error: 'Lab technician not found' },
        { status: 404 }
      );
    }

    let updatedTechnician;

    if (action === 'assign') {
      if (!technician.canAcceptMoreTests()) {
        return NextResponse.json(
          { error: 'Technician cannot accept more tests at this time' },
          { status: 400 }
        );
      }
      updatedTechnician = await technician.assignTest();
    } else if (action === 'complete') {
      updatedTechnician = await technician.completeTest();
    } else if (action === 'update') {
      updatedTechnician = await technician.updateWorkload();
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "assign", "complete", or "update"' },
        { status: 400 }
      );
    }

    await updatedTechnician.populate('user', 'name email phone profileImage');

    return NextResponse.json({
      technician: updatedTechnician,
      action,
      message: `Test ${action}ed successfully`,
    });
  } catch (error: any) {
    console.error('Error updating technician workload:', error);

    if (error.message.includes('cannot accept more tests')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
