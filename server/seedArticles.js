import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Inline schema so this script is self-contained
const commentSchema = new mongoose.Schema({
  userid: String,
  username: String,
  body: String,
  createdAt: { type: Date, default: Date.now },
});

const articleSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    summary: String,
    coverImage: String,
    authorName: String,
    authorId: String,
    tags: [String],
    views: { type: Number, default: 0 },
    readTime: Number,
    comments: [commentSchema],
  },
  { timestamps: true }
);

const Article = mongoose.model("article", articleSchema);

const ARTICLES = [
  {
    title: "Understanding JavaScript Closures: A Deep Dive",
    authorName: "Dan Abramov",
    authorId: "seed_author_1",
    coverImage: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&q=80",
    tags: ["javascript", "closures", "functions"],
    views: 4821,
    readTime: 7,
    summary:
      "Closures are one of the most powerful yet misunderstood features of JavaScript. This article breaks them down with real-world examples and explains how they work under the hood.",
    content: `## What is a Closure?

A closure is the combination of a function and the lexical environment within which that function was declared. In simpler terms, a closure gives you access to an outer function's scope from an inner function.

## Why Do Closures Matter?

Closures are fundamental to JavaScript. They power everything from event handlers to module patterns to React hooks. Understanding them makes you a significantly better JavaScript developer.

## A Simple Example

\`\`\`javascript
function makeCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
\`\`\`

Here, the inner function "closes over" the \`count\` variable. Even after \`makeCounter\` has returned, the inner function still has access to \`count\`.

## The Lexical Environment

Every time a function is created in JavaScript, a closure is created. The closure includes:

- The function itself
- A reference to the outer lexical environment

\`\`\`javascript
function outer() {
  const name = "JavaScript";
  
  function inner() {
    console.log(name); // has access to name
  }
  
  return inner;
}

const fn = outer();
fn(); // logs "JavaScript"
\`\`\`

## Practical Use Cases

### 1. Data Privacy / Encapsulation

\`\`\`javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance;
  
  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) {
        return "Insufficient funds";
      }
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(100);
account.deposit(50);   // 150
account.withdraw(30);  // 120
account.getBalance();  // 120
\`\`\`

### 2. Function Factories

\`\`\`javascript
function multiply(x) {
  return function(y) {
    return x * y;
  };
}

const double = multiply(2);
const triple = multiply(3);

double(5); // 10
triple(5); // 15
\`\`\`

### 3. Memoization

\`\`\`javascript
function memoize(fn) {
  const cache = {};
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache[key]) return cache[key];
    cache[key] = fn(...args);
    return cache[key];
  };
}

const expensiveCalc = memoize((n) => {
  console.log("Computing...");
  return n * n;
});

expensiveCalc(10); // Computing... 100
expensiveCalc(10); // 100 (from cache, no log)
\`\`\`

## Common Pitfall: Closures in Loops

\`\`\`javascript
// Bug: all buttons alert "5"
for (var i = 0; i < 5; i++) {
  document.getElementById("btn" + i).onclick = function() {
    alert(i);
  };
}

// Fix: use let (block scoped)
for (let i = 0; i < 5; i++) {
  document.getElementById("btn" + i).onclick = function() {
    alert(i);
  };
}
\`\`\`

## Conclusion

Closures are not magic — they are a natural consequence of how JavaScript handles scope. Once you internalize the concept, you'll start seeing them everywhere and writing more elegant, powerful code.`,
  },
  {
    title: "React Hooks Explained: From useState to useEffect and Beyond",
    authorName: "Kent C. Dodds",
    authorId: "seed_author_2",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
    tags: ["react", "hooks", "javascript", "frontend"],
    views: 6340,
    readTime: 9,
    summary:
      "React Hooks revolutionized how we write React components. This comprehensive guide covers useState, useEffect, useContext, useRef, and custom hooks with practical examples.",
    content: `## Introduction to React Hooks

Hooks were introduced in React 16.8 and allow you to use state and other React features in functional components. Before hooks, you had to use class components for stateful logic.

## useState — Managing Local State

\`\`\`javascript
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev - 1)}>Decrement</button>
    </div>
  );
}
\`\`\`

**Key rule:** Never mutate state directly. Always use the setter function.

## useEffect — Side Effects

\`\`\`javascript
import { useState, useEffect } from "react";

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Runs after every render where userId changes
    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => setUser(data));
      
    // Cleanup function
    return () => {
      console.log("Cleanup on unmount or userId change");
    };
  }, [userId]); // dependency array
  
  if (!user) return <p>Loading...</p>;
  return <p>{user.name}</p>;
}
\`\`\`

### Dependency Array Rules

- **No array** → runs after every render
- **Empty array \`[]\`** → runs once on mount
- **\`[dep1, dep2]\`** → runs when deps change

## useContext — Avoiding Prop Drilling

\`\`\`javascript
const ThemeContext = React.createContext("light");

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
\`\`\`

## useRef — Persistent Mutable Values

\`\`\`javascript
function TextInput() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}
\`\`\`

## useMemo and useCallback — Performance

\`\`\`javascript
// useMemo — memoize expensive calculations
const sortedList = useMemo(() => {
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}, [list]);

// useCallback — memoize functions
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
\`\`\`

## Custom Hooks — Reusable Logic

\`\`\`javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => { setData(data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, [url]);
  
  return { data, loading, error };
}

// Usage
function Posts() {
  const { data, loading, error } = useFetch("/api/posts");
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return data.map(post => <div key={post.id}>{post.title}</div>);
}
\`\`\`

## Rules of Hooks

1. Only call hooks at the **top level** — not inside loops, conditions, or nested functions.
2. Only call hooks from **React function components** or custom hooks.

## Conclusion

Hooks make React components simpler, more reusable, and easier to test. Master these and you'll write cleaner React code every day.`,
  },
  {
    title: "Node.js Event Loop: How Asynchronous JavaScript Actually Works",
    authorName: "Bert Belder",
    authorId: "seed_author_3",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    tags: ["node.js", "javascript", "async", "event-loop"],
    views: 3912,
    readTime: 8,
    summary:
      "The event loop is the secret behind Node.js's non-blocking I/O. This article walks through the call stack, Web APIs, callback queue, and microtask queue with visual explanations.",
    content: `## What is the Event Loop?

Node.js is single-threaded, yet it handles thousands of concurrent connections efficiently. The secret is the event loop — a mechanism that allows Node.js to perform non-blocking I/O operations.

## The Call Stack

JavaScript has a single call stack. When you call a function, it gets pushed onto the stack. When it returns, it gets popped off.

\`\`\`javascript
function greet(name) {
  return "Hello " + name;
}

function main() {
  const result = greet("World");
  console.log(result);
}

main();
// Stack: main → greet → (returns) → console.log → (returns) → main returns
\`\`\`

## Synchronous vs Asynchronous

\`\`\`javascript
console.log("1 - Start");

setTimeout(() => {
  console.log("2 - Timeout callback");
}, 0);

Promise.resolve().then(() => {
  console.log("3 - Promise callback");
});

console.log("4 - End");

// Output:
// 1 - Start
// 4 - End
// 3 - Promise callback  ← microtask queue (runs first)
// 2 - Timeout callback  ← callback queue (runs after)
\`\`\`

## The Event Loop Phases

The Node.js event loop has several phases:

**1. Timers** — executes \`setTimeout\` and \`setInterval\` callbacks

**2. Pending Callbacks** — I/O callbacks deferred to next loop

**3. Idle, Prepare** — internal use only

**4. Poll** — retrieves new I/O events

**5. Check** — \`setImmediate\` callbacks execute here

**6. Close Callbacks** — close event callbacks

## Microtasks vs Macrotasks

\`\`\`javascript
// Macrotasks: setTimeout, setInterval, setImmediate, I/O
// Microtasks: Promise.then, queueMicrotask, process.nextTick

setTimeout(() => console.log("timeout"), 0);       // macrotask
setImmediate(() => console.log("immediate"));       // macrotask
Promise.resolve().then(() => console.log("promise")); // microtask
process.nextTick(() => console.log("nextTick"));    // microtask (runs first!)

// Output:
// nextTick
// promise
// timeout (or immediate, order varies)
\`\`\`

**Rule:** Microtasks always run before the next macrotask.

## Practical Example: File Reading

\`\`\`javascript
const fs = require("fs");

console.log("Start");

fs.readFile("file.txt", "utf8", (err, data) => {
  // This runs in the Poll phase after file is read
  console.log("File contents:", data);
});

console.log("End");

// Output:
// Start
// End
// File contents: ...
\`\`\`

## async/await Under the Hood

\`\`\`javascript
async function fetchData() {
  console.log("Fetching...");
  const data = await fetch("/api/data");  // pauses here
  console.log("Got data:", data);         // resumes when promise resolves
}

fetchData();
console.log("This runs before Got data");
\`\`\`

\`await\` is syntactic sugar over Promises. It pauses the async function and lets the event loop continue.

## Why This Matters

Understanding the event loop helps you:
- Debug timing issues
- Avoid blocking the main thread
- Write efficient async code
- Understand why callbacks, Promises, and async/await behave differently

## Conclusion

The event loop is the beating heart of Node.js. It's what makes JavaScript's single-threaded nature work for high-concurrency applications. Once you visualize the call stack, callback queue, and microtask queue, async JavaScript becomes intuitive.`,
  },
  {
    title: "Building REST APIs with Node.js and Express: Complete Guide",
    authorName: "Traversy Media",
    authorId: "seed_author_4",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    tags: ["node.js", "express", "api", "rest", "backend"],
    views: 5678,
    readTime: 11,
    summary:
      "A step-by-step guide to building production-ready REST APIs with Node.js and Express. Covers routing, middleware, error handling, authentication, and best practices.",
    content: `## What is a REST API?

REST (Representational State Transfer) is an architectural style for building web services. A REST API uses HTTP methods to perform CRUD operations on resources.

## Setting Up Express

\`\`\`javascript
// Install: npm install express dotenv cors morgan
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
\`\`\`

## HTTP Methods and Routes

\`\`\`javascript
// GET    /users       → get all users
// GET    /users/:id   → get single user
// POST   /users       → create user
// PUT    /users/:id   → update entire user
// PATCH  /users/:id   → update partial user
// DELETE /users/:id   → delete user

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);
\`\`\`

## Controller Pattern

\`\`\`javascript
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
\`\`\`

## Middleware

\`\`\`javascript
// Auth middleware
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not authorized" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid" });
  }
};

// Use on protected routes
router.get("/profile", protect, getProfile);
\`\`\`

## Global Error Handler

\`\`\`javascript
// Add after all routes
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});
\`\`\`

## Query Parameters and Filtering

\`\`\`javascript
export const getAllProducts = async (req, res) => {
  const { page = 1, limit = 10, sort, category } = req.query;
  
  const filter = {};
  if (category) filter.category = category;
  
  const products = await Product.find(filter)
    .sort(sort || "-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit));
    
  const total = await Product.countDocuments(filter);
  
  res.status(200).json({
    data: products,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    total,
  });
};
\`\`\`

## Input Validation

\`\`\`javascript
// npm install express-validator
import { body, validationResult } from "express-validator";

const validateUser = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }).withMessage("Min 6 characters"),
  body("name").notEmpty().withMessage("Name is required"),
];

router.post("/register", validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // proceed with registration
});
\`\`\`

## Best Practices

1. **Use HTTP status codes correctly** — 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error
2. **Version your API** — \`/api/v1/users\`
3. **Never expose sensitive data** — filter out passwords in responses
4. **Rate limiting** — use \`express-rate-limit\`
5. **Use environment variables** — never hardcode secrets
6. **Log everything** — use \`morgan\` or \`winston\`

## Conclusion

Express makes building REST APIs straightforward. The key is organizing your code well — separate routes, controllers, and middleware — so your codebase stays maintainable as it grows.`,
  },
  {
    title: "CSS Grid vs Flexbox: When to Use Which",
    authorName: "Rachel Andrew",
    authorId: "seed_author_5",
    coverImage: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&q=80",
    tags: ["css", "flexbox", "grid", "frontend", "html"],
    views: 4102,
    readTime: 6,
    summary:
      "CSS Grid and Flexbox are both powerful layout tools, but they excel in different scenarios. This article clarifies when to use each one and shows real-world layout examples.",
    content: `## The Short Answer

- **Flexbox** → one-dimensional layouts (row OR column)
- **Grid** → two-dimensional layouts (rows AND columns)

## Flexbox: One Dimension

Flexbox is perfect when you need to align items along a single axis.

\`\`\`css
/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

/* Center anything */
.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* Equal-width columns that wrap */
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.card {
  flex: 1 1 300px; /* grow, shrink, basis */
}
\`\`\`

### Key Flexbox Properties

\`\`\`css
.container {
  display: flex;
  flex-direction: row | column;
  justify-content: flex-start | center | space-between | space-around;
  align-items: stretch | center | flex-start | flex-end;
  flex-wrap: nowrap | wrap;
  gap: 1rem;
}

.item {
  flex: 1;            /* shorthand for flex-grow flex-shrink flex-basis */
  align-self: center; /* override align-items for this item */
  order: 2;           /* reorder items */
}
\`\`\`

## CSS Grid: Two Dimensions

Grid shines when you need to control both rows and columns simultaneously.

\`\`\`css
/* Classic Holy Grail Layout */
.page {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main   aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 60px;
  min-height: 100vh;
}

header { grid-area: header; }
.sidebar { grid-area: sidebar; }
main { grid-area: main; }
aside { grid-area: aside; }
footer { grid-area: footer; }
\`\`\`

\`\`\`css
/* Responsive card grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
\`\`\`

### Key Grid Properties

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;     /* 3 columns */
  grid-template-rows: auto 1fr auto;       /* 3 rows */
  gap: 1rem;                               /* row-gap column-gap */
}

.item {
  grid-column: 1 / 3;    /* span from column line 1 to 3 */
  grid-row: 2 / 4;       /* span from row line 2 to 4 */
}
\`\`\`

## Real-World Decision Guide

| Scenario | Use |
|---|---|
| Navigation bar | Flexbox |
| Centering a single element | Flexbox |
| Page layout (header, sidebar, main, footer) | Grid |
| Card grid with responsive columns | Grid |
| Buttons in a row | Flexbox |
| Dashboard with panels | Grid |
| Form inputs in a row | Flexbox |
| Magazine-style layout | Grid |

## They Work Great Together

\`\`\`css
/* Use Grid for page layout */
.page {
  display: grid;
  grid-template-columns: 250px 1fr;
}

/* Use Flexbox inside grid cells */
.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
\`\`\`

## Conclusion

Don't think of Grid and Flexbox as competing — think of them as complementary. Use Grid for the overall page structure and major section layouts. Use Flexbox for aligning items within those sections. Together they cover every layout scenario you'll encounter.`,
  },
  {
    title: "MongoDB Aggregation Pipeline: A Practical Guide",
    authorName: "MongoDB University",
    authorId: "seed_author_6",
    coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80",
    tags: ["mongodb", "database", "aggregation", "nosql"],
    views: 2890,
    readTime: 8,
    summary:
      "The MongoDB aggregation pipeline is one of its most powerful features. Learn how to use $match, $group, $project, $lookup, and $unwind to transform and analyze your data.",
    content: `## What is the Aggregation Pipeline?

MongoDB's aggregation pipeline lets you process documents through multiple stages, where each stage transforms the documents. Think of it like a factory assembly line where each station does a specific job.

## Basic Syntax

\`\`\`javascript
db.collection.aggregate([
  { $stage1: { ... } },
  { $stage2: { ... } },
  { $stage3: { ... } },
]);
\`\`\`

## The Most Common Stages

### $match — Filter Documents

\`\`\`javascript
// Find all orders over $100 from 2024
{ $match: { 
  amount: { $gt: 100 }, 
  createdAt: { $gte: new Date("2024-01-01") }
}}
\`\`\`

### $group — Group and Aggregate

\`\`\`javascript
// Total sales per category
{ $group: {
  _id: "$category",
  totalSales: { $sum: "$amount" },
  avgSale: { $avg: "$amount" },
  count: { $sum: 1 }
}}
\`\`\`

### $project — Shape the Output

\`\`\`javascript
// Include only certain fields
{ $project: {
  name: 1,
  email: 1,
  fullName: { $concat: ["$firstName", " ", "$lastName"] },
  _id: 0
}}
\`\`\`

### $sort — Sort Results

\`\`\`javascript
{ $sort: { totalSales: -1 } } // descending
\`\`\`

### $limit and $skip — Pagination

\`\`\`javascript
{ $skip: 20 },
{ $limit: 10 }
\`\`\`

### $lookup — Join Collections

\`\`\`javascript
// Join orders with users
{ $lookup: {
  from: "users",
  localField: "userId",
  foreignField: "_id",
  as: "userDetails"
}}
\`\`\`

### $unwind — Flatten Arrays

\`\`\`javascript
// Unwind an array field so each element becomes its own document
{ $unwind: "$tags" }
\`\`\`

## Real-World Example: Sales Report

\`\`\`javascript
db.orders.aggregate([
  // Step 1: Only completed orders from this year
  { $match: { 
    status: "completed",
    createdAt: { $gte: new Date("2024-01-01") }
  }},
  
  // Step 2: Join with products collection
  { $lookup: {
    from: "products",
    localField: "productId",
    foreignField: "_id",
    as: "product"
  }},
  
  // Step 3: Unwind the product array
  { $unwind: "$product" },
  
  // Step 4: Group by category
  { $group: {
    _id: "$product.category",
    totalRevenue: { $sum: { $multiply: ["$quantity", "$product.price"] } },
    totalOrders: { $sum: 1 },
    avgOrderValue: { $avg: "$amount" }
  }},
  
  // Step 5: Sort by revenue
  { $sort: { totalRevenue: -1 } },
  
  // Step 6: Format output
  { $project: {
    category: "$_id",
    totalRevenue: { $round: ["$totalRevenue", 2] },
    totalOrders: 1,
    avgOrderValue: { $round: ["$avgOrderValue", 2] },
    _id: 0
  }}
]);
\`\`\`

## Using with Mongoose

\`\`\`javascript
const result = await Order.aggregate([
  { $match: { status: "completed" } },
  { $group: {
    _id: "$userId",
    totalSpent: { $sum: "$amount" },
    orderCount: { $sum: 1 }
  }},
  { $sort: { totalSpent: -1 } },
  { $limit: 10 }
]);
\`\`\`

## $addFields — Add Computed Fields

\`\`\`javascript
{ $addFields: {
  discountedPrice: { 
    $multiply: ["$price", { $subtract: [1, "$discountRate"] }]
  },
  isExpensive: { $gt: ["$price", 1000] }
}}
\`\`\`

## Tips for Performance

1. **Put $match early** — filter documents before processing
2. **Use indexes** — $match and $sort benefit from indexes
3. **Use $project early** — remove unneeded fields to reduce memory
4. **Avoid $unwind on large arrays** — can explode document count

## Conclusion

The aggregation pipeline is incredibly powerful once you understand how stages chain together. Start simple with $match and $group, then layer in $lookup and $unwind as your needs grow. It can replace complex queries that would require multiple round trips or post-processing in application code.`,
  },
  {
    title: "Git Branching Strategies for Teams: GitFlow, Trunk-Based, and More",
    authorName: "Atlassian Engineering",
    authorId: "seed_author_7",
    coverImage: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80",
    tags: ["git", "github", "devops", "collaboration"],
    views: 3340,
    readTime: 7,
    summary:
      "Choosing the right Git branching strategy is critical for team productivity. This article compares GitFlow, trunk-based development, and GitHub Flow with pros and cons of each.",
    content: `## Why Branching Strategy Matters

Without a clear branching strategy, teams run into merge conflicts, broken deployments, and unclear ownership. A good strategy makes releases predictable and collaboration smooth.

## GitHub Flow — Simple and Fast

Best for: Small teams, continuous deployment, SaaS products.

\`\`\`
main
 └── feature/login-page
 └── fix/navbar-bug
 └── feature/dark-mode
\`\`\`

**Steps:**
1. Branch off \`main\`
2. Make commits
3. Open a Pull Request
4. Review and merge to \`main\`
5. Deploy \`main\` immediately

\`\`\`bash
git checkout -b feature/user-auth
# ... make changes ...
git push origin feature/user-auth
# Open PR → merge → deploy
\`\`\`

**Pros:** Simple, fast, great for CI/CD
**Cons:** Requires good test coverage to deploy safely

## GitFlow — Structured Releases

Best for: Products with scheduled releases, mobile apps, versioned software.

\`\`\`
main          ←─── production releases
develop       ←─── integration branch
 ├── feature/payment
 ├── feature/search
 └── release/2.0.0
      └── hotfix/critical-bug
\`\`\`

**Branch Types:**
- \`main\` — production only
- \`develop\` — integration of features
- \`feature/*\` — new features
- \`release/*\` — release preparation
- \`hotfix/*\` — urgent production fixes

\`\`\`bash
# Start a feature
git checkout -b feature/payment develop

# Finish a feature
git checkout develop
git merge feature/payment
git branch -d feature/payment

# Start a release
git checkout -b release/2.0 develop

# Hotfix
git checkout -b hotfix/critical-bug main
# fix it
git checkout main && git merge hotfix/critical-bug
git checkout develop && git merge hotfix/critical-bug
\`\`\`

**Pros:** Clean history, clear release process
**Cons:** Complex, slow, overkill for small teams

## Trunk-Based Development

Best for: Large teams, Google/Facebook scale, experienced teams.

\`\`\`
main (trunk)
 └── short-lived branches (< 1 day)
\`\`\`

Everyone commits to \`main\` (or very short-lived branches). Feature flags control what's visible to users.

\`\`\`bash
# Branch lives < 24 hours
git checkout -b feat/small-change
# Make small, focused change
git push && create PR → merge same day
\`\`\`

**Pros:** No merge hell, true continuous integration
**Cons:** Requires feature flags, high discipline, strong CI/CD

## Commit Message Best Practices

\`\`\`bash
# Good
git commit -m "feat: add JWT authentication middleware"
git commit -m "fix: resolve race condition in payment processing"
git commit -m "docs: update API endpoint documentation"
git commit -m "refactor: extract user validation into separate module"

# Bad
git commit -m "fix bug"
git commit -m "WIP"
git commit -m "asdfgh"
\`\`\`

Use **Conventional Commits**: \`type(scope): description\`

Types: feat, fix, docs, style, refactor, test, chore

## Protecting Your Main Branch

\`\`\`
GitHub Settings → Branches → Branch protection rules:
✅ Require pull request reviews before merging
✅ Require status checks to pass
✅ Require branches to be up to date
✅ Restrict who can push to matching branches
\`\`\`

## Choosing the Right Strategy

| Team Size | Release Cadence | Recommendation |
|---|---|---|
| 1-5 devs | Continuous | GitHub Flow |
| 5-20 devs | Weekly/monthly | GitFlow |
| 20+ devs | Continuous | Trunk-Based |
| Any | Multiple versions | GitFlow |

## Conclusion

There's no universally "best" branching strategy — it depends on your team size, release cadence, and maturity of your CI/CD pipeline. Start with GitHub Flow, and graduate to GitFlow or Trunk-Based as your team and product grow.`,
  },
  {
    title: "TypeScript for JavaScript Developers: A Practical Introduction",
    authorName: "Anders Hejlsberg",
    authorId: "seed_author_8",
    coverImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
    tags: ["typescript", "javascript", "types", "frontend"],
    views: 5120,
    readTime: 10,
    summary:
      "TypeScript adds static typing to JavaScript, catching errors before runtime. This guide covers types, interfaces, generics, and utility types with practical examples for JS developers.",
    content: `## Why TypeScript?

TypeScript catches bugs at compile time instead of runtime. It also provides excellent IDE support — autocomplete, refactoring, and inline documentation.

\`\`\`javascript
// JavaScript — error only at runtime
function greet(name) {
  return "Hello " + name.toUpperCase();
}
greet(42); // TypeError: name.toUpperCase is not a function (at runtime!)

// TypeScript — error caught at compile time
function greet(name: string): string {
  return "Hello " + name.toUpperCase();
}
greet(42); // Error: Argument of type 'number' is not assignable to parameter of type 'string'
\`\`\`

## Basic Types

\`\`\`typescript
// Primitives
let name: string = "Alice";
let age: number = 30;
let active: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// Tuple — fixed length, fixed types
let point: [number, number] = [10, 20];

// Union types
let id: string | number = "abc123";
id = 123; // also valid

// Literal types
type Direction = "north" | "south" | "east" | "west";
let dir: Direction = "north";

// Any (avoid when possible!)
let data: any = "anything";

// Unknown (safer than any)
let input: unknown = getUserInput();
if (typeof input === "string") {
  console.log(input.toUpperCase()); // safe!
}
\`\`\`

## Interfaces

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;           // optional
  readonly createdAt: Date; // cannot be changed after creation
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  createdAt: new Date(),
};

// Extending interfaces
interface Admin extends User {
  role: "admin" | "superadmin";
  permissions: string[];
}
\`\`\`

## Type Aliases

\`\`\`typescript
type Point = {
  x: number;
  y: number;
};

type ID = string | number;

type Callback = (error: Error | null, data?: string) => void;
\`\`\`

## Functions

\`\`\`typescript
// Parameter and return types
function add(a: number, b: number): number {
  return a + b;
}

// Optional parameters
function greet(name: string, greeting?: string): string {
  return \`\${greeting ?? "Hello"} \${name}\`;
}

// Arrow function types
const multiply = (x: number, y: number): number => x * y;

// Function type
type MathFn = (a: number, b: number) => number;
const divide: MathFn = (a, b) => a / b;
\`\`\`

## Generics — Reusable Typed Functions

\`\`\`typescript
// Without generics — loses type info
function firstItem(arr: any[]): any {
  return arr[0];
}

// With generics — preserves type info
function firstItem<T>(arr: T[]): T {
  return arr[0];
}

const first = firstItem([1, 2, 3]);     // type: number
const name = firstItem(["a", "b"]);     // type: string

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<User>;
type PostsResponse = ApiResponse<Post[]>;
\`\`\`

## Utility Types

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Partial — all properties optional
type PartialUser = Partial<User>;

// Required — all properties required
type RequiredUser = Required<User>;

// Pick — select specific properties
type PublicUser = Pick<User, "id" | "name" | "email">;

// Omit — exclude specific properties
type UserWithoutPassword = Omit<User, "password">;

// Readonly — all properties readonly
type ReadonlyUser = Readonly<User>;

// Record — object with specific key/value types
type UserMap = Record<string, User>;
\`\`\`

## TypeScript with React

\`\`\`typescript
// Component props
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={\`btn btn-\${variant}\`}
  >
    {label}
  </button>
);

// useState with types
const [user, setUser] = useState<User | null>(null);
const [count, setCount] = useState<number>(0);

// Event types
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
\`\`\`

## tsconfig.json Essentials

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
\`\`\`

## Conclusion

TypeScript's type system catches entire classes of bugs before your code even runs. Start by adding types to function parameters and return values, then gradually add interfaces and generics. The investment pays off enormously in larger codebases.`,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Remove existing seed articles to avoid duplicates on re-run
    await Article.deleteMany({ authorId: { $regex: "^seed_author_" } });
    console.log("🗑️  Cleared old seed articles");

    await Article.insertMany(ARTICLES);
    console.log(`🌱 Inserted ${ARTICLES.length} seed articles successfully`);

    await mongoose.disconnect();
    console.log("✅ Done — disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
