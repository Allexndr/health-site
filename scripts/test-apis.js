#!/usr/bin/env node

const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.blue}🧪 ${msg}${colors.reset}\n`)
};

class APITester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.authToken = null;
  }

  async test(name, testFn) {
    try {
      log.info(`Testing: ${name}`);
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'passed' });
      log.success(`${name} - PASSED`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'failed', error: error.message });
      log.error(`${name} - FAILED: ${error.message}`);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
    };

    const config = {
      method: 'GET',
      headers: defaultHeaders,
      ...options,
      headers: { ...defaultHeaders, ...options.headers }
    };

    const response = await fetch(url, config);
    
    if (!response.ok && response.status !== 404 && response.status !== 401 && response.status !== 400) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let data;
    try {
      // Clone response to avoid "body used already" error
      const responseClone = response.clone();
      data = await responseClone.json();
    } catch {
      try {
        data = await response.text();
      } catch {
        data = null;
      }
    }

    return { status: response.status, data, headers: response.headers };
  }

  async testAuthEndpoints() {
    log.section('Testing Authentication Endpoints');

    // Test login endpoint
    await this.test('POST /api/auth/login - with valid credentials', async () => {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'dental_clinic_1',
          password: 'demo123'
        })
      });

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      if (!response.data.token) {
        throw new Error('No token in response');
      }

      this.authToken = response.data.token;
    });

    // Test login with invalid credentials
    await this.test('POST /api/auth/login - with invalid credentials', async () => {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'invalid',
          password: 'invalid'
        })
      });

      if (response.status !== 401) {
        throw new Error(`Expected 401, got ${response.status}`);
      }
    });

    // Test me endpoint
    await this.test('GET /api/auth/me - with valid token', async () => {
      const response = await this.request('/auth/me');

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      if (!response.data._id) {
        throw new Error('No user ID in response');
      }
    });

    // Test logout endpoint
    await this.test('POST /api/auth/logout', async () => {
      const response = await this.request('/auth/logout', {
        method: 'POST'
      });

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });
  }

  async testImagesEndpoints() {
    log.section('Testing Images Endpoints');

    // Test get images list
    await this.test('GET /api/images/list', async () => {
      const response = await this.request('/images/list');

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      if (!Array.isArray(response.data)) {
        throw new Error('Response should be an array');
      }

      if (response.data.length === 0) {
        throw new Error('Should have at least some mock images');
      }
    });

    // Test upload image
    await this.test('POST /api/images/upload - with file', async () => {
      // Create a simple test file buffer
      const testImage = Buffer.from('fake-image-data');
      
      const formData = new FormData();
      formData.append('file', testImage, {
        filename: 'test-image.jpg',
        contentType: 'image/jpeg'
      });
      formData.append('patient_name', 'Test Patient');
      formData.append('patient_id', 'TEST001');
      formData.append('study_date', '2025-01-16');
      formData.append('modality', 'Test X-Ray');

      const response = await fetch(`${API_BASE}/images/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
        }
      });

      if (response.status !== 200) {
        const errorText = await response.text();
        throw new Error(`Expected 200, got ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (!data.id) {
        throw new Error('No image ID in response');
      }

      // Store the uploaded image ID for deletion test
      this.uploadedImageId = data.id;
    });

    // Test get specific image
    if (this.uploadedImageId) {
      await this.test(`GET /api/images/${this.uploadedImageId}`, async () => {
        const response = await this.request(`/images/${this.uploadedImageId}`);

        if (response.status !== 200) {
          throw new Error(`Expected 200, got ${response.status}`);
        }

        if (response.data.id !== this.uploadedImageId) {
          throw new Error('Returned image ID does not match requested ID');
        }
      });

      // Test delete image
      await this.test(`DELETE /api/images/${this.uploadedImageId}`, async () => {
        const response = await this.request(`/images/${this.uploadedImageId}`, {
          method: 'DELETE'
        });

        if (response.status !== 200) {
          throw new Error(`Expected 200, got ${response.status}`);
        }

        if (!response.data.message) {
          throw new Error('No success message in response');
        }
      });

      // Verify image was deleted
      await this.test(`GET /api/images/${this.uploadedImageId} - after deletion`, async () => {
        const response = await this.request(`/images/${this.uploadedImageId}`);

        if (response.status !== 404) {
          throw new Error(`Expected 404, got ${response.status}`);
        }
      });
    }
  }

  async testClinicsEndpoints() {
    log.section('Testing Clinics Endpoints');

    await this.test('GET /api/clinics', async () => {
      const response = await this.request('/clinics');

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      if (!Array.isArray(response.data)) {
        throw new Error('Response should be an array');
      }
    });

    // Test clinic users endpoint
    await this.test('GET /api/clinics/1/users', async () => {
      const response = await this.request('/clinics/1/users');

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }

      if (!Array.isArray(response.data)) {
        throw new Error('Response should be an array');
      }
    });
  }

  async testErrorHandling() {
    log.section('Testing Error Handling');

    // Test 404 endpoints
    await this.test('GET /api/nonexistent - should return 404', async () => {
      const response = await this.request('/nonexistent');

      if (response.status !== 404) {
        throw new Error(`Expected 404, got ${response.status}`);
      }
    });

    // Test malformed requests
    await this.test('POST /api/images/upload - without file', async () => {
      const response = await this.request('/images/upload', {
        method: 'POST',
        body: JSON.stringify({})
      });

      if (response.status !== 400) {
        // Log the actual response for debugging
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        throw new Error(`Expected 400, got ${response.status}`);
      }
    });
  }

  async runAllTests() {
    console.log(`${colors.bold}🚀 Starting comprehensive API testing...${colors.reset}\n`);

    try {
      await this.testAuthEndpoints();
      await this.testImagesEndpoints();
      await this.testClinicsEndpoints();
      await this.testErrorHandling();
    } catch (error) {
      log.error(`Test suite failed: ${error.message}`);
    }

    this.printResults();
  }

  printResults() {
    log.section('Test Results Summary');
    
    console.log(`${colors.bold}Total Tests: ${this.results.passed + this.results.failed}${colors.reset}`);
    console.log(`${colors.green}Passed: ${this.results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${this.results.failed}${colors.reset}`);
    
    const successRate = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
    console.log(`${colors.bold}Success Rate: ${successRate}%${colors.reset}`);

    if (this.results.failed > 0) {
      console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
      this.results.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }

    if (successRate === 100) {
      console.log(`\n${colors.green}${colors.bold}🎉 All tests passed! Your API is working perfectly!${colors.reset}`);
    } else if (successRate >= 80) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  Most tests passed, but some issues need attention.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bold}❌ Multiple failures detected. API needs significant fixes.${colors.reset}`);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('Server not responding properly');
    }
    log.success('Server is running and accessible');
    return true;
  } catch (error) {
    log.error(`Server check failed: ${error.message}`);
    log.warning('Make sure the development server is running: npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  if (!(await checkServer())) {
    process.exit(1);
  }

  const tester = new APITester();
  await tester.runAllTests();
  
  // Exit with error code if tests failed
  if (tester.results.failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    log.error(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { APITester }; 