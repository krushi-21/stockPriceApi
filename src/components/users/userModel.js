import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'Please tell us your email!'],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
      required: [true, 'Please tell us your password!'],
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);
userSchema.pre('save', async function (next) {
  // if password is not modified then skip encryption and continue with rest of the code
  if (!this.isModified('password')) return next();

  // Encrypt and and store the password
  this.password = await bcrypt.hash(this.password, 12);

  next();
});
userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
