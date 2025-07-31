const mongoose = require('mongoose');

const DiscountCouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  percent: { type: Number, required: true }, // e.g. 10 for 10%
  expires: { type: Date } // optional
});

module.exports = mongoose.model('Discount_Coupon', DiscountCouponSchema);
