// Trie data structure for efficient prefix-based searching and recommendations

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.venues = [];
  }
}

/**
 * Binary Search Utility
 * Efficiently checks if a target string exists in a sorted array (case-insensitive).
 * Returns true if found, false otherwise.
 * 
 * NOTE: The array must be sorted before using this function.
 * 
 * @param {string[]} arr - Sorted array of strings
 * @param {string} target - Target string to search for
 * @returns {boolean}
 */
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

  // Insert a word and associate it with a venue
  insert(word, venue) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
      // Avoid duplicate venues
      if (!node.venues.some((v) => v.id === venue.id)) {
        node.venues.push(venue);
      }
    }
    node.isEndOfWord = true;
  }

  // Search for venues and suggestions based on prefix
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
  /**
   * @param {string[]} globalCategories - List of allowed categories (will be sorted for binary search)
   */
  constructor(globalCategories = []) {
    super();
    // Ensure allowedCategories is sorted for binary search
    this.allowedCategories = [...globalCategories].sort();
  }

  /**
   * Index a single venue by various attributes.
   * Uses binary search to efficiently check if a category is allowed.
   */
  indexVenue(venue) {
    this.insert(venue.name, venue);

    if (venue.location?.city) this.insert(venue.location.city, venue);
    if (venue.location?.province) this.insert(venue.location.province, venue);

    // Use binary search to check if each category is in allowedCategories
    if (Array.isArray(venue.categories)) {
      venue.categories.forEach((category) => {
        // Efficient O(log n) lookup using binary search
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

  /**
   * Find similar venues based on categories, city, and services.
   * Uses binary search for category matching.
   */
  findSimilarVenues(venue, allVenues, limit = 3) {
    const trie = new VenueTrie(this.allowedCategories);
    trie.indexVenues(allVenues);

    const matches = new Map();

    // Match by categories (using binary search for allowed categories)
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

    // Match by city
    if (venue.location?.city) {
      const results = trie.search(venue.location.city).venues;
      results.forEach((v) => {
        if (v.id !== venue.id) {
          const currentScore = matches.get(v.id)?.score || 0;
          matches.set(v.id, { venue: v, score: currentScore + 2 });
        }
      });
    }

    // Match by services
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
