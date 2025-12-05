const User = require('../routes/users');
const bcrypt = require('bcryptjs');

const authController = {
  // LOGIN
  login: async (req, res) => {
    try {
      const { brugernavn, adgangskode } = req.body;

      // Valider input
      if (!brugernavn || !adgangskode) {
        return res.status(400).json({ 
          success: false, 
          message: 'Brugernavn og adgangskode er påkrævet' 
        });
      }

      // Find bruger
      const user = await User.findByUsername(brugernavn);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Bruger ikke fundet' 
        });
      }

      // Tjek password
      const isValidPassword = await bcrypt.compare(adgangskode, user.Password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Forkert adgangskode' 
        });
      }

      // Opret session
      req.session.user = {
        id: user.USERID,
        fornavn: user.Fornavn,
        efternavn: user.Efternavn,
        email: user.Email
      };

      res.json({ 
        success: true, 
        message: 'Login succesfuld',
        user: req.session.user
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server fejl' 
      });
    }
  },

  // REGISTER (OPRET KONTO)
  // REGISTER (OPRET KONTO)
register: async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    
    const { brugernavn, fornavn, efternavn, email, alder, adgangskode } = req.body;

    // Valider input
    if (!brugernavn || !fornavn || !efternavn || !email || !adgangskode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Alle felter er påkrævet' 
      });
    }

    // 🔴 KONVERTER ALDER TIL NUMBER ELLER NULL
    const alderNumber = alder ? parseInt(alder) : null;
    console.log('Konverteret alder:', alderNumber); // Debug log

    // Tjek om bruger allerede eksisterer
    const existingUser = await User.findByUsername(brugernavn);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'En bruger med dette brugernavn eller email eksisterer allerede' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adgangskode, 12);

    // Opret bruger med konverteret alder
    const newUser = await User.create({
      brugernavn,
      fornavn,
      efternavn,
      email,
      alder: alderNumber, // 🔴 BRUG DEN KONVERTEREDE ALDER
      password: hashedPassword
    });

    console.log('Bruger oprettet:', newUser);

    // Auto-login efter registrering
    req.session.user = {
      id: newUser.id,
      brugernavn: newUser.brugernavn,
      fornavn: newUser.fornavn,
      efternavn: newUser.efternavn,
      email: newUser.email
    };

    res.json({ 
      success: true, 
      message: 'Konto oprettet succesfuldt!',
      user: req.session.user
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Fejl ved oprettelse af konto' 
    });
  }
},

  // LOGOUT
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Logout fejlede' 
        });
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
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: 'Ikke logget ind' });
    }
  }
};

module.exports = authController;