# Sophia's Bobyard submission

## Prereqs

- Node 22+

```
nvm install 22
nvm use 22
```

- better-sqlite3 `npm install better-sqlite3`

## Install

1. Run frontend local build
   FE runs on http://localhost:5173

```
cd bobyard/bobyard-fe
npm install
npm run dev
```

2. Run backend local server
   BE runs on http://localhost:3001. On first run, seed data will populate bobyard.db.

```
cd bobyard/bobyard-server
npm install
node server.js
```

## Usage

Current functionality:

- Render all comments
- Add a comment as "Admin" user
  ![alt text](image.png)

## Todo

- Add edit & delete functionality
- Add loading & error states
  - bad response
  - no empty input
- Add pagination
