import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();

    const { username, code } = body;

    console.log("Request username:", username);
    console.log("Request code:", code);

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({
      username: decodedUsername,
    });

    console.log("Found user:", user?.username);
    console.log("DB verifyCode:", user?.verifyCode);
    console.log("DB expiry:", user?.verifyCodeExpiry);
    console.log("Current time:", new Date());

    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired =
      new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: 'Account verified successfully',
        },
        { status: 200 }
      );
    }

    if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            'Verification code has expired. Please sign up again to get a new code.',
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: false,
        message: 'Incorrect verification code',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error verifying user:', error);

    return Response.json(
      {
        success: false,
        message: 'Error verifying user',
      },
      { status: 500 }
    );
  }
}