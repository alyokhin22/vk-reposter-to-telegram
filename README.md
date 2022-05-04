# VK reposter to telegram

Grabs posts from VK walls and posts them to telegram chat

## How to Install

### Requirements
- Node.JS (with npm and yarn)
- Linux host or WSL (with BASH support)

### Steps
- Clone this repo
- Open the shell and navigate to project folder
- Move _src/config.example.ts_ to _src/config.ts_ and edit it as you need
- Create _src/lastPostedPostsIds.json_ file. Write `{}` to this file (empty JSON object)
- Run `yarn` command to install dependencies
- As you want, you can setup the reverse proxy to this HTTP Server

## How to Run

### In development mode
Run `yarn dev`

### In production mode
Run `yarn build` and then `yarn start`
