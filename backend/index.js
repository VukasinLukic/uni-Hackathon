import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // Učitavanje .env fajla

const app = express(); // Inicijalizacija Express aplikacije

// Omogućavanje CORS-a
app.use(
  cors({
    origin: "*", // Dozvoljava sve origin-e
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Dozvoljene metode
    credentials: true, // Omogućava kolačiće i autorizacione zaglavlja
  })
);

// Middleware za parsiranje JSON-a
app.use(express.json());

// Povezivanje sa MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// Osnovna ruta
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// Pokretanje Express servera
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
