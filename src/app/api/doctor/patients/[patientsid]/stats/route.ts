/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Patient from '@/models/Patient';
import { authOptions } from '@/lib/auth';

// GET - Get detailed statistics for a specific patient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    // Validate ID format
    if (id.length !== 24) {
      return NextResponse.json(
        { error: 'Invalid patient ID format' },
        { status: 400 }
      );
    }

    // Get patient data
    const patient = await Patient.findById(id).lean();
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Calculate patient age
    const calculateAge = (dateOfBirth: Date) => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    };

    // Calculate BMI
    const calculateBMI = (height: number, weight: number) => {
      if (!height || !weight || height === 0) return null;
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return Math.round(bmi * 10) / 10;
    };

    // Get BMI category
    const getBMICategory = (bmi: number) => {
      if (bmi < 18.5) return 'Underweight';
      if (bmi < 25) return 'Normal weight';
      if (bmi < 30) return 'Overweight';
      return 'Obese';
    };

    // Get age group
    const getAgeGroup = (age: number) => {
      if (age < 18) return 'Child';
      if (age < 30) return 'Young Adult';
      if (age < 45) return 'Adult';
      if (age < 60) return 'Middle Aged';
      return 'Senior';
    };

    // Calculate health metrics
    const age = calculateAge(patient.dateOfBirth);
    const bmi = calculateBMI(patient.height || 0, patient.weight || 0);
    const bmiCategory = bmi ? getBMICategory(bmi) : 'Unknown';
    const ageGroup = getAgeGroup(age);

    // Get appointment statistics
    let appointmentStats = {
      total: 0,
      completed: 0,
      upcoming: 0,
      cancelled: 0,
      noShow: 0,
      averageDuration: 0,
      mostCommonType: 'N/A',
      lastAppointment: null as string | null,
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Appointment = require('@/models/Appointment').default;

      const appointments = await Appointment.find({ patientId: id }).lean();

      if (appointments.length > 0) {
        const completedAppointments = appointments.filter(
          (apt: any) => apt.status === 'COMPLETED'
        );
        const upcomingAppointments = appointments.filter(
          (apt: any) => apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
        );

        // Calculate appointment type frequency
        const typeCounts: Record<string, number> = {};
        appointments.forEach((apt: any) => {
          typeCounts[apt.type] = (typeCounts[apt.type] || 0) + 1;
        });

        const mostCommonType =
          Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
          'N/A';

        // Get last appointment date
        const sortedAppointments = [...appointments].sort(
          (a: any, b: any) =>
            new Date(b.appointmentDate).getTime() -
            new Date(a.appointmentDate).getTime()
        );

        appointmentStats = {
          total: appointments.length,
          completed: completedAppointments.length,
          upcoming: upcomingAppointments.length,
          cancelled: appointments.filter(
            (apt: any) => apt.status === 'CANCELLED'
          ).length,
          noShow: appointments.filter((apt: any) => apt.status === 'NO_SHOW')
            .length,
          averageDuration:
            appointments.reduce(
              (sum: number, apt: any) => sum + (apt.duration || 0),
              0
            ) / appointments.length,
          mostCommonType,
          lastAppointment: sortedAppointments[0]?.appointmentDate || null,
        };
      }
    } catch (appointmentError) {
      console.error('Error fetching appointment stats:', appointmentError);
      // Continue without appointment data
    }

    // Calculate medical statistics
    const medicalStats = {
      allergiesCount: patient.allergies?.length || 0,
      medicationsCount: patient.medications?.length || 0,
      hasChronicConditions:
        (patient.allergies?.length || 0) > 0 ||
        (patient.medications?.length || 0) > 0,
      bloodTypeKnown: !!patient.bloodType,
      heightWeightRecorded: !!(patient.height && patient.weight),
    };

    // Calculate patient engagement score (0-100)
    const engagementScore = calculateEngagementScore(patient, appointmentStats);

    // Compile comprehensive statistics
    const stats = {
      patient: {
        id: patient._id.toString(),
        name: `${patient.firstName} ${patient.lastName}`,
        age,
        ageGroup,
        gender: patient.gender,
        bloodType: patient.bloodType || 'Unknown',
      },
      healthMetrics: {
        bmi,
        bmiCategory,
        height: patient.height,
        weight: patient.weight,
        bloodType: patient.bloodType,
        lastUpdated: patient.updatedAt,
      },
      medicalProfile: {
        allergies: {
          count: medicalStats.allergiesCount,
          hasAllergies: medicalStats.allergiesCount > 0,
          list: patient.allergies || [],
        },
        medications: {
          count: medicalStats.medicationsCount,
          hasMedications: medicalStats.medicationsCount > 0,
          list: patient.medications || [],
        },
        medicalHistory: patient.medicalHistory ? 'Available' : 'Not recorded',
      },
      appointments: appointmentStats,
      engagement: {
        score: engagementScore,
        level: getEngagementLevel(engagementScore),
        lastActivity: appointmentStats.lastAppointment || patient.updatedAt,
      },
      insurance: {
        hasInsurance: !!(
          patient.insurance?.provider && patient.insurance?.policyNumber
        ),
        provider: patient.insurance?.provider || 'Not specified',
      },
      emergencyContact: {
        hasContact: !!(
          patient.emergencyContact?.name && patient.emergencyContact?.phone
        ),
        relationship: patient.emergencyContact?.relationship || 'Not specified',
      },
      summary: {
        overallHealth: assessOverallHealth(patient, bmi, medicalStats),
        riskFactors: identifyRiskFactors(patient, bmi, medicalStats),
        recommendations: generateRecommendations(
          patient,
          bmi,
          medicalStats,
          appointmentStats
        ),
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Error fetching patient statistics:', error);

    // Handle CastError (invalid ID format)
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid patient ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch patient statistics',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateEngagementScore(patient: any, appointmentStats: any): number {
  let score = 0;

  // Base score for having basic info
  if (patient.firstName && patient.lastName && patient.email && patient.phone) {
    score += 25;
  }

  // Medical information completeness
  if (patient.bloodType) score += 10;
  if (patient.height && patient.weight) score += 15;
  if (patient.allergies?.length > 0) score += 10;
  if (patient.medications?.length > 0) score += 10;
  if (patient.medicalHistory) score += 10;
  if (patient.emergencyContact?.name && patient.emergencyContact?.phone)
    score += 10;
  if (patient.insurance?.provider && patient.insurance?.policyNumber)
    score += 10;

  // Appointment engagement (max 30 points)
  const appointmentEngagement = Math.min(
    (appointmentStats.completed / Math.max(appointmentStats.total, 1)) * 30,
    30
  );
  score += appointmentEngagement;

  return Math.min(Math.round(score), 100);
}

function getEngagementLevel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Very Poor';
}

