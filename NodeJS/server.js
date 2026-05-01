import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import skillRoutes from './routes/skillRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
mkdirSync(join(__dirname, 'uploads'), { recursive: true });

const app = express();
const PORT = process.env.PORT || 5002;
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.get('/', (req, res) => { // Define GET route for root path.
  res.send('Backend is Working'); // Send a plain-text health message.
});

app.get('/api/test', (req, res) => { // Define test endpoint.
  res.json({ message: 'API works' }); // Send JSON test response.
});

app.use('/auth', authRoutes); // Mount auth routes under /auth prefix.
app.use('/listings', listingRoutes);
app.use('/student', studentRoutes);
app.use('/company', companyRoutes);
app.use('/skills', skillRoutes)
app.use('/applications', applicationRoutes)
app.use('/admin', adminRoutes)
app.listen(PORT, () => { // Start server and listen on PORT.
  console.log(`Server running on http://localhost:${PORT}`); // Log server URL when started.
});
