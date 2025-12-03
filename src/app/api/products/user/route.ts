/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

// Helper function to serialize product data for public users
const serializeProductForUser = (product: any) => {
  const productObj = product.toObject ? product.toObject() : product;

  return {
    _id: productObj._id?.toString(), // Keep _id for compatibility
    id: productObj._id?.toString(),
    name: productObj.name || 'Unnamed Product',
    description: productObj.description || '',
    price: productObj.price || 0,
    category: productObj.category || 'Uncategorized',
    image: productObj.image || '/placeholder-medicine.jpg',
    inStock: productObj.inStock !== undefined ? productObj.inStock : false,
    stockQuantity: productObj.stockQuantity || 0,
    manufacturer: productObj.manufacturer || 'Unknown',
    requiresPrescription: productObj.requiresPrescription || false,
    sku: productObj.sku || 'N/A',
    pharmacy: productObj.pharmacy
      ? {
          id: productObj.pharmacy._id?.toString(),
          name: productObj.pharmacy.name || '',
          address: productObj.pharmacy.address || '',
        }
      : { id: '', name: '' },
    // Add calculated fields
    isLowStock: productObj.stockQuantity <= (productObj.minStockLevel || 10),
    createdAt: productObj.createdAt,
    updatedAt: productObj.updatedAt,
  };
};

// GET - Fetch products for public users (no authentication required)
export async function GET(request: NextRequest): Promise<Response> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Check if user wants ALL products (no pagination)
    const fetchAll = searchParams.get('all') === 'true';

    const page = parseInt(searchParams.get('page') || '1');
    const limit = fetchAll ? 0 : parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const pharmacyId = searchParams.get('pharmacy') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const inStock = searchParams.get('inStock'); // Filter by stock status

    const skip = fetchAll ? 0 : (page - 1) * limit;

    // Build query for public users
    const query: any = {};

    // Optional: Only show in-stock products by default (remove if you want to show all)
    if (inStock === 'true') {
      query.inStock = true;
      query.stockQuantity = { $gt: 0 };
    }

    // Search across multiple fields
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (pharmacyId) {
      query.pharmacy = pharmacyId;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sort configuration
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    let queryBuilder = Product.find(query)
      .populate('pharmacy', 'name address contact')
      .sort(sort);

    // Apply pagination only if not fetching all
    if (!fetchAll) {
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    const productsRaw = await queryBuilder.lean();

    // Serialize products for public consumption
    const products = productsRaw.map(product =>
      serializeProductForUser(product)
    );

    const total = await Product.countDocuments(query);

    // Response structure differs based on whether fetching all or paginated
    if (fetchAll) {
      // For fetchAll, return products directly in data array
      const response: ApiResponse<any[]> = {
        success: true,
        data: products, // Return products array directly
        message: `${products.length} products fetched successfully`,
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Paginated response
    const response: ApiResponse<{
      products: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      filters?: {
        categories: string[];
        manufacturers: string[];
        priceRange: {
          min: number;
          max: number;
        };
      };
    }> = {
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          categories: await Product.distinct('category', query),
          manufacturers: await Product.distinct('manufacturer', query),
          priceRange: {
            min: await Product.findOne(query)
              .sort('price')
              .select('price')
              .then(p => p?.price || 0),
            max: await Product.findOne(query)
              .sort('-price')
              .select('price')
              .then(p => p?.price || 1000),
          },
        },
      },
      message: 'Products fetched successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching products for users:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
