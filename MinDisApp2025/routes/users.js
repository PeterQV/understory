const express = require('express');
const router = express.Router();
const users = require('../db/brugere');

/* GET brugere ud fra brugernavn */
router.get('/:username', async (req, res) => {
  const username = req.params.username;
  const user = users.find((u) => u.username === username);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found!' });
  }

  res.json(user);
});

/* POST lav en ny bruger */
router.post('/create', async (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
});

/* GET alle brugere (kun username og email) */
router.get('/', (req, res) => {
  res.json(users.map(u => ({ username: u.username, email: u.email })));
});

/* PUT opdater bruger ud fra brugernavn */
/*router.put('/update/:username', async (req, res) => {
    const username = req.params.username;
    const updatedData = req.body;
    const userIndex = users.findIndex((u) => u.username === username);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found!' });
    }

    users[userIndex] = { ...users[userIndex], ...updatedData };
    res.json(users[userIndex]);
});
*/
/* DELETE slet bruger ud fra brugernavn */
/*router.delete('/delete/:username', async (req, res) => {
    const username = req.params.username;
    const userIndex = users.findIndex((u) => u.username === username);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found!' });
    }

    users.splice(userIndex, 1);
    res.json({ message: 'User deleted!' });
});
*/
module.exports = router;
