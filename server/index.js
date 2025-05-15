import Fastify from 'fastify';
import cors from '@fastify/cors';
import fs from 'fs';

const SUBMISSIONS_FILE = './submissions.json';
const PORT = 4000;

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });

const challenges = [
  {
    id: 'sum-integers',
    title: 'Sum Two Integers',
    description: 'Create a function that receives two variables and returns their sum. It should throw an error if it does not receive the required arguments or they are not integers.',
    difficulty: 'easy',
  },
  {
    id: 'reverse-string',
    title: 'Reverse a String',
    description: 'Write a function that takes a string and returns it reversed.',
    difficulty: 'easy',
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    description: 'Write a function that prints the numbers from 1 to 100. But for multiples of three print "Fizz" instead of the number and for the multiples of five print "Buzz". For numbers which are multiples of both three and five print "FizzBuzz".',
    difficulty: 'easy',
  },
  {
    id: 'palindrome',
    title: 'Palindrome Check',
    description: 'Write a function that checks if a given string is a palindrome.',
    difficulty: 'medium',
  },
  {
    id: 'anagram',
    title: 'Anagram Detection',
    description: 'Write a function that checks if two strings are anagrams of each other.',
    difficulty: 'medium',
  },
  {
    id: 'array-chunk',
    title: 'Array Chunking',
    description: 'Write a function that splits an array into chunks of a given size.',
    difficulty: 'medium',
  },
  {
    id: 'max-depth',
    title: 'Maximum Depth of Nested Array',
    description: 'Write a function that returns the maximum depth of a nested array.',
    difficulty: 'hard',
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    description: 'Design and implement a Least Recently Used (LRU) cache.',
    difficulty: 'hard',
  },
  {
    id: 'debounce',
    title: 'Debounce Function',
    description: 'Implement a debounce function in JavaScript.',
    difficulty: 'hard',
  },
  {
    id: 'deep-equal',
    title: 'Deep Equality',
    description: 'Write a function that checks for deep equality between two objects.',
    difficulty: 'hard',
  },
];

function readSubmissions() {
  if (!fs.existsSync(SUBMISSIONS_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf-8'));
}

function writeSubmissions(submissions) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

// Get a random challenge (optionally by difficulty)
fastify.get('/challenges', async (req, reply) => {
  const { difficulty } = req.query;
  let filtered = challenges;
  if (difficulty) {
    filtered = challenges.filter(c => c.difficulty === difficulty);
  }
  if (filtered.length === 0) {
    return reply.status(404).send({ error: 'No challenges found for this difficulty' });
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  reply.send(random);
});

// For backward compatibility: returns a random challenge
fastify.get('/challenge', async (req, reply) => {
  const random = challenges[Math.floor(Math.random() * challenges.length)];
  reply.send(random);
});

// New: Get a random challenge, optionally by difficulty, with schema
fastify.get('/challenge/random', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'], nullable: true },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          difficulty: { type: 'string' },
        },
        required: ['id', 'title', 'description', 'difficulty'],
      },
      404: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        },
        required: ['error']
      }
    }
  }
}, async (req, reply) => {
  const { difficulty } = req.query;
  let filtered = challenges;
  if (difficulty) {
    filtered = challenges.filter(c => c.difficulty === difficulty);
  }
  if (filtered.length === 0) {
    return reply.status(404).send({ error: 'No challenges found for this difficulty' });
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  reply.send(random);
});

fastify.get('/submissions', async (req, reply) => {
  reply.send(readSubmissions());
});

fastify.post('/submit', async (req, reply) => {
  const { code, name, challengeId } = req.body;
  if (!code || !name || !challengeId) {
    return reply.status(400).send({ error: 'Missing code, name, or challengeId' });
  }
  const submissions = readSubmissions();
  const submission = { id: Date.now(), name, code, challengeId, submittedAt: new Date().toISOString() };
  submissions.push(submission);
  writeSubmissions(submissions);
  reply.send({ success: true });
});

// GET /submission: get all or filtered submissions, with optional 'check' param
fastify.get('/submission', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        id: { type: 'string', nullable: true },
        name: { type: 'string', nullable: true },
        challengeId: { type: 'string', nullable: true },
        check: { type: 'boolean', nullable: true },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          submissions: { type: 'array', items: { type: 'object' } },
          validation: { type: 'array', items: { type: 'object' }, nullable: true },
        },
        required: ['submissions'],
      },
      404: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
      },
    },
  },
}, async (req, reply) => {
  const { id, name, challengeId, check } = req.query;
  let submissions = readSubmissions();
  if (id) {
    submissions = submissions.filter(s => String(s.id) === String(id));
  }
  if (name) {
    submissions = submissions.filter(s => s.name === name);
  }
  if (challengeId) {
    submissions = submissions.filter(s => s.challengeId === challengeId);
  }
  let validation = undefined;
  if (check) {
    validation = submissions.map(s => validateSubmission(s));
  }
  // Always return 200 with { submissions: [...] } (even if empty), and optionally validation
  reply.send({ submissions, ...(validation ? { validation } : {}) });
});

// PATCH /submission: update a submission by id, with optional 'check' param
fastify.patch('/submission', {
  schema: {
    body: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        code: { type: 'string', nullable: true },
        name: { type: 'string', nullable: true },
        challengeId: { type: 'string', nullable: true },
      },
      required: ['id'],
      additionalProperties: false,
    },
    querystring: {
      type: 'object',
      properties: {
        check: { type: 'boolean', nullable: true },
      },
      additionalProperties: false,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          submission: { type: 'object' },
          validation: { type: 'object', nullable: true },
        },
        required: ['submission'],
      },
      404: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
      },
    },
  },
}, async (req, reply) => {
  const { id, code, name, challengeId } = req.body;
  const { check } = req.query;
  let submissions = readSubmissions();
  const idx = submissions.findIndex(s => String(s.id) === String(id));
  if (idx === -1) {
    return reply.status(404).send({ error: 'Submission not found' });
  }
  if (code !== undefined) submissions[idx].code = code;
  if (name !== undefined) submissions[idx].name = name;
  if (challengeId !== undefined) submissions[idx].challengeId = challengeId;
  writeSubmissions(submissions);
  let validation = undefined;
  if (check) {
    validation = validateSubmission(submissions[idx]);
  }
  reply.send({ submission: submissions[idx], ...(validation ? { validation } : {}) });
});

function validateSubmission(sub) {
  const errors = [];
  if (!sub.name || typeof sub.name !== 'string' || !sub.name.trim()) {
    errors.push('Name is required');
  }
  if (!sub.code || typeof sub.code !== 'string' || !sub.code.trim()) {
    errors.push('Code is required');
  }
  if (!sub.challengeId || !challenges.find(c => c.id === sub.challengeId)) {
    errors.push('Invalid challengeId');
  }
  return { id: sub.id, valid: errors.length === 0, errors };
}

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
}); 