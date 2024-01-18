const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    //비밀번호 암호화
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function () {
  var user = this;
  //jsonwebtoken 이용해서 토큰 생성
  var token = jwt.sign(user._id.toHexString(), 'secretToken');
  user.token = token;

  return user.save();
};

// userSchema.statics.findByToken = function (token) {
//   var user = this;
//   //토큰을 디코드
//   jwt.verify(token, 'secretToken', function (err, decoded) {
//     //유저 아이디를 이용해서 DB에서 유저를 찾아서 토큰 일치여부 확인

//     return user.findOne({ _id: decoded, token: token }).exec();
//   });
// };
userSchema.statics.findByToken = function (token) {
  var user = this;

  // 프로미스를 반환하는 함수로 변경
  return new Promise((resolve, reject) => {
    jwt.verify(token, 'secretToken', (err, decoded) => {
      if (err) {
        return reject(err); // 에러 발생 시 reject 호출
      }

      // 유저 아이디를 이용해서 DB에서 유저를 찾아서 토큰 일치여부 확인
      user
        .findOne({ _id: decoded, token: token })
        .exec()
        .then((user) => {
          if (!user) {
            return reject({ message: '유저를 찾을 수 없습니다.' });
          }
          resolve(user); // 결과를 resolve 호출
        })
        .catch((err) => {
          reject(err); // 에러 발생 시 reject 호출
        });
    });
  });
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
