import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Pharmacy from '@/models/Pharmacy';
import { Types } from 'mongoose';

export async function POST(): Promise<Response> {
  try {
    await connectDB();

    // Check if there are already pharmacies
    const pharmacyCount = await Pharmacy.countDocuments();

    if (pharmacyCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already has ${pharmacyCount} pharmacies. No seeding needed.`,
      });
    }

    // Sample pharmacies
    const samplePharmacies = [
      {
        name: 'Colombo Central Pharmacy',
        address: {
          street: '123 Galle Road',
          city: 'Colombo',
          state: 'Western Province',
          zipCode: '00100',
          country: 'Sri Lanka',
        },
        contact: {
          phone: '+94 11 234 5678',
          email: 'info@colombopharmacy.lk',
          emergencyPhone: '+94 77 123 4567',
        },
        operatingHours: {
          Monday: '8:00 AM - 8:00 PM',
          Tuesday: '8:00 AM - 8:00 PM',
          Wednesday: '8:00 AM - 8:00 PM',
          Thursday: '8:00 AM - 8:00 PM',
          Friday: '8:00 AM - 8:00 PM',
          Saturday: '9:00 AM - 5:00 PM',
          Sunday: '10:00 AM - 4:00 PM',
        },
        services: [
          'Prescription Dispensing',
          'OTC Medications',
          'Vaccinations',
          'Health Check-ups',
          'Medication Delivery',
        ],
        pharmacists: [
          {
            name: 'Dr. Samantha Perera',
            licenseNumber: 'PH123456',
          },
        ],
        inventory: {
          totalProducts: 1500,
          lowStockItems: 12,
          outOfStockItems: 3,
        },
        status: 'ACTIVE',
        is24Hours: false,
        description: '24-hour pharmacy serving Colombo city',
        website: 'https://colombopharmacy.lk',
        createdBy: new Types.ObjectId(), // Mock user ID
      },
      {
        name: 'Kandy City Pharmacy',
        address: {
          street: '456 Dalada Veediya',
          city: 'Kandy',
          state: 'Central Province',
          zipCode: '20000',
          country: 'Sri Lanka',
        },
        contact: {
          phone: '+94 81 456 7890',
          email: 'contact@kandypharmacy.lk',
          emergencyPhone: '+94 77 987 6543',
        },
        operatingHours: {
          Monday: '7:00 AM - 10:00 PM',
          Tuesday: '7:00 AM - 10:00 PM',
          Wednesday: '7:00 AM - 10:00 PM',
          Thursday: '7:00 AM - 10:00 PM',
          Friday: '7:00 AM - 10:00 PM',
          Saturday: '8:00 AM - 8:00 PM',
          Sunday: '8:00 AM - 6:00 PM',
        },
        services: [
          'Prescription Dispensing',
          'OTC Medications',
          'Compounding',
          'Diabetes Care',
          'Baby Care Products',
        ],
        pharmacists: [
          {
            name: 'Dr. Anura Silva',
            licenseNumber: 'PH789012',
          },
        ],
        inventory: {
          totalProducts: 1200,
          lowStockItems: 8,
          outOfStockItems: 2,
        },
        status: 'ACTIVE',
        is24Hours: true,
        description: '24/7 pharmacy in Kandy city center',
        website: 'https://kandypharmacy.lk',
        createdBy: new Types.ObjectId(), // Mock user ID
      },
      {
        name: 'Galle Fort Pharmacy',
        address: {
          street: '789 Lighthouse Street',
          city: 'Galle',
          state: 'Southern Province',
          zipCode: '80000',
          country: 'Sri Lanka',
        },
        contact: {
          phone: '+94 91 345 6789',
          email: 'service@gallepharmacy.lk',
          emergencyPhone: '+94 77 345 6789',
        },
        operatingHours: {
          Monday: '9:00 AM - 7:00 PM',
          Tuesday: '9:00 AM - 7:00 PM',
          Wednesday: '9:00 AM - 7:00 PM',
          Thursday: '9:00 AM - 7:00 PM',
          Friday: '9:00 AM - 7:00 PM',
          Saturday: '9:00 AM - 5:00 PM',
          Sunday: 'Closed',
        },
        services: [
          'Prescription Dispensing',
          'Travel Vaccinations',
          'First Aid Supplies',
          'Medical Devices',
          'Natural Remedies',
        ],
        pharmacists: [
          {
            name: 'Dr. Nimal Fernando',
            licenseNumber: 'PH456789',
          },
        ],
        inventory: {
          totalProducts: 800,
          lowStockItems: 15,
          outOfStockItems: 5,
        },
        status: 'ACTIVE',
        is24Hours: false,
        description:
          'Historic pharmacy in Galle Fort serving tourists and locals',
        website: 'https://gallepharmacy.lk',
        createdBy: new Types.ObjectId(), // Mock user ID
      },
    ];

    // Insert sample pharmacies
    await Pharmacy.insertMany(samplePharmacies);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${samplePharmacies.length} pharmacies`,
      data: {
        count: samplePharmacies.length,
      },
    });
  } catch (error) {
    console.error('Error seeding pharmacies:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to seed pharmacies',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET - Check seed status
export async function GET(): Promise<Response> {
  try {
    await connectDB();
    const count = await Pharmacy.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Database has ${count} pharmacies`,
      data: { count },
    });
  } catch (error) {
    console.error('Error checking pharmacy count:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check pharmacy count',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
