const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');
// http://localhost:5000/
const app = express();

app.use(express.json());
// Static file
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.use(express.static(__dirname));
// app.use(express.static("public"));

app.get("/", (req, res) => {
    const loginPath = path.join(__dirname, 'p2.html');
    res.sendFile(loginPath);
});

app.get("/signup", (req, res) => {
    const loginPath = path.join(__dirname, 'np.html');
    res.sendFile(loginPath);
});


app.post("/signup", async (req, res) => {

    const data = {
        name: req.body.name,
        password: req.body.password
    }

    // Check if the name already exists in the database
    const existingUser = await collection.findOne({ name: data.name });

    if (existingUser) {
        res.send('User already exists. Please choose a different name.');
        return;
    } else {
        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; // Replace the original password with the hashed one

        const userdata = await collection.insertMany(data);
        console.log(userdata);
        const loginPath = path.join(__dirname, 'home.html');
        res.sendFile(loginPath);
        return;
    }

});

// Login user 
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.name });
        if (!check) {
            res.send("User name cannot found")
            return;
        }
        // Compare the hashed password from the database with the plaintext password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.send("wrong Password");
            return;
        }
        else {
            const loginPath = path.join(__dirname, 'home.html');
            res.sendFile(loginPath);
            return;
        }
    }
    catch {
        res.send("wrong Details");
        return;
    }
});




const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});