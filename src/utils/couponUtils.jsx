// utils/couponUtils.js

/**
 * Get all active coupons for the current user
 * @param {string} userId - User ID
 * @returns {Array} Array of active coupons
 */
export function getUserActiveCoupons(userId) {
  if (typeof window === "undefined") return [];
  
  const couponsData = JSON.parse(localStorage.getItem("redeemedCoupons") || "{}");
  const userCoupons = couponsData[userId] || [];
  
  // Filter only active, non-expired, unused coupons
  return userCoupons.filter(coupon => {
    const isExpired = new Date(coupon.expiresAt) < new Date();
    return !coupon.used && !isExpired && coupon.active;
  });
}

/**
 * Apply a coupon to a booking amount
 * @param {string} couponCode - Coupon code to apply
 * @param {number} amount - Original booking amount
 * @param {string} userId - User ID
 * @returns {Object} Result with discount details
 */
export function applyCoupon(couponCode, amount, userId) {
  if (typeof window === "undefined") {
    return { success: false, error: "Invalid environment" };
  }

  const activeCoupons = getUserActiveCoupons(userId);
  const coupon = activeCoupons.find(c => c.code === couponCode);

  if (!coupon) {
    return {
      success: false,
      error: "Invalid or expired coupon code"
    };
  }

  let discount = 0;
  let finalAmount = amount;

  if (coupon.type === "percentage") {
    discount = (amount * coupon.discountValue) / 100;
    finalAmount = amount - discount;
  } else if (coupon.type === "fixed") {
    discount = Math.min(coupon.discountValue, amount); // Can't discount more than total
    finalAmount = amount - discount;
  } else if (coupon.type === "service") {
    // Service coupons don't affect price directly
    discount = 0;
    finalAmount = amount;
  }

  return {
    success: true,
    discount: discount,
    finalAmount: Math.max(finalAmount, 0),
    coupon: coupon,
    message: `Coupon applied: ${coupon.title}`
  };
}

/**
 * Mark a coupon as used after successful payment
 * @param {string} couponCode - Coupon code to mark as used
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
export function markCouponAsUsed(couponCode, userId) {
  if (typeof window === "undefined") return false;

  try {
    const couponsData = JSON.parse(localStorage.getItem("redeemedCoupons") || "{}");
    const userCoupons = couponsData[userId] || [];

    const updatedCoupons = userCoupons.map(coupon => {
      if (coupon.code === couponCode) {
        return {
          ...coupon,
          used: true,
          usedAt: new Date().toISOString()
        };
      }
      return coupon;
    });

    couponsData[userId] = updatedCoupons;
    localStorage.setItem("redeemedCoupons", JSON.stringify(couponsData));

    return true;
  } catch (error) {
    console.error("Error marking coupon as used:", error);
    return false;
  }
}

/**
 * Remove/cancel a coupon (e.g., when user removes it from cart)
 * @param {string} couponCode - Coupon code to remove
 * @returns {boolean} Success status
 */
export function removeCoupon(couponCode) {
  // Just return true, the coupon stays in their account
  // It's just removed from the current checkout session
  return true;
}

/**
 * Validate if a coupon can be used for a specific service
 * @param {Object} coupon - Coupon object
 * @param {Object} service - Service object
 * @returns {boolean} Whether coupon is valid for this service
 */
export function validateCouponForService(coupon, service) {
  // Add custom validation logic here
  // For example, check if it's a premium-only coupon
  
  if (coupon.title.includes("Premium") && !service.isPremium) {
    return false;
  }

  return true;
}

/**
 * Get coupon display information
 * @param {Object} coupon - Coupon object
 * @returns {string} Display text for the coupon
 */
export function getCouponDisplayText(coupon) {
  if (coupon.type === "percentage") {
    return `${coupon.discountValue}% OFF`;
  } else if (coupon.type === "fixed") {
    return `$${coupon.discountValue} OFF`;
  } else if (coupon.type === "service") {
    return coupon.title;
  }
  return "DISCOUNT";
}

/**
 * Calculate total savings from using a coupon
 * @param {string} userId - User ID
 * @returns {number} Total amount saved
 */
export function getTotalSavings(userId) {
  if (typeof window === "undefined") return 0;

  const couponsData = JSON.parse(localStorage.getItem("redeemedCoupons") || "{}");
  const userCoupons = couponsData[userId] || [];

  const usedCoupons = userCoupons.filter(c => c.used);
  
  // This is a simple calculation - you'd want to track actual savings
  return usedCoupons.reduce((total, coupon) => {
    if (coupon.type === "fixed") {
      return total + coupon.discountValue;
    }
    // For percentage, we'd need to know the original amounts
    return total;
  }, 0);
}

/**
 * Add points to user account (for rewarding actions)
 * @param {string} userId - User ID
 * @param {number} points - Points to add
 * @param {string} action - Action that earned points
 * @returns {number} New total points
 */
export function addPoints(userId, points, action = "Action completed") {
  if (typeof window === "undefined") return 0;

  try {
    const pointsData = JSON.parse(localStorage.getItem("userPoints") || "{}");
    const currentPoints = pointsData[userId] || 0;
    const newPoints = currentPoints + points;

    pointsData[userId] = newPoints;
    localStorage.setItem("userPoints", JSON.stringify(pointsData));

    // Optionally log the transaction
    console.log(`✅ ${action}: +${points} points (Total: ${newPoints})`);

    return newPoints;
  } catch (error) {
    console.error("Error adding points:", error);
    return 0;
  }
}

/**
 * Get user's current points balance
 * @param {string} userId - User ID
 * @returns {number} Current points balance
 */
export function getUserPoints(userId) {
  if (typeof window === "undefined") return 0;

  const pointsData = JSON.parse(localStorage.getItem("userPoints") || "{}");
  return pointsData[userId] || 0;
}