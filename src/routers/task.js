const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    });
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send();
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  const allowedUpdates = ['completed', 'description'];
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every(update =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdate) {
    res.status(400).send({ error: 'Invalid updates' });
  }
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      res.sendStatus(404);
    }
    updates.forEach(update => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.sendStatus(400);
  }
});
//GET /tasks?completed
//GET  /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
  try {
    // const task = await Task.findOne({ owner: req.user._id });
    const match = {};
    const sort = {};
    if (req.query.completed) {
      match.completed = req.query.completed === 'true';
    }
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split('_');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    req.query.completed;
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    });
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user.id });
    if (!task) {
      res.sendStatus(404);
    }
    res.send(task);
  } catch (e) {
    res.status(404).send();
  }
});
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      res.sendStatus(404);
    }
    res.send(task);
  } catch (e) {
    res.sendStatus(400);
  }
});
module.exports = router;
