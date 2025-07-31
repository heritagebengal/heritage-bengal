const express = require('express');
const router = express.Router();
const DiscountCoupon = require('../models/DiscountCoupon');

// Create a coupon
router.post('/', async (req, res) => {
  try {
    const coupon = new DiscountCoupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a coupon by code
router.delete('/:code', async (req, res) => {
  try {
    const result = await DiscountCoupon.deleteOne({ code: req.params.code });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Apply coupon and get discounted total
router.post('/apply', async (req, res) => {
  const { code, total } = req.body;
  try {
    const coupon = await DiscountCoupon.findOne({ code });
    if (!coupon) return res.json({ valid: false });
    if (coupon.expires && new Date() > coupon.expires) return res.json({ valid: false, expired: true });
    const percent = coupon.percent;
    const discountedTotal = Math.round(total * (1 - percent / 100));
    res.json({ valid: true, discountedTotal, percent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
