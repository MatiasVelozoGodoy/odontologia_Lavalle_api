require("dotenv").config();
console.log(process.env.PORT);

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const stockRoutes = require("./routes/stockRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const apptRoutes = require("./routes/apptRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/stock", stockRoutes);
app.use("/service", serviceRoutes);
app.use("/appointments", apptRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
