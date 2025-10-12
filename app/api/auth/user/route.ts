import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/user
 * Returns authenticated user data from Clerk
 *
 * @returns User object with id, email, name, image
 * @returns 401 if not authenticated
 * @returns 500 on server error
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: userId,
      email: user.primaryEmailAddress?.emailAddress || null,
      name: user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username || null,
      image: user.imageUrl || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      username: user.username || null,
    });
  } catch (error) {
    console.error('[API Error] /api/auth/user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
