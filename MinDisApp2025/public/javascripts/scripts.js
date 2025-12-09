const getUsers = async () => {
  try {
    const response = await fetch("/users");
    const data = await response.json();
    console.log(response);
    console.log(data);
    alert(JSON.stringify(data));
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

const getUser = async (username) => {
  try {
    const response = await fetch(`/users/${username}`);
    const data = await response.json();
    console.log(response);
    console.log(data);
    alert(JSON.stringify(data));
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

// Vis brugernavn på forsiden når siden loader
const displayCurrentUser = async () => {
  const el = document.getElementById('brugernavnDisplay');
  req.session.user = {
  username: user.username,
  email: user.email,
};
  if (!el) return;
  
  try {
    const response = await fetch('/auth/user');
    if (response.ok) {
      const data = await response.json();
      el.textContent = data.user?.username || data.user?.email || 'Bruger'; // Vis brugernavn eller email
    } else {
      el.textContent = 'Ikke logget ind';
      // Redirect til login hvis på beskyttet side
      if (window.location.pathname === '/forside' || window.location.pathname === '/forside.html') {
        window.location.href = '/login.html';
      }
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    el.textContent = 'Fejl';
  }
};

const createUser = () => {
  const form = document.getElementById("opretkonto");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Hent værdier fra alle felter
      const brugernavn = document.getElementById("brugernavn").value;
      const email = document.getElementById("email").value;
      const adgangskode = document.getElementById("adgangskode").value;

      // Brug det nye auth/register endpoint
      fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          brugernavn: brugernavn,
          email: email,
          adgangskode: adgangskode
        }),
      })
      .then(res => res.json())
      .then(data => {
        console.log('Register response:', data);
        if (data.success) {
          alert('Konto oprettet succesfuldt!');
          window.location.href = '/forside';
        } else {
          alert('Fejl: ' + data.message);
        }
      })
      .catch(err => {
        console.error('Error:', err);
        alert('Fejl ved oprettelse af konto');
      });
    });
  }
};

// Initialiser createUser når siden loader
document.addEventListener('DOMContentLoaded', function() {
  createUser();
  setupLoginForm();
  displayCurrentUser();
});

const setCookie = async () => {
  try {
    const response = await fetch("/cookie/set");
    const data = await response.json();
    console.log(response);
    console.log(data);
    alert(data.message);
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
}

const getCookie = async () => {
  try {
    const response = await fetch("/cookie/get");
    const data = await response.json();
    console.log(response);
    console.log(data);
    alert(data.message);
  } catch (error) {
    console.error('Error getting cookie:', error);
  }
}

// Login form håndtering
const setupLoginForm = () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const loginData = {
        brugernavn: formData.get('brugernavn'),
        adgangskode: formData.get('adgangskode')
      };

      try {
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Login lykkedes, redirect til forside
          window.location.href = '/forside';
        } else {
          // Login fejlede, vis fejl
          alert(data.message || 'Login fejlede!');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Der skete en fejl under login!');
      }
    });
  }
}

// Logout funktion
const logout = async () => {
  try {
    const response = await fetch('/auth/logout', {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Logout lykkedes, redirect til forsiden
      window.location.href = '/';
    } else {
      alert('Logout fejlede!');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Der skete en fejl under logout!');
  }
}

// Tillad Enter-tasten til at sende login form
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          loginForm.dispatchEvent(new Event('submit'));
        }
      });
    });
  }
  
  // Tillad Enter-tasten til at sende opret konto form
  const opretForm = document.getElementById('opretkonto');
  if (opretForm) {
    const inputs = opretForm.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          opretForm.dispatchEvent(new Event('submit'));
        }
      });
    });
  }
});