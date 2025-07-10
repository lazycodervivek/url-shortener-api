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

    // 3. Optional expiry (in seconds)
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000)
      : undefined;

    // 4. Save to DB
    const newUrl = new Url({
      originalUrl: url,
      shortCode,
      expiresAt,
    });

    await newUrl.save();

    // 5. Return result
    res.json({ shortUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.redirectUrl = async (req, res) => {
  const { code } = req.params;

  try {
    const urlEntry = await Url.findOne({ shortCode: code });

    if (!urlEntry) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    if (urlEntry.expiresAt && new Date() > urlEntry.expiresAt) {
      return res.status(410).json({ error: 'Short URL has expired' });
    }

    // Increment click count
    urlEntry.clickCount += 1;
    await urlEntry.save();

    // Redirect
    res.redirect(urlEntry.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
