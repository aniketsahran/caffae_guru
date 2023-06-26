const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs'); // Set the view engine to EJS (assuming it's already installed)

app.get('/application', (req, res) => {
  res.render('application');
});

// Connection URL and database name
const url = 'mongodb://0.0.0.0:27017/formwizard';
const dbName = 'formwizard';

// Connect to MongoDB
MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }

  console.log('Connected to MongoDB');

  // Get the reference to the database
  const db = client.db(dbName);

  // Define routes
  app.post('/submit', (req, res) => {
    const formData = {
      firstName: req.body['first-name'],
      lastName: req.body['last-name'],
      gender: req.body.gender,
      age: req.body.age,
      educationStatus: req.body['education-status'],
      highestQualification: req.body['highest-qualification'],
      university: req.body.university,
      employmentStatus: req.body['employment-status'],
      teachingExperience: req.body['teaching-experience'],
      agreedToTerms: req.body['agreed-to-terms'],
    };

    const collection = db.collection('formdata');
    collection.insertOne(formData, (err, result) => {
      if (err) {
        console.error('Failed to insert form data:', err);
        res.status(500).send('Failed to submit the form');
        return;
      }

      console.log('Form data submitted:', result.insertedId);
      // Redirect to the dashboard
      res.redirect('/dashboard');
    });
  });

  app.get("/dashboard", (req, res) => {
    const collection = db.collection('formdata');
    collection.find({}).toArray((err, formData) => {
      if (err) {
        console.error('Failed to fetch form data:', err);
        res.redirect("/login");
        return;
      }
      res.render("dashboard", { formData });
    });
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // Close the MongoDB connection when the server is shutting down
  process.on('SIGINT', () => {
    client.close();
    console.log('MongoDB connection closed');
    process.exit();
  });
});
