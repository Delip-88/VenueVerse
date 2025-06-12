// Trie data structure for efficient prefix-based searching and recommendations
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.venues = [];
  }
}

// Binary Search Utility
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  target = target.toLowerCase();

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midVal = arr[mid].toLowerCase();

    if (midVal === target) return true;
    if (midVal < target) left = mid + 1;
    else right = mid - 1;
  }

  return false;
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, venue) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
      if (!node.venues.some((v) => v.id === venue.id)) {
        node.venues.push(venue);
      }
    }
    node.isEndOfWord = true;
  }

  search(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children[char]) return { venues: [], suggestions: [] };
      node = node.children[char];
    }

    const suggestions = [];
    const collectWords = (currentNode, path) => {
      if (currentNode.isEndOfWord) suggestions.push(path);
      for (const char in currentNode.children) {
        collectWords(currentNode.children[char], path + char);
      }
    };
    collectWords(node, prefix.toLowerCase());

    return {
      venues: node.venues,
      suggestions: suggestions.slice(0, 5),
    };
  }
}

export class VenueTrie extends Trie {
  constructor(globalCategories = []) {
    super();
    this.allowedCategories = globalCategories.sort(); // Ensure sorted
  }

  indexVenue(venue) {
    this.insert(venue.name, venue);

    if (venue.location?.city) this.insert(venue.location.city, venue);
    if (venue.location?.province) this.insert(venue.location.province, venue);

    if (Array.isArray(venue.categories)) {
      venue.categories.forEach((category) => {
        if (binarySearch(this.allowedCategories, category)) {
          this.insert(category, venue);
        }
      });
    } else if (venue.category) {
      if (binarySearch(this.allowedCategories, venue.category)) {
        this.insert(venue.category, venue);
      }
    }

    venue.services?.forEach((service) => {
      if (service.serviceId?.name) {
        this.insert(service.serviceId.name, venue);
      }
    });
  }

  indexVenues(venues) {
    venues.forEach((venue) => this.indexVenue(venue));
  }

  findSimilarVenues(venue, allVenues, limit = 3) {
    const trie = new VenueTrie(this.allowedCategories);
    trie.indexVenues(allVenues);

    const matches = new Map();

    if (Array.isArray(venue.categories)) {
      venue.categories.forEach((category) => {
        const results = trie.search(category).venues;
        results.forEach((v) => {
          if (v.id !== venue.id) {
            const currentScore = matches.get(v.id)?.score || 0;
            matches.set(v.id, { venue: v, score: currentScore + 3 });
          }
        });
      });
    } else if (venue.category) {
      const results = trie.search(venue.category).venues;
      results.forEach((v) => {
        if (v.id !== venue.id) {
          const currentScore = matches.get(v.id)?.score || 0;
          matches.set(v.id, { venue: v, score: currentScore + 3 });
        }
      });
    }

    if (venue.location?.city) {
      const results = trie.search(venue.location.city).venues;
      results.forEach((v) => {
        if (v.id !== venue.id) {
          const currentScore = matches.get(v.id)?.score || 0;
          matches.set(v.id, { venue: v, score: currentScore + 2 });
        }
      });
    }

    if (venue.services && venue.services.length > 0) {
      venue.services.forEach((service) => {
        if (service.serviceId?.name) {
          const results = trie.search(service.serviceId.name).venues;
          results.forEach((v) => {
            if (v.id !== venue.id) {
              const currentScore = matches.get(v.id)?.score || 0;
              matches.set(v.id, { venue: v, score: currentScore + 1 });
            }
          });
        }
      });
    }

    return Array.from(matches.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.venue);
  }
}
