const express = require('express');
const User = require('../models/user');
const {
  sendwelcomeEmail,
  sendCancellationEmail,
} = require('../emails/account');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const multer = require('multer');
const router = new express.Router();
router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    const { email, name } = req.body;
    await user.save();
    sendwelcomeEmail(email, name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => token.token !== req.token
    );
    await req.user.save();
    res.send('deleted');
  } catch (e) {
    res.sendStatus(500);
  }
});
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send('deleted');
  } catch (error) {
    res.sendStatus(500);
  }
});

router.patch('/users/me', auth, async (req, res) => {
  const allowedUpdates = ['name', 'age', 'email', 'password'];
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every(update =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdate) {
    res.status(400).send({ error: 'Invalid Updates' });
  }
  try {
    updates.forEach(update => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.sendStatus(500);
  }
});
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error('Upload an image'));
    }
    cb(undefined, true);
  },
});
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({
      error: error.message,
    });
  }
);
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.sendStatus(400);
  }
});
router.delete('/users/me/avatar', auth, async (req, res) => {
  delete req.user.avatar;
  await req.user.save();
  res.send();
});

module.exports = router;
