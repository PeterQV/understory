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

      // Smart løsning: Tjek om password allerede er hashet
      const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
      
      let isValidPassword = false;
      
      if (isPasswordHashed) {
        // Password er allerede hashet - brug bcrypt.compare
        isValidPassword = await bcrypt.compare(adgangskode, user.password);
      } else {
        // Password er i plaintext - sammenlign direkte
        isValidPassword = (adgangskode === user.password);
        
        // Hvis login er succesfuldt, hash password for fremtidige logins
        if (isValidPassword) {
          user.password = await bcrypt.hash(adgangskode, 12);
          console.log(`Password for ${user.username} er nu hashet`);
        }
      }

      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Forkert adgangskode' });
      }

      // Opret session
      req.session.user = { 
        username: user.username, 
        email: user.email 
      };

      res.json({ 
        success: true, 
        message: 'Login succesfuld', 
        user: req.session.user 
      });
      
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

      // Hash password FØR vi gemmer det
      const hashedPassword = await bcrypt.hash(adgangskode, 12);

      // Opret ny bruger med HASHET password
      const newUser = { 
        username: brugernavn, 
        email: email, 
        password: hashedPassword 
      };
      
      users.push(newUser);

      // Auto-login efter registrering
      req.session.user = { 
        username: newUser.username, 
        email: newUser.email 
      };

      res.status(201).json({ 
        success: true, 
        message: 'Konto oprettet succesfuldt', 
        user: req.session.user 
      });
      
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Fejl ved oprettelse af konto' });
    }
  },

  // LOGOUT
  logout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ success: false, message: 'Logout fejlede' });
      }
      
      res.json({ 
        success: true, 
        message: 'Logout succesfuld' 
      });
    });
  },

  // GET CURRENT USER
  getCurrentUser: (req, res) => {
    if (req.session.user) {
      res.json({ 
        success: true,
        user: req.session.user 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: 'Ikke logget ind' 
      });
    }
  },

  // HJÆLPE FUNKTION: Hash alle passwords i brugere.js
  hashAllPasswords: async (req, res) => {
    try {
      let updatedCount = 0;
      
      for (let user of users) {
        // Tjek om password allerede er hashet
        const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        
        if (!isPasswordHashed) {
          // Hash password (vi bruger bcrypt men kan ikke dekryptere - dette vil kun virke for testing)
          // Dette er kun til test - i produktion skal du vide passwords
          console.log(`Kan ikke auto-hashe password for ${user.username} uden at kende det`);
        }
      }
      
      res.json({ 
        success: true, 
        message: 'Tjekket alle passwords. For at hashe skal du vide passwords.', 
        usersCount: users.length 
      });
      
    } catch (error) {
      console.error('Hash passwords error:', error);
      res.status(500).json({ success: false, message: 'Fejl ved hashing af passwords' });
    }
  },

  // HJÆLPE FUNKTION: Vis alle brugere (kun for debugging)
  getAllUsers: (req, res) => {
    // Returnerer kun sikker info - aldrig passwords i produktion!
    const safeUsers = users.map(user => ({
      username: user.username,
      email: user.email,
      passwordLength: user.password.length,
      isHashed: user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
    }));
    
    res.json({ 
      success: true, 
      users: safeUsers 
    });
  }
};

module.exports = authController;