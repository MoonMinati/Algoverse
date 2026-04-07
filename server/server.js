const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./models/User');
const Algorithm = require('./models/Algorithm');
const ExecutionHistory = require('./models/ExecutionHistory');
const SavedResult = require('./models/SavedResult');

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

app.use(cors());
app.use(express.json());

let dbConnected = false;

const DEFAULT_ALGORITHMS = [
  { name: 'Merge Sort', category: 'Divide & Conquer', complexityTime: 'O(n log n)', complexitySpace: 'O(n)' },
  { name: 'Quick Sort', category: 'Divide & Conquer', complexityTime: 'O(n log n) avg', complexitySpace: 'O(log n)' },
  { name: 'Binary Search', category: 'Divide & Conquer', complexityTime: 'O(log n)', complexitySpace: 'O(1)' },
  { name: 'Heap Sort', category: 'Divide & Conquer', complexityTime: 'O(n log n)', complexitySpace: 'O(1)' },
  { name: 'Fractional Knapsack', category: 'Greedy', complexityTime: 'O(n log n)', complexitySpace: 'O(1)' },
  { name: 'Huffman Coding', category: 'Greedy', complexityTime: 'O(n log n)', complexitySpace: 'O(n)' },
  { name: 'Kruskal', category: 'Greedy', complexityTime: 'O(E log E)', complexitySpace: 'O(V)' },
  { name: 'Prim', category: 'Greedy', complexityTime: 'O(E log V)', complexitySpace: 'O(V)' },
  { name: 'Dijkstra', category: 'Greedy', complexityTime: 'O(E log V)', complexitySpace: 'O(V)' },
  { name: 'Matrix Chain Multiplication', category: 'DP', complexityTime: 'O(n^3)', complexitySpace: 'O(n^2)' },
  { name: '0/1 Knapsack', category: 'DP', complexityTime: 'O(nW)', complexitySpace: 'O(nW)' },
  { name: 'Floyd Warshall', category: 'DP', complexityTime: 'O(V^3)', complexitySpace: 'O(V^2)' },
  { name: 'Multistage Graph', category: 'DP', complexityTime: 'O(V+E)', complexitySpace: 'O(V)' },
  { name: 'N-Queens', category: 'Backtracking', complexityTime: 'O(N!)', complexitySpace: 'O(N)' },
  { name: 'Graph Coloring', category: 'Backtracking', complexityTime: 'Exponential', complexitySpace: 'O(V)' },
  { name: 'Hamiltonian Cycle', category: 'Backtracking', complexityTime: 'Exponential', complexitySpace: 'O(V)' },
  { name: 'Branch & Bound Knapsack', category: 'Backtracking', complexityTime: 'Exponential', complexitySpace: 'O(n)' },
  { name: 'Fibonacci Heap', category: 'Advanced', complexityTime: 'Amortized', complexitySpace: 'O(n)' },
  { name: 'Max Flow', category: 'Advanced', complexityTime: 'O(VE^2)', complexitySpace: 'O(V+E)' },
  { name: 'Approximation Algorithm demo', category: 'Advanced', complexityTime: 'Varies', complexitySpace: 'Varies' },
  { name: 'NP-Complete visualization', category: 'Advanced', complexityTime: 'Varies', complexitySpace: 'Varies' }
];

const connectToMongo = async () => {
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI is not set. Auth and history endpoints will return 503.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    dbConnected = true;
    console.log('Connected to MongoDB');
    await seedAlgorithms();
  } catch (error) {
    dbConnected = false;
    console.log('Failed to connect to MongoDB');
  }
};

const seedAlgorithms = async () => {
  const count = await Algorithm.countDocuments();
  if (count > 0) return;
  await Algorithm.insertMany(DEFAULT_ALGORITHMS);
  console.log('Seeded default algorithms');
};

connectToMongo();

const requireDb = (_req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({ error: 'Database unavailable. Configure MONGODB_URI.' });
  }

  return next();
};

const localAI = {
  explain: (algorithm) =>
    `${algorithm} works by repeatedly applying a clear decision rule to shrink the problem. ` +
    `Track one sample input through each step, then summarize complexity and best-use cases.`,
  code: (algorithm) =>
    [
      `function ${algorithm.replace(/[^a-zA-Z0-9]/g, '')}(input) {`,
      '  // Initialize working structure',
      '  const data = [...input];',
      '  // Apply core algorithm transitions',
      '  // Return final result',
      '  return data;',
      '}'
    ].join('\n'),
  example: (algorithm) =>
    [
      `Example 1 (${algorithm}): input [4, 1, 3], expected output [1, 3, 4].`,
      `Example 2 (${algorithm} edge case): input [7], expected output [7].`
    ].join('\n'),
  video: (algorithm) => [
    `Intro: ${algorithm} solves an optimization or search problem in repeatable steps.`,
    'Step 1: Read input and initialize required structures.',
    'Step 2: Apply the algorithm decision rule on the current state.',
    'Step 3: Update structures and continue until stopping condition.',
    'Step 4: Derive final output from computed state.',
    'Step 5: Summarize time and space complexity.'
  ]
};

const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
};

