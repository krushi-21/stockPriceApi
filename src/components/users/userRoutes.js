import express from 'express';
import userController from './userController.js';

const router = express.Router();

router
  .post('/signup', userController.signup)
  .get('/signup', function (req, res) {
    res.render('signup');
  });
router.post('/login', userController.login).get('/login', function (req, res) {
  res.render('login');
});
router
  .post('/forgotPassword', userController.forgotPassword)
  .get('/forgotPassword', function (req, res) {
    res.render('forgotPassword');
  });
router.patch('/resetPassword/:token', userController.resetPassword);
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.redirect('login');
});

export default router;
