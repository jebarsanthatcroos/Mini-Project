/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Receptionist from '@/models/Receptionist';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';

// GET - Fetch all receptionists with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const shift = searchParams.get('shift');
    const department = searchParams.get('department');
    const employmentStatus = searchParams.get('employmentStatus');
    const employmentType = searchParams.get('employmentType');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    // Build filter query
    const filter: any = {};

    if (shift) filter.shift = shift;
    if (department) filter.department = department;
    if (employmentStatus) filter.employmentStatus = employmentStatus;
    if (employmentType) filter.employmentType = employmentType;

    // Search by employee ID or name (requires population)
    let receptionists;
    const skip = (page - 1) * limit;

    if (search) {
      // Search in employeeId or populated user fields
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = users.map(u => u._id);

      filter.$or = [
        { employeeId: { $regex: search, $options: 'i' } },
        { user: { $in: userIds } },
      ];
    }

    // Get total count for pagination
    const total = await Receptionist.countDocuments(filter);

    // Fetch receptionists with pagination
    // eslint-disable-next-line prefer-const
    receptionists = await Receptionist.find(filter)
      .populate('user', 'name email phone image')
      .populate('assignedDoctor', 'name specialization')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: receptionists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching receptionists:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new receptionist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to create receptionists
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate required fields
    if (!body.user || !body.employeeId || !body.employmentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await User.findById(body.user);
    if (!userExists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if receptionist already exists for this user
    const existingReceptionist = await Receptionist.findOne({
      user: body.user,
    });
    if (existingReceptionist) {
      return NextResponse.json(
        {
          success: false,
          error: 'Receptionist profile already exists for this user',
        },
        { status: 400 }
      );
    }

    // Check if employee ID is unique
    const existingEmployeeId = await Receptionist.findOne({
      employeeId: body.employeeId,
    });
    if (existingEmployeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID already exists' },
        { status: 400 }
      );
    }

    // Create receptionist
    const receptionist = await Receptionist.create({
      ...body,
      lastModifiedBy: session.user.id,
    });

    // Populate user data
    await receptionist.populate('user', 'name email phone image');

    return NextResponse.json(
      {
        success: true,
        data: receptionist,
        message: 'Receptionist created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating receptionist:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
