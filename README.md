# Staff Interview Technical Challenge 

This repository was written by AI. It has a fastify server and a react application.

 [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/fork/github/adamsheffzen/staff-two)
 
## Structure
- `staff-interview-ui/` — React app for the coding challenge UI
- `server/` — Fastify backend for code challenges and code submissions

## Getting Started - run both the server and UI application
```bash
npm run dev
```

## Summary of Application
[written by AI]
This application provides a coding challenge platform where users can submit solutions to various programming exercises. The platform features a clean, modern UI built with React that allows users to view challenge descriptions, write and submit their code solutions, and receive feedback on their submissions. The application maintains a dark theme with a professional color scheme and includes features like syntax highlighting for code input.

The backend, built with Fastify, handles code submissions and stores them in a JSON file. Each submission is tracked with metadata including the user's name, challenge ID, submission timestamp, and the submitted code. The system is designed to allow users to revisit their previous submissions for specific challenges, though this feature appears to have a bug that needs investigation.


## Exercise

- Get the app running and interact with the app before looking at any code.
- Take a brief look at the code to review the implementation.
- There is a broken feature of the application where a user(name) who has submitted code for a challenge should receive back their code on subsequent visits/views of that challenge. Investigate and try to determine why that may be happening. Fix the bug if you can.

- Give some general impressions of the application implementation and discuss any thoughts about improvements for features, code quality, best practices, etc. based on your review.


The React app will be available at [http://localhost:3000](http://localhost:5173) and will communicate with the Fastify backend at [http://localhost:4000](http://localhost:4000).
