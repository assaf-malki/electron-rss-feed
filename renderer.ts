import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { shell } from 'electron';

interface RSSItem {
  title: string;
  link: string;
  guid: string;
  feedTitle: string;
  pubDate: Date;
}

interface FeedConfig {
  url: string;
  maxItems?: number;
}

interface PersistedData {
  itemsByFeed: { [feedUrl: string]: RSSItem[] };
  removedGUIDs: string[];
}

const parser = new DOMParser();
const feedConfigs: FeedConfig[] = [
  { url: 'https://example.com/feed', maxItems: 100 },
  { url: 'https://anotherdomain.com/feed' }, // No maxItems limit means all items are fetched
];
const fetchInterval: number = 60000;
let data: PersistedData = { itemsByFeed: {}, removedGUIDs: [] };
const persistedDataFilePath: string = join(__dirname, 'persistedData.json');

function loadPersistedData(): void {
  try {
    const fileData = readFileSync(persistedDataFilePath, 'utf8');
    data = JSON.parse(fileData);
    Object.keys(data.itemsByFeed).forEach((feed) => {
      data.itemsByFeed[feed] = data.itemsByFeed[feed].map((item) => ({
        ...item,
        pubDate: new Date(item.pubDate),
      }));
    });
  } catch (error) {
    console.error('Error reading from persisted data file:', error);
    data = { itemsByFeed: {}, removedGUIDs: [] };
  }
}

function savePersistedData(): void {
  try {
    writeFileSync(persistedDataFilePath, JSON.stringify(data), 'utf8');
  } catch (error) {
    console.error('Error writing to persisted data file:', error);
  }
}

function displayRSSItems(): void {
  const container = document.querySelector('#feed-container')!;
  container.innerHTML = '';

  const allItems = Object.entries(data.itemsByFeed)
    .flatMap(([feedUrl, items]) => {
      const feedConfig = feedConfigs.find((fc) => fc.url === feedUrl);
      return feedConfig?.maxItems ? items.slice(-feedConfig.maxItems) : items;
    })
    .sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime());

  allItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'rss-card';
    card.innerHTML = `
      <h3>${item.title} (${item.feedTitle})</h3>
      <p><a href="#" class="read-more" data-link="${item.link}" data-guid="${item.guid}">Read More</a></p>
      <button class="remove-btn" data-guid="${item.guid}">Remove</button>
    `;
    container.appendChild(card);
  });

  attachEventListeners();
}

function attachEventListeners(): void {
  document.querySelectorAll('.read-more').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const url = link.getAttribute('data-link')!;
      shell.openExternal(url);
      const guid = link.getAttribute('data-guid')!;
      data.removedGUIDs.push(guid);
      updateItemStorage(guid, true);
    });
  });

  document.querySelectorAll('.remove-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const guid = button.getAttribute('data-guid')!;
      data.removedGUIDs.push(guid);
      updateItemStorage(guid, true);
    });
  });

  const removeAllBtn = document.getElementById('remove-all-btn');
  if (removeAllBtn) {
    removeAllBtn.addEventListener('click', () => {
      Object.values(data.itemsByFeed).forEach((items) => {
        items.forEach((item) => {
          if (!data.removedGUIDs.includes(item.guid)) {
            data.removedGUIDs.push(item.guid);
          }
        });
      });

      Object.keys(data.itemsByFeed).forEach((feedUrl) => {
        data.itemsByFeed[feedUrl] = [];
      });

      savePersistedData();
      displayRSSItems();
    });
  }
}

async function fetchRSSFeed(feedConfig: FeedConfig): Promise<void> {
  const response = await fetch(feedConfig.url);
  const text = await response.text();
  const doc = parser.parseFromString(text, 'application/xml');
  const feedTitle =
    doc.querySelector('channel > title')?.textContent || 'Unknown Feed';

  const existingItems = data.itemsByFeed[feedConfig.url] || [];
  const fetchedItems = Array.from(doc.querySelectorAll('item'))
    .map((rawItem) => ({
      title: rawItem.querySelector('title')?.textContent || 'No Title',
      link: rawItem.querySelector('link')?.textContent || '#',
      guid:
        rawItem.querySelector('guid')?.textContent ||
        rawItem.querySelector('link')?.textContent ||
        'No GUID',
      feedTitle,
      pubDate: new Date(
        rawItem.querySelector('pubDate')?.textContent || new Date()
      ),
    }))
    .filter(
      (item) =>
        !existingItems.some((fItem) => fItem.guid === item.guid) &&
        !data.removedGUIDs.includes(item.guid)
    );

  data.itemsByFeed[feedConfig.url] = [...existingItems, ...fetchedItems];
}

function updateItemStorage(guid: string, remove: boolean): void {
  if (remove) {
    Object.keys(data.itemsByFeed).forEach((feedUrl) => {
      data.itemsByFeed[feedUrl] = data.itemsByFeed[feedUrl].filter(
        (item) => item.guid !== guid
      );
    });
  }
  displayRSSItems();
  savePersistedData();
}

async function updateFeeds(): Promise<void> {
  for (const feedConfig of feedConfigs) {
    await fetchRSSFeed(feedConfig);
  }
  displayRSSItems();
  savePersistedData();
}

loadPersistedData();
displayRSSItems();
setInterval(updateFeeds, fetchInterval);
updateFeeds();
