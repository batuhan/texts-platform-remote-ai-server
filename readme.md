# Platform Remote AI Playground Server

This is the server side code of the remote AI Playground platform integration for Texts. 

Built with https://github.com/batuhan/texts-platform-remote-server-boilerplate

Client side code at https://github.com/batuhan/texts-platform-ai-playground-remote

## Prerequisites

Before you begin. ensure you have the following installed.

- [Node.js](https://nodejs.org/en)

## How to install

- Clone this repository and navigate into the project directory:
```bash
git clone https://github.com/batuhan/texts-platform-remote-ai-server.git && cd texts-platform-remote-ai-server
```
- Create an .env file with the following for a postgres db
```
DATABASE_URL=
PORT=
```
- Install dependencies and build the project:
```bash
npm install
npm build
```
- Start the server
```bash
npm start
```

## How It Works

This is a remote experimental implementation of the already existing [AI Playground](https://github.com/batuhan/texts-ai-playground) integration.

Made with [Vercel AI SDK](https://sdk.vercel.ai/docs).

Supports the following models:

- **OpenAI**: GPT 3.5 Turbo, GPT 3.5 Turbo 16K, GPT 4.0, and GPT 3.5 Turbo Instruct
- **Fireworks.ai**: Llama v2 7B Chat, Llama v2 13B, Llama v2 70B Chat, Llama v2 13B Code Instruct, and Llama v2 34B Code Instruct
- **Hugging Face**: OpenAssistant Pythia 12B, Star Coder, and Mistral 7B

## Credits

This integration was built at [Pickled Works](https://pickled.works/) by [@alperdegre](https://github.com/alperdegre/) and it isn't an official integration by Texts.
