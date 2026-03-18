const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'contacts.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Routes - serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/blog', (req, res) => res.sendFile(path.join(__dirname, 'public', 'blog.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));

// API: Submit contact form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const contacts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const newContact = {
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    subject: subject || 'General Inquiry',
    message,
    submittedAt: new Date().toISOString()
  };

  contacts.push(newContact);
  fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2));

  res.json({ success: true, message: 'Thank you! Your message has been received. Sneha will get back to you soon.' });
});

// API: Get all contacts (admin)
app.get('/api/contacts', (req, res) => {
  const contacts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json(contacts);
});

// API: Blog posts data
app.get('/api/blogs', (req, res) => {
  const blogs = [
    {
      id: 1,
      title: "The Power of Whole Foods in Functional Nutrition",
      category: "Nutrition",
      date: "March 10, 2026",
      author: "Sneha",
      image: "blog1",
      excerpt: "Discover how whole, unprocessed foods can transform your health from the inside out. Learn the science behind nutrient density and bioavailability.",
      content: "Whole foods are the cornerstone of functional nutrition. Unlike processed foods, whole foods retain their natural nutrients, fiber, and beneficial compounds that work synergistically in the body. When we eat a variety of colorful fruits and vegetables, lean proteins, healthy fats, and complex carbohydrates, we provide our bodies with everything needed to thrive..."
    },
    {
      id: 2,
      title: "Understanding Your Gut-Brain Connection",
      category: "Wellness",
      date: "March 5, 2026",
      author: "Sneha",
      image: "blog2",
      excerpt: "Your gut is your second brain. Explore the fascinating connection between gut health and mental wellness, and what you can do to optimize both.",
      content: "The gut-brain axis is a bidirectional communication network that links your enteric nervous system to your central nervous system. This connection means that what happens in your gut directly impacts your mood, cognition, and mental health. Approximately 95% of serotonin is produced in the gut, making digestive health crucial for emotional wellbeing..."
    },
    {
      id: 3,
      title: "Anti-Inflammatory Eating: A Complete Guide",
      category: "Diet",
      date: "February 28, 2026",
      author: "Sneha",
      image: "blog3",
      excerpt: "Chronic inflammation is at the root of many modern diseases. Learn which foods fight inflammation and how to build an anti-inflammatory lifestyle.",
      content: "Inflammation is your body's natural defense mechanism, but when it becomes chronic, it contributes to conditions like heart disease, diabetes, arthritis, and even cancer. An anti-inflammatory diet focuses on foods rich in antioxidants, omega-3 fatty acids, and phytonutrients..."
    },
    {
      id: 4,
      title: "Balancing Blood Sugar Naturally",
      category: "Nutrition",
      date: "February 20, 2026",
      author: "Sneha",
      image: "blog4",
      excerpt: "Stable blood sugar is key to consistent energy, mood, and weight management. Here's how functional nutrition can help you maintain balance.",
      content: "Blood sugar dysregulation affects millions of people and is at the root of many metabolic conditions. By understanding how different foods impact glucose levels and incorporating functional nutrition strategies, you can maintain steady energy throughout the day..."
    },
    {
      id: 5,
      title: "Top 10 Superfoods for Optimal Health",
      category: "Food",
      date: "February 12, 2026",
      author: "Sneha",
      image: "blog5",
      excerpt: "Not all foods are created equal. These 10 powerhouse foods pack incredible nutritional benefits that can elevate your health to the next level.",
      content: "Superfoods are nutrient-rich foods considered to be especially beneficial for health and well-being. From blueberries packed with antioxidants to salmon rich in omega-3s, incorporating these foods into your daily diet can make a significant difference..."
    },
    {
      id: 6,
      title: "Mindful Eating: Transforming Your Relationship with Food",
      category: "Wellness",
      date: "February 5, 2026",
      author: "Sneha",
      image: "blog6",
      excerpt: "Mindful eating goes beyond what you eat — it's about how you eat. Discover practices that help you reconnect with hunger cues and find food joy.",
      content: "Mindful eating is a practice rooted in mindfulness that encourages full attention to the experience of eating. It involves eating slowly, savoring each bite, listening to your body's hunger and satiety cues, and creating a positive relationship with food free from guilt or restriction..."
    }
  ];
  res.json(blogs);
});

app.listen(PORT, () => {
  console.log(`\n🌿 Functional Nutrition by Sneha`);
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📋 Press Ctrl+C to stop\n`);
});
