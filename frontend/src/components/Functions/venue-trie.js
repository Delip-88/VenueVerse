// Trie data structure for efficient prefix-based searching and recommendations
class TrieNode {
  constructor() {
    this.children = {}; // Child nodes for each character
    this.isEndOfWord = false; // Marks the end of a valid word
    this.venues = []; // Stores venue references for the current node
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Inserts a word and associates it with a venue.
   * @param {string} word - The word to insert.
   * @param {object} venue - The venue to associate with the word.
   */
  insert(word, venue) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
      // Add venue reference if it doesn't already exist
      if (!node.venues.some((v) => v.id === venue.id)) {
        node.venues.push(venue);
      }
    }
    node.isEndOfWord = true;
  }

  /**
   * Searches for venues and suggestions based on a prefix.
   * @param {string} prefix - The prefix to search for.
   * @returns {object} An object containing venues and suggestions.
   */
  search(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children[char]) return { venues: [], suggestions: [] };
      node = node.children[char];
    }

    // Collect suggestions starting with the prefix
    const suggestions = [];
    const collectWords = (currentNode, path) => {
      if (currentNode.isEndOfWord) suggestions.push(path);
      for (const char in currentNode.children) {
        collectWords(currentNode.children[char], path + char);
      }
    };
    collectWords(node, prefix.toLowerCase());

    return {
      venues: node.venues, // Venues associated with the prefix
      suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
    };
  }
}

export class VenueTrie extends Trie {
  /**
   * Indexes a venue with multiple searchable fields.
   * @param {object} venue - The venue to index.
   */
  indexVenue(venue) {
    this.insert(venue.name, venue); // Index by venue name
    if (venue.location?.city) this.insert(venue.location.city, venue); // Index by city
    if (venue.location?.province) this.insert(venue.location.province, venue); // Index by province

    // Index categories
    if (Array.isArray(venue.categories)) {
      venue.categories.forEach((category) => {
        this.insert(category, venue);
      });
    } else if (venue.category) {
      this.insert(venue.category, venue);
    }

    // Index services
    venue.services?.forEach((service) => {
      if (service.serviceId?.name) {
        this.insert(service.serviceId.name, venue);
      }
    });
  }

  /**
   * Bulk indexes multiple venues.
   * @param {Array} venues - Array of venues to index.
   */
  indexVenues(venues) {
    venues.forEach((venue) => this.indexVenue(venue));
  }

  /**
   * Finds similar venues based on categories, location, and services.
   * @param {object} venue - The venue to find similar venues for.
   * @param {Array} allVenues - All available venues.
   * @param {number} limit - Maximum number of similar venues to return.
   * @returns {Array} Array of similar venues.
   */
  findSimilarVenues(venue, allVenues, limit = 3) {
    const trie = new VenueTrie();
    trie.indexVenues(allVenues);

    const matches = new Map();

    // Match venues by categories (highest priority)
    if (Array.isArray(venue.categories) && venue.categories.length > 0) {
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

    // Match venues by city (medium priority)
    if (venue.location?.city) {
      const results = trie.search(venue.location.city).venues;
      results.forEach((v) => {
        if (v.id !== venue.id) {
          const currentScore = matches.get(v.id)?.score || 0;
          matches.set(v.id, { venue: v, score: currentScore + 2 });
        }
      });
    }

    // Match venues by services (lower priority)
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

    // Sort matches by score and return top results
    return Array.from(matches.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.venue);
  }
}
