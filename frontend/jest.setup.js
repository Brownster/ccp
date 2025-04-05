// Mock Vite environment variables
global.import = {};
global.import.meta = { 
  env: { 
    VITE_API_URL: "http://localhost:8000",
    // Add any other environment variables used in your app
    NODE_ENV: "test"
  } 
};

// Used by Jest to resolve modules
Object.defineProperty(global, "__dirname", {
  value: "/home/marc/Documents/github/terraform-cost-complete-final/frontend"
});