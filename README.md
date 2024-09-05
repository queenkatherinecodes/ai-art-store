# AI Art Website

This is a proof-of-concept e-commerce store that sells AI generated artwork.

The stack:
- Frontend: React
- Backend: NodeJS
- Tests: Jest, NodeJS

For fun, I've added AI generated "customer" reviews.

## Demo

Click on the thumbnail to see a short demo:

[![Watch the video](https://img.youtube.com/vi/wcxgi5kpqho/0.jpg)](https://www.youtube.com/watch?v=wcxgi5kpqho)


## Prerequisites

Before running this project locally, you need to set up an OpenAI API key:

1. Go to [OpenAI's website](https://openai.com/) and sign up for an account if you haven't already.
2. Navigate to the [API keys page](https://platform.openai.com/account/api-keys) in your account dashboard.
3. Click on "Create new secret key" to generate a new API key.
4. Copy the generated key (make sure to save it securely, as you won't be able to see it again).

## Running Locally

To run this project on your local machine, follow these steps:

### Step 0: Set up the OpenAI API Key

Set the `OPENAI_API_KEY` environment variable to your OpenAI API key:

```bash
export OPENAI_API_KEY='your-api-key-here'
```

### Step 1: Install Dependencies

Run the following command to install all required dependencies:

```bash
npm i
```

### Step 2: Build the Project

Build the project using:

```bash
npm run build
```

### Step 3: Start the Application

Start the application with:

```bash
npm start
```

## Running Tests

### Unit Tests

To run the Jest test suites, use:

```bash
npm test
```

### Server Test Suite

To run the `test.js` file, use:

```bash
node test.js
```
