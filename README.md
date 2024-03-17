# Electron RSS Feeder

## Description

Electron RSS Feeder is an Electron application that aggregates and displays content from multiple RSS feeds. Users can view the latest articles from their favorite websites in one place.

## Features

- Aggregates RSS feeds into a single application.
- Customizable feed list with configurable maximum item limits per feed.
- Configurable fetch interval for updating feed content.
- Supports removal of individual or all feed items.
- Integrated with ESLint and Prettier for code quality and formatting.
- Packaged for Windows 64-bit, with potential to expand to other platforms.

## Getting Started

### Prerequisites

- Node.js (Download and install from [Node.js official website](https://nodejs.org/))
- npm (Comes with Node.js installation)

### Installing

1. Clone the repository:

```bash
git clone https://github.com/assaf-malki/electron-rss-feed.git
```

2. Navigate to the project directory:

```bash
cd electron-rss-feed
```

3. Install dependencies:

```bash
npm install
```

### Configuring the Application

- **Feed Configuration**: Update the `feedConfigs` array in `renderer.ts` with the URLs of the RSS feeds you want to follow and set `maxItems` for each feed to limit the number of items fetched.

- **Fetch Interval**: Set `fetchInterval` in `renderer.ts` to adjust the interval (in milliseconds) at which the app fetches new items from the RSS feeds.

### Linting and Formatting

To lint the source code using ESLint:

```bash
npm run lint
```

To format the source code using Prettier:

```bash
npm run format
```

### Building Application

To build the project:

```bash
npm run build
```

### Running the Application

To start the application in development mode, run:

```bash
npm run start
```

### Packaging the Application

To package the application for Windows 64-bit:

```bash
npm run build_app
```

## Built With

- [Electron](https://www.electronjs.org/) - The framework used
- [Node.js](https://nodejs.org/) - Runtime environment
- [ESLint](https://eslint.org/) - For code linting
- [Prettier](https://prettier.io/) - For code formatting

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc
