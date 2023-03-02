const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: [true, 'please tell us your name'],
        trim: true,
    },
    email: {
        type: String,
        require: [true, 'please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'please provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        require: [true, 'please provide a password'],
        minLength: [8, 'A minimum length of password is 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        require: [true, 'please confirm your password'],
    },
    passwordChangedAt: Date,
});

// Document Middleware

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;

    next();

})

userSchema.methods.comparePassword = async function (requestPassword, DbPassword) {
    return await bcrypt.compare(requestPassword, DbPassword);
}


userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };
  

const User = mongoose.model('User', userSchema);

module.exports = User;