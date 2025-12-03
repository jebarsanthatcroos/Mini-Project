import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { validateProfileData } from '@/validation/profile';

// GET /api/profile/[id] - Get user profile
export async function GET(
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

    // Users can only access their own profile
    if (session.user.id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await connectDB();

    const user = await User.findById(params.id).select('-password -__v');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        phone: user.phone,
        department: user.department,
        specialization: user.specialization,
        address: user.address,
        bio: user.bio,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profile/[id] - Update user profile
export async function PUT(
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

    // Users can only update their own profile
    if (session.user.id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();

    await connectDB();

    // Get current user to validate against role
    const currentUser = await User.findById(params.id);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate the data
    const validation = validateProfileData(body, currentUser.role);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errors[0]?.message || 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Prepare update data (exclude email as it shouldn't be changed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      name: validation.data.name,
      phone: validation.data.phone || null,
      department: validation.data.department || null,
      specialization: validation.data.specialization || null,
      address: validation.data.address || null,
      bio: validation.data.bio || null,
      updatedAt: new Date(),
    };

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        phone: updatedUser.phone,
        department: updatedUser.department,
        specialization: updatedUser.specialization,
        address: updatedUser.address,
        bio: updatedUser.bio,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);

    // Handle MongoDB validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
