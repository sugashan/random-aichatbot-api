import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import moduleRoutes from '../src/routes/moduleRoutes.js';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.use('/', moduleRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
