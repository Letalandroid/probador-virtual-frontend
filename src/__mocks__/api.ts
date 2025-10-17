// Mock API service for Jest tests
export const apiService = {
  // Auth methods
  login: jest.fn(),
  register: jest.fn(),
  getCurrentUser: jest.fn(),
  logout: jest.fn(),
  updateProfile: jest.fn(),

  // Product methods
  getProducts: jest.fn(),
  getProduct: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),

  // Category methods
  getCategories: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),

  // User management methods
  getUsers: jest.fn(),
  getUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  updateUserRole: jest.fn(),

  // AI methods
  detectTorso: jest.fn(),
  virtualTryOn: jest.fn(),
  analyzeClothingFit: jest.fn(),
  generateMultipleAngles: jest.fn(),
  enhanceImage: jest.fn(),
  checkAiHealth: jest.fn(),
};