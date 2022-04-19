import crypto from 'crypto';
import catchAsync from '../../helpers/catchAsync.js';
import User from './userModel.js';
import AppError from '../../helpers/appError.js';
import { signToken } from '../../helpers/jwtHelper.js';
import sendEmail from '../../utils/email.js';

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;

  res.redirect('/homescreen');
};

const signup = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return next(new AppError('User already regitered with this email'), 409);
  }
  const newUser = await User.create({
    email,
    password,
  });
  if (!newUser) {
    return next(new AppError('Something went wrong please try again'), 404);
  }
  createSendToken(newUser, 201, req, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const userEmail = await User.findOne({ email });
  if (!email || !password) {
    return next(new AppError('please provide valid email and password', 400));
  }
  if (!userEmail) {
    return next(new AppError('User not exist please register'), 409);
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('email or password not valid', 401));
  }
  createSendToken(user, 200, req, res);
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(409).json({
      status: 'fail',
      message: 'User not exist please register',
    });
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //create reset url for email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/user/reset-password/${resetToken}`;
  //message for email
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:${resetUrl}.
  If you didn't forgot your password ,please ignore this email`;
  //send mail
  await sendEmail({
    email: email,
    subject: 'Your password reset token (valid for 10 min)',
    message,
  });
  return res.status(200).json({
    status: 'success',
    message: 'Reset token has sent to your email',
  });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('User not found please register', 404));
  }
  //update the password
  user.password = req.body.newPassword;

  //deleting reset token and expire time
  user.passwordResetToken = undefined;
  user.passwordResetExpiresIn = undefined;
  await user.save();

  //login in user with JWT
  const accessToken = createToken(user._id);

  return res.status(200).json({
    status: 'success',
    accessToken,
  });
});

export default {
  signup,
  login,
  forgotPassword,
  resetPassword,
};
