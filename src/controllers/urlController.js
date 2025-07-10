const crypto = require('crypto');
const validUrl = require('valid-url');
const Url = require('../models/urlModel');

const BASE_URL = process.env.BASE_URL;

exports.shortenUrl = async (req, res) => {
  const { url, expiresIn } = req.body;

  // 1. Validate URL
  if (!url || !validUrl.isUri(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    // 2. Generate a random short code
    const shortCode = crypto.randomBytes(3).toString('hex'); // 6 chars
    const shortUrl = `${BASE_URL}/${shortCode}`;

    // 3. Optional expiry
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : undefined;

    // 4. Create and save to DB
    const newUrl = new Url({
      originalUrl: url,
      shortCode,
      expiresAt,
    });

    await newUrl.save();

    // 5. Return short URL
    res.json({ shortUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
