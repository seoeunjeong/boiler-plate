const { User } = require('../models/User');

let auth = (req, res, next) => {
  //인증처리하는곳
  //클라이언트에서 쿠키에서 토큰 가져오기
  let token = req.cookies.x_auth;

  //토큰 복호화 한후 유저를 찾는다.
  User.findByToken(token)
    .then((user) => {
      if (!user) return res.json({ isAuth: false, error: true });

      req.token = token;
      req.user = user;

      next();
    })
    .catch((err) => {
      // 에러를 처리하는 부분에서 throw를 사용하면 안됩니다.
      // 에러를 적절히 처리하거나 로깅하도록 수정하세요.
      console.error(err);
      return res
        .status(500)
        .json({ isAuth: false, error: true, message: 'Internal Server Error' });
    });
};

module.exports = { auth };
