const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({
  origin: "http://127.0.0.1:5501",
  credentials: true
}));
app.use(express.json());

app.use("/api/menu", require("./router/menu"));
app.use("/api/order", require("./router/order"));
app.use("/api/booking", require("./router/booking"));

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false });
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
