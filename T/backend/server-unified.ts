import "dotenv/config";
import http from "http";
import cors from "cors";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import lobbyRoutes from "./routes/lobbyRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import answerRoutes from "./routes/answerRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { mountReadiness, startReadinessCrons } from "./readiness/mount.js";

connectDB();

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.send("Career Bridge API — MongoDB + readiness modules. See /api/health");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: true, readiness: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/lobbies", lobbyRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/feedback", feedbackRoutes);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: clientOrigin, methods: ["GET", "POST"] },
});

mountReadiness(app, io);
startReadinessCrons(io);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5003;
server.listen(PORT, () => {
  console.log(`API + WebSocket listening on http://localhost:${PORT}`);
});
