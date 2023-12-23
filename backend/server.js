const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));
  
const app = express();

app.use(bodyParser.json());

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" } // token will expire in 1 hour
  );

  res.json({ token, username: user.username });
  res.send("Login request received");
});

const bcrypt = require("bcrypt");

app.post("/api/register", async (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  // Check if the username or email already exists
  const existingUser = users.find(
    (u) => u.username === username || u.email === email
  );
  if (existingUser) {
    return res.status(400).json({ error: "Username or email already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user
  const user = {
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
    role: "user",
  };

  // Add the new user to the users array
  users.push(user);

  res.json({
    message: "User registered successfully",
    user: { firstName, lastName, username, email, role: user.role },
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

/* Database Will be added*/
let users = []; // This would typically be a database

const saltRounds = 10;

app.post("/api/users", async (req, res) => {
  const { firstName, lastName, username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = {
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
    role,
  };
  users.push(newUser);
  res.json(newUser);
});

const jwt = require("jsonwebtoken");

const secretKey = "your-secret-key"; // This should be stored securely

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    secretKey
  );
  res.json({ message: "Login successful", token });
});

/* Authentication */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  });
}

// app.use(authenticate);

/* Password Encryption */
const crypto = require("crypto");

let passwordResetTokens = [];

app.post("/api/password-reset-request", (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const token = crypto.randomBytes(20).toString("hex");
  const expires = new Date().getTime() + 3600000; // 1 hour from now
  passwordResetTokens.push({ token, email, expires });

  // Send email to user with the token
  // ...

  res.json({ message: "Password reset email sent" });
});

/*  Password Reset */
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  const passwordResetToken = passwordResetTokens.find((t) => t.token === token);

  if (
    !passwordResetToken ||
    passwordResetToken.expires < new Date().getTime()
  ) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const user = users.find((u) => u.email === passwordResetToken.email);
  user.password = await bcrypt.hash(newPassword, saltRounds);
  res.json({ message: "Password reset successful" });
});

/* Role Based Authorization */
function authorize(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    next();
  };
}

app.get("/api/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome, admin!" });
});

/* User Pagination */
app.get("/api/listUsers", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const end = page * limit;

  const paginatedUsers = users.slice(start, end);
  res.json(paginatedUsers);
});

let emailVerificationTokens = [];

app.post("/api/register", async (req, res) => {
  const { firstName, lastName, username, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = {
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
    role,
    isEmailVerified: false,
  };
  users.push(newUser);

  const token = crypto.randomBytes(20).toString("hex");
  const expires = new Date().getTime() + 3600000; // 1 hour from now
  emailVerificationTokens.push({ token, email, expires });

  // Send email to user with the token
  // ...

  res.json({ message: "Registration successful. Please verify your email." });
});

app.get("/api/verify-email", (req, res) => {
  const { token } = req.query;
  const emailVerificationToken = emailVerificationTokens.find(
    (t) => t.token === token
  );

  if (
    !emailVerificationToken ||
    emailVerificationToken.expires < new Date().getTime()
  ) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const user = users.find((u) => u.email === emailVerificationToken.email);
  user.isEmailVerified = true;
  res.json({ message: "Email verification successful" });
});
/* Update and Delete Users */

// Update user
app.put("/api/users/:username", async (req, res) => {
  const { username } = req.params;
  const { firstName, lastName, email, password, role } = req.body;

  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Hash the new password if it is provided
  if (password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;
  }

  // Update user details
  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.email = email || user.email;
  user.role = role || user.role;

  res.json({ message: "User updated successfully", user });
});

// Delete user
app.delete("/api/users/:username", (req, res) => {
  const { username } = req.params;

  const userIndex = users.findIndex((u) => u.username === username);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users.splice(userIndex, 1);

  res.json({ message: "User deleted successfully" });
});

/* Tasks and Subtasks */
let tasks = [];
let subtasks = [];

app.post("/api/tasks", authenticate, authorize("admin"), (req, res) => {
  const { name, description, dueDate, assignedUser } = req.body;
  const newTask = {
    id: tasks.length + 1,
    name,
    description,
    dueDate,
    assignedUser,
    hasSubtasks: false,
  };
  tasks.push(newTask);
  res.json(newTask);
});

app.post("/api/subtasks", authenticate, authorize("admin"), (req, res) => {
  const { description, isMust, taskId } = req.body;
  const parentTask = tasks.find((t) => t.id === taskId);

  if (!parentTask) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  parentTask.hasSubtasks = true;
  const newSubtask = { id: subtasks.length + 1, description, isMust, taskId };
  subtasks.push(newSubtask);
  res.json(newSubtask);
});

/* Retrieving Tasks and Subtasks */
app.get("/api/tasks", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const sort = req.query.sort;
  const search = req.query.search;

  let filteredTasks = [...tasks];

  if (search) {
    filteredTasks = filteredTasks.filter((task) =>
      task.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (sort) {
    filteredTasks.sort((a, b) => {
      if (a[sort] < b[sort]) return -1;
      if (a[sort] > b[sort]) return 1;
      return 0;
    });
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const selectedTasks = filteredTasks.slice(start, end);

  const tasksWithSubtasks = selectedTasks.map((task) => {
    const taskSubtasks = subtasks.filter(
      (subtask) => subtask.taskId === task.id
    );
    return { ...task, subtasks: taskSubtasks };
  });

  res.json(tasksWithSubtasks);
});
/* Updating Tasks and Subtasks */
app.put("/api/tasks/:id", authenticate, authorize("admin"), (req, res) => {
  const { id } = req.params;
  const { name, description, dueDate, assignedUser } = req.body;

  const task = tasks.find((t) => t.id === parseInt(id));

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  task.name = name || task.name;
  task.description = description || task.description;
  task.dueDate = dueDate || task.dueDate;
  task.assignedUser = assignedUser || task.assignedUser;

  res.json(task);
});

app.put("/api/subtasks/:id", authenticate, authorize("admin"), (req, res) => {
  const { id } = req.params;
  const { description, isMust } = req.body;

  const subtask = subtasks.find((t) => t.id === parseInt(id));

  if (!subtask) {
    return res.status(404).json({ error: "Subtask not found" });
  }

  subtask.description = description || subtask.description;
  subtask.isMust = isMust || subtask.isMust;

  res.json(subtask);
});

/* Deleting Tasks and Subtasks */
app.delete("/api/tasks/:id", authenticate, authorize("admin"), (req, res) => {
  const { id } = req.params;

  const taskIndex = tasks.findIndex((t) => t.id === parseInt(id));

  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(taskIndex, 1);

  res.json({ message: "Task deleted successfully" });
});

app.delete(
  "/api/subtasks/:id",
  authenticate,
  authorize("admin"),
  (req, res) => {
    const { id } = req.params;

    const subtaskIndex = subtasks.findIndex((t) => t.id === parseInt(id));

    if (subtaskIndex === -1) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    subtasks.splice(subtaskIndex, 1);

    res.json({ message: "Subtask deleted successfully" });
  }
);
