// Trie data structure for efficient prefix-based searching
export class TrieNode {
    constructor() {
      this.children = {}
      this.isEndOfWord = false
      this.venues = [] // Store venue references at each node
    }
  }
  
  export class Trie {
    constructor() {
      this.root = new TrieNode()
    }
  
    /**
     * Insert a word into the trie and associate it with a venue
     * @param {string} word - The word to insert
     * @param {object} venue - The venue to associate with this word
     */
    insert(word, venue) {
      let node = this.root
      for (const char of word.toLowerCase()) {
        if (!node.children[char]) node.children[char] = new TrieNode()
        node = node.children[char]
        // Store venue reference at each node in the path
        if (!node.venues.some((v) => v.id === venue.id)) {
          node.venues.push(venue)
        }
      }
      node.isEndOfWord = true
    }
  
    /**
     * Search for venues and suggestions that match a prefix
     * @param {string} prefix - The prefix to search for
     * @returns {object} Object containing matching venues and word suggestions
     */
    search(prefix) {
      let node = this.root
      for (const char of prefix.toLowerCase()) {
        if (!node.children[char]) return { venues: [], suggestions: [] }
        node = node.children[char]
      }
  
      // Get all suggestions starting with this prefix
      const suggestions = []
      const collectWords = (currentNode, path) => {
        if (currentNode.isEndOfWord) suggestions.push(path)
        for (const char in currentNode.children) {
          collectWords(currentNode.children[char], path + char)
        }
      }
      collectWords(node, prefix.toLowerCase())
  
      return {
        venues: node.venues, // Return venues associated with this prefix
        suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
      }
    }
  
    /**
     * Delete a word from the trie
     * @param {string} word - The word to delete
     */
    delete(word) {
      const deleteHelper = (node, word, depth = 0) => {
        // If we've reached the end of the word
        if (depth === word.length) {
          // This node is no longer an end of word
          if (!node.isEndOfWord) return false
          node.isEndOfWord = false
  
          // Return true if this node has no children
          return Object.keys(node.children).length === 0
        }
  
        const char = word[depth].toLowerCase()
        if (!node.children[char]) return false
  
        // If we should delete the child
        const shouldDeleteChild = deleteHelper(node.children[char], word, depth + 1)
  
        if (shouldDeleteChild) {
          delete node.children[char]
          return Object.keys(node.children).length === 0
        }
  
        return false
      }
  
      deleteHelper(this.root, word)
    }
  
    /**
     * Clear all data from the trie
     */
    clear() {
      this.root = new TrieNode()
    }
  
    /**
     * Get all words in the trie
     * @returns {Array} Array of all words in the trie
     */
    getAllWords() {
      const words = []
  
      const traverse = (node, prefix) => {
        if (node.isEndOfWord) {
          words.push(prefix)
        }
  
        for (const char in node.children) {
          traverse(node.children[char], prefix + char)
        }
      }
  
      traverse(this.root, "")
      return words
    }
  }
  