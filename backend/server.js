const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const compilerRoutes = require('./routes/compiler');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/compiler', compilerRoutes);

// MongoDB connection (optional)
// Uncomment to enable MongoDB connection
/*
mongoose.connect('mongodb://localhost:27017/compiler-simulator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));
*/

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 