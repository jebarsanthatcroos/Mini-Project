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
    id: productObj._id?.toString(),
    name: productObj.name,
    description: productObj.description,
    price: productObj.price,
    category: productObj.category,
    image: productObj.image,
    inStock: productObj.inStock,
    stockQuantity: productObj.stockQuantity,
    manufacturer: productObj.manufacturer,
    requiresPrescription: productObj.requiresPrescription,
    sku: productObj.sku,
    pharmacy: productObj.pharmacy
      ? {
          id: productObj.pharmacy._id?.toString(),
          name: productObj.pharmacy.name,
          address: productObj.pharmacy.address,
          contact: productObj.pharmacy.contact,
        }
      : null,
    // Add calculated fields
    isLowStock: productObj.stockQuantity <= productObj.minStockLevel,
    // Remove sensitive information
    costPrice: undefined,
    minStockLevel: undefined,
    reservedQuantity: undefined,
    createdBy: undefined,
    isControlledSubstance: undefined,
    sideEffects: undefined,
    dosage: undefined,
    activeIngredients: undefined,
    barcode: undefined,
    tags: undefined,
    expiryDate: undefined,
    createdAt: productObj.createdAt,
    updatedAt: productObj.updatedAt,
  };
};

// GET - Fetch a single product by ID for public users (no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    await connectDB();

    const { id } = params;

    // Validate ID format
    if (!id || id.length !== 24) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Invalid product ID format',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Find product and populate pharmacy info
    const product = await Product.findById(id)
      .populate('pharmacy', 'name address contact')
      .lean();

    // Check if product exists
    if (!product) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Product not found',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if product is available for public viewing
    if (!product.inStock || product.stockQuantity <= 0) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Product is currently unavailable',
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Serialize product for public consumption
    const serializedProduct = serializeProductForUser(product);

    const response: ApiResponse<any> = {
      success: true,
      data: serializedProduct,
      message: 'Product fetched successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching product for user:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to fetch product',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
