import express from 'express';
import authRoutes from './routes/auth.js';
import { connectKafka } from './producer.js';
const app = express();
app.use(express.json());
connectKafka();
app.use("/api/auth", authRoutes);
export default app;
