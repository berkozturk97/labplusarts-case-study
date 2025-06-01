// JSON Server middleware for debugging
module.exports = (req, res, next) => {
  // Log all requests with query parameters
  console.log("\n🔍 JSON Server Request:");
  console.log(`${req.method} ${req.path}`);

  if (Object.keys(req.query).length > 0) {
    console.log("Query Parameters:", req.query);

    // Note: We now use client-side filtering for dates
    console.log("ℹ️  Note: Date filtering is handled client-side in transformResponse");

    // Highlight any remaining parameters (should be minimal since we do client-side filtering)
    const params = Object.keys(req.query);
    if (params.length > 0) {
      console.log("📋 Server-side parameters:", req.query);
    }
  } else {
    console.log("📋 No query parameters (client-side filtering active)");
  }

  // Continue to json-server
  next();
};