function assessOverallHealth(
  patient: any,
  bmi: number | null,
  medicalStats: any
): string {
  const riskFactors = identifyRiskFactors(patient, bmi, medicalStats);

  if (riskFactors.length === 0) return 'Excellent';
  if (riskFactors.length <= 2) return 'Good';
  if (riskFactors.length <= 4) return 'Fair';
  return 'Needs Attention';
}

function identifyRiskFactors(
  patient: any,
  bmi: number | null,
  medicalStats: any
): string[] {
  const riskFactors: string[] = [];

  // BMI-related risks
  if (bmi && bmi < 18.5) riskFactors.push('Underweight');
  if (bmi && bmi >= 30) riskFactors.push('Obesity risk');

  // Age-related risks
  const age = calculateAge(patient.dateOfBirth);
  if (age >= 60) riskFactors.push('Senior health risks');

  // Medical data risks
  if (medicalStats.allergiesCount > 3) riskFactors.push('Multiple allergies');
  if (medicalStats.medicationsCount > 5)
    riskFactors.push('Multiple medications');
  if (!medicalStats.heightWeightRecorded) riskFactors.push('Missing vitals');
  if (!patient.bloodType) riskFactors.push('Blood type unknown');

  return riskFactors;
}

function generateRecommendations(
  patient: any,
  bmi: number | null,
  medicalStats: any,
  appointmentStats: any
): string[] {
  const recommendations: string[] = [];

  // Basic information recommendations
  if (!patient.bloodType) {
    recommendations.push(
      'Consider recording blood type for emergency preparedness'
    );
  }

  if (!medicalStats.heightWeightRecorded) {
    recommendations.push(
      'Record height and weight for better health assessment'
    );
  }

  if (!patient.emergencyContact?.name || !patient.emergencyContact?.phone) {
    recommendations.push('Add emergency contact information');
  }

  // Health recommendations
  if (bmi && bmi < 18.5) {
    recommendations.push(
      'Consider nutritional consultation for healthy weight gain'
    );
  }

  if (bmi && bmi >= 30) {
    recommendations.push(
      'Discuss weight management strategies during next visit'
    );
  }

  // Engagement recommendations
  if (appointmentStats.total === 0) {
    recommendations.push('Schedule initial consultation appointment');
  } else if (appointmentStats.completed === 0) {
    recommendations.push('Follow up on scheduled appointments');
  }

  // Medical data recommendations
  if (medicalStats.allergiesCount === 0) {
    recommendations.push('Review and document any known allergies');
  }

  if (medicalStats.medicationsCount === 0 && patient.medicalHistory) {
    recommendations.push('Document current medications for comprehensive care');
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
}

// Helper function to calculate age (duplicated for scope)
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
