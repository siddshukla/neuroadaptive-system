const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/neuroadaptive";
const JWT_SECRET = process.env.JWT_SECRET || "neuroadaptive_secret_2024";
const ML_API = process.env.ML_API || "http://localhost:5000";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const AnalysisSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename:  { type: String },
  inputType: { type: String, enum: ["upload","demo"], default: "demo" },
  inputState:{ type: String },
  predictions:   { type: Object },
  features:      { type: Object },
  signalPreview: [Number],
  createdAt: { type: Date, default: Date.now },
});

const User     = mongoose.model("User", UserSchema);
const Analysis = mongoose.model("Analysis", AnalysisSchema);

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/auth/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

app.post("/api/analyze/demo", auth, async (req, res) => {
  try {
    const state = req.body.state || "normal";
    const mlRes = await axios.post(ML_API + "/analyze/demo?state=" + state);
    const data = mlRes.data;
    const analysis = await Analysis.create({
      userId: req.user.id,
      inputType: "demo",
      inputState: state,
      predictions: data.predictions,
      features: data.features,
      signalPreview: data.signal_preview,
    });
    res.json({ ...data, analysisId: analysis._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/analyze/upload", auth, upload.single("eeg"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const form = new FormData();
    form.append("file", req.file.buffer, { filename: req.file.originalname });
    const mlRes = await axios.post(ML_API + "/analyze/upload", form, { headers: form.getHeaders() });
    const data = mlRes.data;
    const analysis = await Analysis.create({
      userId: req.user.id,
      inputType: "upload",
      filename: req.file.originalname,
      predictions: data.predictions,
      features: data.features,
      signalPreview: data.signal_preview,
    });
    res.json({ ...data, analysisId: analysis._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/history", auth, async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-signalPreview");
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/history/:id", auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id });
    if (!analysis) return res.status(404).json({ message: "Not found" });
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/history/:id", auth, async (req, res) => {
  try {
    await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/stats", auth, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    const trend = analyses.reverse().map(a => ({
      date:      a.createdAt,
      stress:    a.predictions?.stress?.score || 0,
      anxiety:   a.predictions?.anxiety?.score || 0,
      focus:     a.predictions?.focus?.score || 0,
      fatigue:   a.predictions?.fatigue?.score || 0,
      stability: a.predictions?.emotional_stability?.score || 0,
    }));
    res.json({ trend, total: await Analysis.countDocuments({ userId: req.user.id }) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => console.log("Backend running on port " + PORT));