const complexityHints = {
  'Merge Sort': { time: 'O(n log n)', space: 'O(n)' },
  'Quick Sort': { time: 'O(n log n) avg, O(n^2) worst', space: 'O(log n)' },
  'Binary Search': { time: 'O(log n)', space: 'O(1)' },
  'Heap Sort': { time: 'O(n log n)', space: 'O(1)' },
  'Dijkstra': { time: 'O(E log V)', space: 'O(V)' },
  'Floyd Warshall': { time: 'O(V^3)', space: 'O(V^2)' },
  '0/1 Knapsack': { time: 'O(nW)', space: 'O(nW)' },
  'N-Queens': { time: 'O(N!)', space: 'O(N)' },
  'Graph Coloring': { time: 'Exponential', space: 'O(V)' },
  'Max Flow': { time: 'O(VE^2)', space: 'O(V+E)' }
};

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'Algoverse API', dbConnected });
});

app.get('/api/algorithms', requireDb, async (_req, res) => {
  try {
    const algorithms = await Algorithm.find().sort({ category: 1, name: 1 });
    res.json({ algorithms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch algorithms' });
  }
});

app.post('/api/auth/register', requireDb, async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL === email ? 'admin' : 'user';
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      isVerified: false,
      history: []
    });

    const verifyUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    console.log(`Email verification link for ${email}: ${verifyUrl}`);

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      verificationToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role, isVerified: user.isVerified }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/verify-email', requireDb, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'token is required' });

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(404).json({ error: 'Invalid verification token' });
    user.isVerified = true;
    user.verificationToken = '';
    await user.save();
    return res.json({ ok: true, message: 'Email verified' });
  } catch (error) {
    return res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/auth/login', requireDb, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/history', requireDb, auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('history');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ history: user.history });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.post('/api/history', requireDb, auth, async (req, res) => {
  const { algorithm, operations = 0, executionTimeMs = 0, inputSummary = '' } = req.body;

  if (!algorithm) {
    return res.status(400).json({ error: 'algorithm is required' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.history.push({ algorithm, date: new Date() });
    await user.save();

    await ExecutionHistory.create({
      userId: req.userId,
      algorithm,
      operations,
      executionTimeMs,
      inputSummary
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save history' });
  }
});

app.post('/api/results', requireDb, auth, async (req, res) => {
  const { title, payload } = req.body;
  if (!title || !payload) {
    return res.status(400).json({ error: 'title and payload are required' });
  }

  try {
    await SavedResult.create({ userId: req.userId, title, payload });
    return res.status(201).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save result' });
  }
});

app.get('/api/results', requireDb, auth, async (req, res) => {
  try {
    const results = await SavedResult.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json({ results });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
});

app.get('/api/profile', requireDb, auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username email role isVerified history');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.get('/api/admin/users', requireDb, auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('role');
    req.userRole = user?.role || 'user';
    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin check failed' });
  }
}, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find().select('username email role isVerified createdAt').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/usage', requireDb, auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('role');
    req.userRole = user?.role || 'user';
    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin check failed' });
  }
}, requireAdmin, async (_req, res) => {
  try {
    const recentExecutions = await ExecutionHistory.find().sort({ createdAt: -1 }).limit(10);
    const totalExecutions = await ExecutionHistory.countDocuments();
    return res.json({ totalExecutions, recentExecutions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch usage metrics' });
  }
});

app.post('/api/admin/algorithms', requireDb, auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('role');
    req.userRole = user?.role || 'user';
    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin check failed' });
  }
}, requireAdmin, async (req, res) => {
  const { name, category, complexityTime, complexitySpace, description } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'name and category are required' });
  }

  try {
    await Algorithm.create({ name, category, complexityTime, complexitySpace, description });
    return res.status(201).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add algorithm' });
  }
});

app.post('/api/compare', async (req, res) => {
  const { first, second, firstMs, secondMs, firstOps, secondOps } = req.body;
  if (!first || !second) return res.status(400).json({ error: 'first and second are required' });

  const winner = (firstMs || 0) <= (secondMs || 0) ? first : second;
  return res.json({
    winner,
    first: { name: first, ms: firstMs || 0, ops: firstOps || 0 },
    second: { name: second, ms: secondMs || 0, ops: secondOps || 0 },
    bestUseCase: `${winner} is better for this current input profile.`
  });
});

app.post('/api/explain', async (req, res) => {
  const { algorithm, task = 'explain' } = req.body;

  if (!algorithm) {
    return res.status(400).json({ error: 'algorithm is required' });
  }

  if (task === 'video') {
    return res.json({ explanation: localAI.video(algorithm) });
  }

  if (task === 'code') {
    return res.json({ explanation: localAI.code(algorithm) });
  }

  if (task === 'example') {
    return res.json({ explanation: localAI.example(algorithm) });
  }

  return res.json({ explanation: localAI.explain(algorithm) });
});

app.post('/api/performance', (req, res) => {
  const { algorithm, operations = 0, executionTimeMs = 0 } = req.body;
  if (!algorithm) {
    return res.status(400).json({ error: 'algorithm is required' });
  }

  const hint = complexityHints[algorithm] || { time: 'Varies', space: 'Varies' };
  return res.json({
    algorithm,
    operations,
    executionTimeMs,
    timeComplexity: hint.time,
    spaceComplexity: hint.space
  });
});

app.listen(PORT, () => {
  console.log(`Algoverse server running on port ${PORT}`);
});