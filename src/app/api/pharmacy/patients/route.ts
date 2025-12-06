/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper function to validate phone number
const isValidPhone = (phone: string): boolean => {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

// Helper function to validate NIC
const isValidNIC = (nic: string): boolean => {
  // Check for old NIC format (9 digits + V/X) or new NIC format (12 digits)
  const oldNicRegex = /^[0-9]{9}[VXvx]$/;
  const newNicRegex = /^[0-9]{12}$/;
  return oldNicRegex.test(nic) || newNicRegex.test(nic);
};

export async function POST(request: NextRequest) {
  try {
    console.log('Starting patient creation...');

    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email);

    if (!session || !session.user) {
      console.log('No session found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();
    console.log('Database connected');

    // Get user
    const user = await User.findOne({ email: session.user.email });
    console.log('Found user:', user?.email, 'Role:', user?.role);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const allowedRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('Request body received');

    const {
      firstName,
      lastName,
      email,
      phone,
      nic,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      medicalHistory,
      allergies,
      medications,
      insurance,
      bloodType,
      height,
      weight,
      isActive,
      maritalStatus,
      occupation,
      preferredLanguage,
      lastVisit,
    } = body;

    // Debug logging
    console.log('Required fields:', {
      firstName: !!firstName,
      lastName: !!lastName,
      phone: !!phone,
      gender: !!gender,
      dateOfBirth: !!dateOfBirth,
      nic: !!nic,
    });

    // Required fields validation
    const missingFields = [];
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!phone) missingFields.push('phone');
    if (!gender) missingFields.push('gender');
    if (!dateOfBirth) missingFields.push('dateOfBirth');
    if (!nic) missingFields.push('nic');

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Validate field formats
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    if (!isValidNIC(nic)) {
      return NextResponse.json(
        { success: false, message: 'Invalid NIC format' },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Validate date of birth
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date of birth' },
        { status: 400 }
      );
    }

    // Validate height and weight if provided
    if (height && (isNaN(height) || height < 0 || height > 300)) {
      return NextResponse.json(
        { success: false, message: 'Invalid height value' },
        { status: 400 }
      );
    }

    if (weight && (isNaN(weight) || weight < 0 || weight > 300)) {
      return NextResponse.json(
        { success: false, message: 'Invalid weight value' },
        { status: 400 }
      );
    }

    // Check for existing patients
    console.log('Checking for existing patients...');
    const existingByNIC = await Patient.findOne({ nic });
    if (existingByNIC) {
      console.log('Patient with NIC already exists:', nic);
      return NextResponse.json(
        {
          success: false,
          message: 'Patient with this NIC already exists',
          field: 'NIC',
        },
        { status: 409 }
      );
    }

    if (email) {
      const existingByEmail = await Patient.findOne({ email });
      if (existingByEmail) {
        console.log('Patient with email already exists:', email);
        return NextResponse.json(
          {
            success: false,
            message: 'Patient with this email already exists',
            field: 'Email',
          },
          { status: 409 }
        );
      }
    }

    // Prepare patient data with proper types
    const patientData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email?.trim() || undefined,
      phone: phone.trim(),
      nic: nic.trim(),
      dateOfBirth: dob,
      gender,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: user._id,
    };

    // Add optional fields if they exist
    if (address && (address.street || address.city || address.country)) {
      patientData.address = {
        street: address.street?.trim(),
        city: address.city?.trim(),
        state: address.state?.trim(),
        zipCode: address.zipCode?.trim(),
        country: address.country?.trim(),
      };
    }

    if (emergencyContact && emergencyContact.name) {
      patientData.emergencyContact = {
        name: emergencyContact.name?.trim(),
        phone: emergencyContact.phone?.trim(),
        relationship: emergencyContact.relationship?.trim(),
        email: emergencyContact.email?.trim(),
      };
    }

    if (insurance && insurance.provider) {
      patientData.insurance = {
        provider: insurance.provider?.trim(),
        policyNumber: insurance.policyNumber?.trim(),
        groupNumber: insurance.groupNumber?.trim(),
        validUntil: insurance.validUntil
          ? new Date(insurance.validUntil)
          : undefined,
      };
    }

    // Medical fields
    patientData.medicalHistory = medicalHistory?.trim() || '';
    patientData.allergies = Array.isArray(allergies)
      ? allergies.map((a: string) => a.trim()).filter(Boolean)
      : [];
    patientData.medications = Array.isArray(medications)
      ? medications.map((m: string) => m.trim()).filter(Boolean)
      : [];

    if (bloodType) patientData.bloodType = bloodType;
    if (height) patientData.height = Number(height);
    if (weight) patientData.weight = Number(weight);
    if (maritalStatus) patientData.maritalStatus = maritalStatus;
    if (occupation) patientData.occupation = occupation.trim();
    if (preferredLanguage)
      patientData.preferredLanguage = preferredLanguage.trim();
    if (lastVisit) {
      const lastVisitDate = new Date(lastVisit);
      if (!isNaN(lastVisitDate.getTime())) {
        patientData.lastVisit = lastVisitDate;
      }
    }

    console.log(
      'Creating patient with data:',
      JSON.stringify(patientData, null, 2)
    );

    // Create patient
    const patient = await Patient.create(patientData);
    console.log('Patient created successfully:', patient._id);

    return NextResponse.json(
      {
        success: true,
        patient: {
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          nic: patient.nic,
          email: patient.email,
          phone: patient.phone,
          gender: patient.gender,
          dateOfBirth: patient.dateOfBirth,
          isActive: patient.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating patient:', error);

    // Log the full error for debugging
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      stack: error.stack,
    });

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      console.log(`Duplicate key error: ${field} = ${value}`);

      return NextResponse.json(
        {
          success: false,
          message: `Patient with this ${field} already exists`,
          field: field.charAt(0).toUpperCase() + field.slice(1),
          value,
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {};
      Object.keys(error.errors).forEach(key => {
        validationErrors[key] = error.errors[key].message;
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Handle cast errors (e.g., invalid ObjectId)
    if (error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid ${error.kind}: ${error.value}`,
        },
        { status: 400 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// GET /api/patients - Get all patients with filtering, pagination, and search
export async function GET(request: NextRequest) {
  try {
    console.log('=== Starting Patient Fetch ===');

    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('Session user:', session?.user?.email);

    if (!session || !session.user) {
      console.log('No session found');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();
    console.log('Database connected');

    // Get user
    const user = await User.findOne({ email: session.user.email });
    console.log('Found user:', user?.email, 'Role:', user?.role);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view patients
    const allowedRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filter parameters
    const search = searchParams.get('search') || '';
    const gender = searchParams.get('gender');
    const bloodType = searchParams.get('bloodType');
    const maritalStatus = searchParams.get('maritalStatus');
    const isActive = searchParams.get('isActive');
    const createdBy = searchParams.get('createdBy');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Date range filters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const dobStart = searchParams.get('dobStart');
    const dobEnd = searchParams.get('dobEnd');

    console.log('Query parameters:', {
      page,
      limit,
      search,
      gender,
      bloodType,
      maritalStatus,
      isActive,
      createdBy,
      sortBy,
      sortOrder,
      startDate,
      endDate,
      dobStart,
      dobEnd,
    });

    // Build query
    const query: any = {};

    // Search across multiple fields
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { nic: { $regex: search, $options: 'i' } },
        { occupation: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'emergencyContact.name': { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by gender
    if (gender && gender !== 'ALL') {
      query.gender = gender;
    }

    // Filter by blood type
    if (bloodType && bloodType !== 'ALL') {
      query.bloodType = bloodType;
    }

    // Filter by marital status
    if (maritalStatus && maritalStatus !== 'ALL') {
      query.maritalStatus = maritalStatus;
    }

    // Filter by active status
    if (isActive !== null && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Filter by creator
    if (createdBy) {
      query.createdBy = createdBy;
    } else if (user.role === 'DOCTOR') {
      // Doctors can only see their own patients
      query.createdBy = user._id;
    }

    // Date range filter for creation date
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Date range filter for date of birth
    if (dobStart || dobEnd) {
      query.dateOfBirth = {};
      if (dobStart) {
        query.dateOfBirth.$gte = new Date(dobStart);
      }
      if (dobEnd) {
        query.dateOfBirth.$lte = new Date(dobEnd);
      }
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    // Define sort order
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate('createdBy', 'firstName lastName email role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Patient.countDocuments(query),
    ]);

    console.log(`Found ${patients.length} patients out of ${total} total`);

    // Calculate age for each patient
    const patientsWithAge = patients.map(patient => {
      let age = null;
      if (patient.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(patient.dateOfBirth);
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
      }

      return {
        ...patient,
        age,
        // Format dates for display
        dateOfBirthFormatted: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
          : null,
        createdAtFormatted: patient.createdAt
          ? new Date(patient.createdAt).toISOString()
          : null,
        lastVisitFormatted: patient.lastVisit
          ? new Date(patient.lastVisit).toISOString()
          : null,
      };
    });

    // Optional: Apply age group filtering in memory if needed
    const ageGroup = searchParams.get('ageGroup');
    let filteredPatients = patientsWithAge;
    let filteredTotal = total;

    if (ageGroup && ageGroup !== 'ALL') {
      filteredPatients = patientsWithAge.filter(patient => {
        if (!patient.age) return false;

        switch (ageGroup) {
          case 'INFANT':
            return patient.age < 1;
          case 'CHILD':
            return patient.age >= 1 && patient.age < 13;
          case 'TEEN':
            return patient.age >= 13 && patient.age < 20;
          case 'ADULT':
            return patient.age >= 20 && patient.age < 60;
          case 'SENIOR':
            return patient.age >= 60;
          default:
            return true;
        }
      });
      filteredTotal = filteredPatients.length;
    }

    // Calculate pagination info
    const pages = Math.ceil(filteredTotal / limit);
    const hasNextPage = page < pages;
    const hasPrevPage = page > 1;

    // Get statistics for the current query
    const stats = await Patient.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
          maleCount: {
            $sum: { $cond: [{ $eq: ['$gender', 'MALE'] }, 1, 0] },
          },
          femaleCount: {
            $sum: { $cond: [{ $eq: ['$gender', 'FEMALE'] }, 1, 0] },
          },
          otherGenderCount: {
            $sum: { $cond: [{ $eq: ['$gender', 'OTHER'] }, 1, 0] },
          },
        },
      },
    ]);

    const statistics = stats[0] || {
      totalCount: 0,
      activeCount: 0,
      maleCount: 0,
      femaleCount: 0,
      otherGenderCount: 0,
    };

    // Get blood type distribution
    const bloodTypeStats = await Patient.aggregate([
      { $match: query },
      { $group: { _id: '$bloodType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: filteredPatients,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        pages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
      filters: {
        search,
        gender,
        bloodType,
        maritalStatus,
        isActive,
        ageGroup,
        startDate,
        endDate,
        dobStart,
        dobEnd,
        sortBy,
        sortOrder,
      },
      statistics: {
        total: statistics.totalCount,
        active: statistics.activeCount,
        genders: {
          male: statistics.maleCount,
          female: statistics.femaleCount,
          other: statistics.otherGenderCount,
        },
        bloodTypes: bloodTypeStats.reduce(
          (acc, curr) => {
            acc[curr._id || 'Unknown'] = curr.count;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      metadata: {
        requestId: Date.now(),
        timestamp: new Date().toISOString(),
        userRole: user.role,
        queryTime: Date.now(), // Add query execution time
      },
    });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    console.error('Error stack:', error.stack);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch patients',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
