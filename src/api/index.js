const express = require('express');

const emojis = require('./emojis');
const faqs = require('./CRUD/faqs');
const faqs_advanced = require('./CRUD/faqs_advanced');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/emojis', emojis);
router.use('/faqs', faqs);
router.use('/faqs-advanced', faqs_advanced);

module.exports = router;
