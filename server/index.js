const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const config = require('./config/key');
const cookieParser = require('cookie-parser');
const { User } = require('./models/User');
const { auth } = require('./middleware/auth');

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());

app.use(cookieParser());

const mongoose = require('mongoose');
mongoose
  .connect(config.mongoURI)
  .then(() => console.log('MongoDB Connectd..'))
  .catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/hello', (req, res) => {
  res.send('안녕하세요~');
});

app.post('/api/users/register', (req, res) => {
  //회원가입시 필요한 정보들을 client에서 가져오면 데이터베이스에 넣어준다.

  const user = new User(req.body);

  user
    .save()
    .then((userInfo) => {
      return res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      return res.json({ success: false, err });
    });
});

app.post('/api/users/login', (req, res) => {
  //요청된 이메일을 데이터베이스에서 찾기
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.json({
          loginSuccess: false,
          message: '제공된 이메일에 해당하는 유저가 없습니다.',
        });
      } else {
        //비밀번호 일치 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (!isMatch)
            return res.json({
              loginSuccess: false,
              message: '비밀번호가 틀렸습니다',
            });

          //token 생성
          user
            .generateToken()
            .then((user) => {
              res
                .cookie('x_auth', user.token)
                .status(200)
                .json({ loginSuccess: true, userId: user._id });
            })
            .catch((err) => {
              res.status(500).json({
                loginSuccess: false,
                message: '토큰생성중 오류가 발생했습니다.',
              });
            });
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        loginSuccess: false,
        message: '로그인중 오류가 발생했습니다.',
      });
    });
});

app.get('/api/users/auth', auth, (req, res) => {
  //여기까지 미들웨어를 통과해 왔다는 엇은 auth ok!
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
  });
});

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: '' })
    .then((user) => {
      if (!user) {
        return res.json({
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        });
      }

      return res.status(200).send({
        success: true,
      });
    })
    .catch((err) => {
      return res.json({ success: false, error: err.message });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
