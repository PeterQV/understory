const users = require('../db/brugere'); // jeres array med brugere
const bcrypt = require('bcryptjs');

const authController = {
  // LOGIN
  login: async (req, res) => {
    try {
      const { brugernavn, adgangskode } = req.body;

      if (!brugernavn || !adgangskode) {
        return res.status(400).json({ success: false, message: 'Brugernavn og adgangskode er påkrævet' });
      }

      // Find bruger i arrayet
      const user = users.find(u => u.username === brugernavn);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Bruger ikke fundet' });
      }

      // Tjek password
      const isValidPassword = await bcrypt.compare(adgangskode, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Forkert adgangskode' });
      }

      // Opret session
      req.session.user = { username: user.username, email: user.email };

      res.json({ success: true, message: 'Login succesfuld', user: req.session.user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server fejl' });
    }
  },

  // REGISTER
  register: async (req, res) => {
    try {
      const { brugernavn, email, adgangskode } = req.body;

      if (!brugernavn || !email || !adgangskode) {
        return res.status(400).json({ success: false, message: 'Alle felter er påkrævet' });
      }

      // Tjek om brugeren allerede findes
      const existingUser = users.find(u => u.username === brugernavn || u.email === email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Brugernavn eller email findes allerede' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adgangskode, 12);

      // Opret ny bruger og push til array
      const newUser = { username: brugernavn, email, password: hashedPassword };
      users.push(newUser);

      // Auto-login efter registrering
      req.session.user = { username: newUser.username, email: newUser.email };

      res.status(201).json({ success: true, message: 'Konto oprettet succesfuldt', user: req.session.user });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Fejl ved oprettelse af konto' });
    }
  },

  // LOGOUT
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Logout fejlede' });
      }
      res.json({ success: true, message: 'Logout succesfuld' });
    });
  },

  // GET CURRENT USER
  getCurrentUser: (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: 'Ikke logget ind' });
    }
  }
};

module.exports = authController;
