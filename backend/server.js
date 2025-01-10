// server.js

const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'main.html')); 
  });

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Route for uploading images
app.post('/image', upload.single('file'), (req, res) => {
  const imageFile = req.file.path;

  Tesseract.recognize(
    imageFile,
    'eng',
    {
      logger: (m) => console.log(m),
    }
  )
  .then(({ data: { text } }) => {
    res.json({ text });
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send('Error processing image');
  });
});

// Route for serving symptoms data (just an example, replace with actual data)
app.post('/find', (req, res) => {
  const symptoms = req.body.symptoms; // You can process symptoms here
  res.json({ message: 'Symptoms received', symptoms });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
