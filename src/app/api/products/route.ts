/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import Pharmacy from '@/models/Pharmacy';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

// POST - Create a new product
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Unauthorized access',
        error: 'You must be logged in to create a product'
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    await connectDB();

    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'User not found',
        error: 'Unable to verify user account'
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if user has permission to create product
    if (!['ADMIN', 'PHARMACIST'].includes(user.role)) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Insufficient permissions',
        error: 'Only admins and pharmacists can create products'
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      costPrice,
      category,
      image,
      inStock,
      stockQuantity,
      minStockLevel,
      pharmacy,
      sku,
      manufacturer,
      requiresPrescription,
      isControlledSubstance,
      sideEffects,
      dosage,
      activeIngredients,
      barcode
    } = body;

    // Validate required fields
    if (!name || !description || !price || !category || !image || !pharmacy) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Missing required fields',
        error: 'Name, description, price, category, image, and pharmacy are required'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate price
    if (price <= 0) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Invalid price',
        error: 'Price must be greater than 0'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate stock quantity
    if (stockQuantity < 0) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Invalid stock quantity',
        error: 'Stock quantity cannot be negative'
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    // Check if product with same name and pharmacy already exists
        // Resolve pharmacy input to a valid ObjectId: accept 24-char id or lookup by slug/name
        let pharmacyId: any = pharmacy;
        if (!/^[0-9a-fA-F]{24}$/.test(String(pharmacy))) {
          const foundPharmacy = await Pharmacy.findOne({
            $or: [{ slug: pharmacy }, { name: pharmacy }]
          });
          if (!foundPharmacy) {
            const errorResponse: ApiResponse<null> = {
              success: false,
              message: 'Invalid pharmacy',
              error: 'Provided pharmacy does not exist'
            };
            return NextResponse.json(errorResponse, { status: 400 });
          }
          pharmacyId = foundPharmacy._id;
        }
    
        const existingProduct = await Product.findOne({
          name: name.trim(),
          pharmacy: pharmacyId
        });
    
        if (existingProduct) {
          const errorResponse: ApiResponse<null> = {
            success: false,
            message: 'Product already exists',
            error: 'A product with this name already exists in this pharmacy'
          };
          return NextResponse.json(errorResponse, { status: 409 });
        }
    
    // Create new product
            const newProduct = new Product({
              name: name.trim(),
              description: description.trim(),
              price: parseFloat(price),
              costPrice: costPrice ? parseFloat(costPrice) : 0,
              category: category.trim(),
              image: image.trim(),
              inStock: inStock !== undefined ? inStock : true,
              stockQuantity: parseInt(stockQuantity) || 0,
              minStockLevel: parseInt(minStockLevel) || 10,
              pharmacy: pharmacyId,
              sku: sku?.trim() || `SKU-${Date.now()}`,
              manufacturer: manufacturer?.trim(),
              requiresPrescription: requiresPrescription || false,
              isControlledSubstance: isControlledSubstance || false,
              sideEffects: sideEffects?.trim(),
              dosage: dosage?.trim(),
              activeIngredients: activeIngredients?.trim(),
              barcode: barcode?.trim() || `BC${Date.now()}`,
              createdBy: user._id
            });
    
        await newProduct.save();

    // Populate the createdBy field for response
    await newProduct.populate('createdBy', 'name email role');
    await newProduct.populate('pharmacy', 'name');

    const response: ApiResponse<typeof newProduct> = {
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Product SKU already exists',
        error: 'A product with this SKU already exists'
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET - Fetch products with filtering
export async function GET(request: NextRequest): Promise<Response> {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const pharmacy = searchParams.get('pharmacy') || '';
    const inStock = searchParams.get('inStock');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (pharmacy) {
      query.pharmacy = pharmacy;
    }

    if (inStock !== null) {
      query.inStock = inStock === 'true';
    }

    // Execute query with population
    const products = await Product.find(query)
      .populate('createdBy', 'name email role')
      .populate('pharmacy', 'name address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    const response: ApiResponse<{
      products: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }> = {
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Products fetched successfully'
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching products:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}