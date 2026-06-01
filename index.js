const express = require("express");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = 3000;

const appRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "failed", message: "Too many requests, please try again later." }
});

app.use(appRateLimit);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.set("view engine", "ejs");

app.post("/player/login/dashboard", async (req, res) => {
  try {
    let loginInfo = "";

    if (req.body && typeof req.body === 'object') {
      const keys = Object.keys(req.body);
      if (keys.length > 0 && typeof keys[0] === 'string') {
        loginInfo = Buffer.from(keys[0], "utf8").toString("base64");
      }
    }

    res.render("dashboard", { token: loginInfo });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/player/growid/login/validate", async (req, res) => {
  try {
    const { _token, growId, password } = req.body;

    if (!_token || !growId || (!growId && !password)) {
      return res.json({
        status: "failed",
        message: "Something is missing, please try login again.",
        token: "",
        url: "",
        accountType: "growtopia"
      });
    }

    if (
      typeof growId !== 'string' || growId.length < 3 || growId.length > 20 ||
      (password && (typeof password !== 'string' || password.length < 3 || password.length > 25)) ||
      typeof _token !== 'string' || _token.length < 50 || _token.length > 600
    ) {
      return res.json({
        status: "failed",
        message: "Input error, please try login again.",
        token: "",
        url: "",
        accountType: "growtopia"
      });
    }

    const cleanGrowId = growId.replace(/[^a-zA-Z0-9]/g, "");
    if (cleanGrowId !== growId) {
      return res.json({ status: "failed", message: "Invalid characters in GrowID.", token: "" });
    }

    let decodedToken = "";
    try {
      decodedToken = Buffer.from(_token, "base64").toString("utf8");
    } catch (e) {
      return res.json({ status: "failed", message: "Invalid session token.", token: "", url: "", accountType: "growtopia" });
    }

    const rawTokenData = `loginInfo=${decodedToken}&growID=${growId}&password=${password}`;
    const generatedToken = Buffer.from(rawTokenData, "utf8").toString("base64");

    return res.json({
      status: "success",
      message: "Account Validated.",
      token: generatedToken,
      url: "",
      accountType: "growtopia"
    });

  } catch (error) {
    console.error("Validate Error:", error);
    return res.status(500).json({ status: "failed", message: "Internal server error.", token: "", url: "", accountType: "growtopia" });
  }
});

app.post("/player/growid/checktoken", async (req, res) => {
  
});

app.get("/player/validate/close", (req, res) => {
  res.send("<script>window.close();</script>");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});