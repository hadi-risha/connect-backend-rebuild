import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many sign-up attempts. Please try again later."
  }
});


// for Global API routes 
// eg usage:- app.use("/api", apiRateLimiter, routes);
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down."
  }
});




//  Do NOT apply globally blindly
// Why?
// Health checks
// Static assets

//  Apply selectively
// /api/auth/login ->	Very strict
// /api/auth/register ->	Strict
// /api/auth/otp ->	Very strict
// /api/* ->	Moderate
// /health ->	No limit



//  Does rate limiter count as an “error”?
//  No, it’s not a bug
//  Not an exception
//  It’s a controlled rejection

// So:

// No throw

// No ApiError

// Middleware responds directly

// Frontend receives:

// {
//   "success": false,
//   "message": "Too many requests. Please slow down."
// }

// 1 How frontend should handle it

// Frontend checks:

// Status: 429 Too Many Requests

// Show toast:

// “Too many attempts. Try again later.”