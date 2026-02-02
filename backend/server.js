require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(require('morgan')('dev'));

const limiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use('/api', chatRoutes);

app.get('/health', (req, res) => res.send('Server is running'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
