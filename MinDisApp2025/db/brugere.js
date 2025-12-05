const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('12345', 12));  // Kopier denne hash
console.log(bcrypt.hashSync('p54321', 12)); // Kopier denne hash

const users = [
    {
        username: "fang2301",
        password: "12345",
        email: "alzifa633@gmail.com"
    },
    {
        username: "caro234",
        password: "p54321",
        email: "ziyundk@hotmail.com"
    }
]

module.exports = users;
