const express = require("express");
const jwt = require("jsonwebtoken"); // ✅ Ensure JWT is imported
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const generalRoutes = require("./router/general.js"); // Import general routes

const app = express(); // ✅ Define app FIRST!

app.use(express.json()); // ✅ Ensures JSON parsing

// ✅ Use public/general routes first
app.use("/", generalRoutes);

// ✅ Setup session for customer routes
app.use(
    "/customer",
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true,
    })
);

// ✅ Middleware for Authentication
app.use("/customer/auth/*", function auth(req, res, next) {
    next();
});

// ✅ Middleware for Token Authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No valid token provided." });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    try {
        const verified = jwt.verify(token, "secret_key");
        req.user = verified; // Attach decoded user data
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

// ✅ Apply authentication middleware to review deletion
app.use("/customer/auth/review/:isbn", authenticateToken, customer_routes);

// ✅ Load authenticated routes **after session**
app.use("/customer", customer_routes);

// ✅ Debugging: Show available routes
console.log("✅ Available Routes:");
console.log(app._router.stack.map(r => r.route && r.route.path));

// ✅ Start the server once
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
