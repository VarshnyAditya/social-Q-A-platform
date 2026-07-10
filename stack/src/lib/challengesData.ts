// Static/sample data for the Challenges feature.
// No backend or database — this file is the single source of truth.

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Challenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  tags: string[];
  problemStatement: string;
  sampleInput: string;
  sampleOutput: string;
}

export const challenges: Challenge[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    description: "Find two numbers in an array that add up to a target value.",
    tags: ["array", "hashmap"],
    problemStatement:
      "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume each input has exactly one solution, and you may not use the same element twice.",
    sampleInput: "nums = [2, 7, 11, 15], target = 9",
    sampleOutput: "[0, 1]",
  },
  {
    id: "reverse-linked-list",
    title: "Reverse a Linked List",
    difficulty: "Easy",
    description: "Reverse a singly linked list in place, iteratively or recursively.",
    tags: ["linked-list", "recursion"],
    problemStatement:
      "Given the head of a singly linked list, reverse the list and return the new head. Try to solve it both iteratively (O(1) space) and recursively.",
    sampleInput: "head = [1, 2, 3, 4, 5]",
    sampleOutput: "[5, 4, 3, 2, 1]",
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Check whether a string of brackets is balanced and correctly nested.",
    tags: ["stack", "string"],
    problemStatement:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Brackets must close in the correct order.",
    sampleInput: 's = "{[()]}"',
    sampleOutput: "true",
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    description: "Search a sorted array for a target value in O(log n) time.",
    tags: ["array", "binary-search"],
    problemStatement:
      "Given a sorted array of distinct integers nums and a target value, return the index of target if it exists, otherwise return -1. Your solution must run in O(log n) time.",
    sampleInput: "nums = [-1, 0, 3, 5, 9, 12], target = 9",
    sampleOutput: "4",
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description: "Find the length of the longest substring with no repeated characters.",
    tags: ["string", "sliding-window"],
    problemStatement:
      "Given a string s, find the length of the longest substring without repeating characters. Aim for an O(n) sliding-window solution.",
    sampleInput: 's = "abcabcbb"',
    sampleOutput: "3",
  },
  {
    id: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    description: "Group a list of strings into sets of anagrams.",
    tags: ["array", "hashmap", "string"],
    problemStatement:
      "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    sampleInput: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]',
    sampleOutput: '[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]',
  },
  {
    id: "course-schedule",
    title: "Course Schedule",
    difficulty: "Medium",
    description: "Determine if all courses can be finished given prerequisite pairs.",
    tags: ["graph", "topological-sort"],
    problemStatement:
      "There are numCourses courses labeled 0 to numCourses - 1. Given an array of prerequisite pairs, determine if it's possible to finish all courses (i.e. the prerequisite graph has no cycle).",
    sampleInput: "numCourses = 2, prerequisites = [[1, 0]]",
    sampleOutput: "true",
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    difficulty: "Hard",
    description: "Design a Least Recently Used cache with O(1) get and put operations.",
    tags: ["design", "hashmap", "linked-list"],
    problemStatement:
      "Design a data structure that follows the Least Recently Used (LRU) cache eviction policy. Implement get(key) and put(key, value) so that both run in O(1) average time.",
    sampleInput: "capacity = 2; put(1,1); put(2,2); get(1); put(3,3); get(2)",
    sampleOutput: "get(1) -> 1, get(2) -> -1 (evicted)",
  },
  {
    id: "median-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description: "Find the median of two sorted arrays in logarithmic time.",
    tags: ["array", "binary-search", "divide-and-conquer"],
    problemStatement:
      "Given two sorted arrays nums1 and nums2 of size m and n, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    sampleInput: "nums1 = [1, 3], nums2 = [2]",
    sampleOutput: "2.0",
  },
  {
    id: "word-ladder",
    title: "Word Ladder",
    difficulty: "Hard",
    description: "Find the shortest transformation sequence between two words.",
    tags: ["graph", "bfs", "string"],
    problemStatement:
      "Given two words beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, changing only one letter at a time, with every intermediate word in wordList.",
    sampleInput:
      'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
    sampleOutput: "5",
  },
];

export const getChallengeById = (id: string) =>
  challenges.find((c) => c.id === id);
