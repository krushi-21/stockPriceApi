import { verifyToken } from '../helpers/jwtHelper.js';
function checkUserAuth(req, res, next) {
  //get cookie
  const sessionCookie = req.cookies.jwt;
  const verify = verifyToken(sessionCookie);
  if (verify) {
    return next();
  }
  return res.render('unauthenticated');
}

export default checkUserAuth;
