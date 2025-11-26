// app/api/shops/route.ts
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Shop, { IShop } from '@/models/shop';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    let shopPosts: IShop[];
    let totalCount: number;

    if (query) {
      const searchCondition = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { id: { $regex: query, $options: 'i' } },
        ],
      };

      [shopPosts, totalCount] = await Promise.all([
        Shop.find(searchCondition).skip(skip).limit(limit),
        Shop.countDocuments(searchCondition),
      ]);
    } else {
      [shopPosts, totalCount] = await Promise.all([
        Shop.find({}).skip(skip).limit(limit),
        Shop.countDocuments(),
      ]);
    }

    const response: ApiResponse<{
      shops: IShop[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalShops: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }> = {
      success: true,
      data: {
        shops: shopPosts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalShops: totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
      },
      message: 'Shops fetched successfully',
    };

    return Response.json(response, { status: 200 });
  } catch (error) {
    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to fetch shops',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    await connectDB();

    const body = await req.json();

    const { id, name, price, image, description, category, inStock } = body;

    if (!id || !name || price === undefined || !image) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'All fields are required',
        error: 'Missing required fields: id, name, price, image',
      };
      return Response.json(errorResponse, { status: 400 });
    }

    if (
      typeof name !== 'string' ||
      typeof price !== 'number' ||
      typeof image !== 'string' ||
      typeof id !== 'string'
    ) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Invalid data types',
        error: 'Name and image must be strings, price must be a number',
      };
      return Response.json(errorResponse, { status: 400 });
    }

    if (price < 0) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Invalid price',
        error: 'Price must be a positive number',
      };
      return Response.json(errorResponse, { status: 400 });
    }

    const existingShop = await Shop.findOne({
      $or: [{ id: id }, { name: { $regex: `^${name}$`, $options: 'i' } }],
    });

    if (existingShop) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Shop already exists',
        error:
          existingShop.id === id
            ? 'Shop with this ID already exists'
            : 'Shop with this name already exists',
      };
      return Response.json(errorResponse, { status: 409 });
    }

    const newShop = new Shop({
      id: id.trim(),
      name: name.trim(),
      price: Number(price),
      image: image.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'medication',
      inStock: inStock !== undefined ? inStock : true,
    });

    const savedShop = await newShop.save();

    const response: ApiResponse<IShop> = {
      success: true,
      data: savedShop,
      message: 'Shop created successfully',
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('Create shop error:', error);

    const errorResponse: ApiResponse<null> = {
      success: false,
      message: 'Failed to create shop',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };

    return Response.json(errorResponse, { status: 500 });
  }
}
