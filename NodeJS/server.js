import 'dotenv/config'; // Load environment variables from .env into process.env.
import express from 'express'; // Import Express framework.
import cors from 'cors'; // Import CORS middleware.
import authRoutes from './routes/authRoutes.js'; // Import auth routes module.
import listingRoutes from './routes/listingRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import skillRoutes from './routes/skillRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'

const app = express(); // Create an Express app instance.
const PORT = 5002; // Define server port.

app.use(cors()); // Enable CORS for incoming requests.
app.use(express.json()); // Parse JSON request bodies.

app.get('/', (req, res) => { // Define GET route for root path.
  res.send('Backend is Working'); // Send a plain-text health message.
});

app.get('/api/test', (req, res) => { // Define test endpoint.
  res.json({ message: 'API works' }); // Send JSON test response.
});

app.use('/auth', authRoutes); // Mount auth routes under /auth prefix.
app.use('/listings',listingRoutes);
app.use('/student', studentRoutes);
app.use('/company', companyRoutes);
app.use('/skills', skillRoutes)
app.use('/applications', applicationRoutes)
app.listen(PORT, () => { // Start server and listen on PORT.
  console.log(`Server running on http://localhost:${PORT}`); // Log server URL when started.
});
