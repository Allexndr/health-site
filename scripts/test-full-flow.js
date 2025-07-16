#!/usr/bin/env node

const { APITester } = require('./test-apis.js');
const fetch = require('node-fetch');

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
  section: (msg) => console.log(`\n${colors.bold}${colors.blue}🔄 ${msg}${colors.reset}\n`)
};

class FullFlowTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
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

  async testCompleteUserFlow() {
    log.section('Testing Complete User Flow');

    // Test 1: Authentication Flow
    await this.test('Complete Authentication Flow', async () => {
      const apiTester = new APITester();
      
      // Test login
      const loginResponse = await apiTester.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'dental_clinic_1',
          password: 'demo123'
        })
      });

      if (loginResponse.status !== 200 || !loginResponse.data.token) {
        throw new Error('Login failed or no token received');
      }

      apiTester.authToken = loginResponse.data.token;

      // Test authenticated request
      const meResponse = await apiTester.request('/auth/me');
      if (meResponse.status !== 200) {
        throw new Error('Authenticated request failed');
      }

      log.info('✓ Login successful, token received, authenticated requests work');
    });

    // Test 2: Image Management Flow
    await this.test('Complete Image Management Flow', async () => {
      const apiTester = new APITester();
      
      // Login first
      const loginResponse = await apiTester.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'dental_clinic_1',
          password: 'demo123'
        })
      });
      apiTester.authToken = loginResponse.data.token;

      // Get initial images count
      const initialListResponse = await apiTester.request('/images/list');
      const initialCount = initialListResponse.data.length;
      log.info(`✓ Initial images count: ${initialCount}`);

      // Upload a new image
      const FormData = require('form-data');
      const testImage = Buffer.from('fake-image-data');
      
      const formData = new FormData();
      formData.append('file', testImage, {
        filename: 'test-flow-image.jpg',
        contentType: 'image/jpeg'
      });
      formData.append('patient_name', 'Test Patient Flow');
      formData.append('patient_id', 'FLOW001');
      formData.append('study_date', '2025-01-16');
      formData.append('modality', 'Test Flow X-Ray');

      const uploadResponse = await fetch('http://localhost:3000/api/images/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${apiTester.authToken}`,
          ...formData.getHeaders() // Important for multipart/form-data
        }
      });

      if (uploadResponse.status !== 200) {
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      log.info(`✓ Image uploaded successfully with ID: ${uploadData.id}`);

      // Verify image appears in list
      const updatedListResponse = await apiTester.request('/images/list');
      const updatedCount = updatedListResponse.data.length;
      
      if (updatedCount !== initialCount + 1) {
        throw new Error(`Expected ${initialCount + 1} images, got ${updatedCount}`);
      }
      log.info(`✓ Image appears in list (count: ${updatedCount})`);

      // Verify image can be retrieved individually
      const imageResponse = await apiTester.request(`/images/${uploadData.id}`);
      if (imageResponse.status !== 200) {
        throw new Error('Could not retrieve uploaded image');
      }
      log.info(`✓ Image can be retrieved individually`);

      // Delete the image
      const deleteResponse = await apiTester.request(`/images/${uploadData.id}`, {
        method: 'DELETE'
      });
      if (deleteResponse.status !== 200) {
        throw new Error('Could not delete image');
      }
      log.info(`✓ Image deleted successfully`);

      // Verify image is removed from list
      const finalListResponse = await apiTester.request('/images/list');
      const finalCount = finalListResponse.data.length;
      
      if (finalCount !== initialCount) {
        throw new Error(`Expected ${initialCount} images after deletion, got ${finalCount}`);
      }
      log.info(`✓ Image removed from list (final count: ${finalCount})`);
    });

    // Test 3: Clinic Management
    await this.test('Clinic Management Flow', async () => {
      const apiTester = new APITester();
      
      // Login
      const loginResponse = await apiTester.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'dental_clinic_1',
          password: 'demo123'
        })
      });
      apiTester.authToken = loginResponse.data.token;

      // Get clinics list
      const clinicsResponse = await apiTester.request('/clinics');
      if (clinicsResponse.status !== 200 || !Array.isArray(clinicsResponse.data)) {
        throw new Error('Could not get clinics list');
      }
      log.info(`✓ Clinics list retrieved (${clinicsResponse.data.length} clinics)`);

      // Get clinic users
      const usersResponse = await apiTester.request('/clinics/1/users');
      if (usersResponse.status !== 200 || !Array.isArray(usersResponse.data)) {
        throw new Error('Could not get clinic users');
      }
      log.info(`✓ Clinic users retrieved (${usersResponse.data.length} users)`);
    });

    // Test 4: Error Handling
    await this.test('Error Handling Flow', async () => {
      const apiTester = new APITester();

      // Test invalid login
      const invalidLoginResponse = await apiTester.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'invalid',
          password: 'invalid'
        })
      });
      if (invalidLoginResponse.status !== 401) {
        throw new Error('Invalid login should return 401');
      }
      log.info(`✓ Invalid login properly rejected`);

      // Test accessing protected resource without auth
      const unauthorizedResponse = await apiTester.request('/auth/me');
      if (unauthorizedResponse.status !== 401) {
        throw new Error('Unauthorized request should return 401');
      }
      log.info(`✓ Unauthorized requests properly rejected`);

      // Test non-existent image
      const notFoundResponse = await apiTester.request('/images/nonexistent');
      if (notFoundResponse.status !== 404) {
        throw new Error('Non-existent image should return 404');
      }
      log.info(`✓ Non-existent resources return 404`);
    });
  }

  async testUploadFlowSimulation() {
    log.section('Testing Upload Flow Simulation');

    await this.test('Simulate Real Upload Workflow', async () => {
      const apiTester = new APITester();
      
      // Step 1: Login as clinic
      log.info('Step 1: Authenticating as dental clinic...');
      const loginResponse = await apiTester.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: 'dental_clinic_1',
          password: 'demo123'
        })
      });
      
      if (loginResponse.status !== 200) {
        throw new Error('Authentication failed');
      }
      apiTester.authToken = loginResponse.data.token;
      log.info('✓ Authentication successful');

      // Step 2: Get current user info
      log.info('Step 2: Getting user information...');
      const userResponse = await apiTester.request('/auth/me');
      if (userResponse.status !== 200) {
        throw new Error('Failed to get user info');
      }
      log.info(`✓ User info retrieved: ${userResponse.data.name}`);

      // Step 3: Check existing images
      log.info('Step 3: Checking existing images...');
      const listResponse = await apiTester.request('/images/list');
      if (listResponse.status !== 200) {
        throw new Error('Failed to get images list');
      }
      const imageCount = listResponse.data.length;
      log.info(`✓ Found ${imageCount} existing images`);

      // Step 4: Upload multiple images (simulating batch upload)
      log.info('Step 4: Uploading multiple patient images...');
      const patients = [
        { name: 'Иванов Петр Сергеевич', id: 'PAT001', modality: 'Панорамный снимок' },
        { name: 'Петрова Анна Михайловна', id: 'PAT002', modality: 'Прицельный снимок' },
        { name: 'Сидоров Алексей Иванович', id: 'PAT003', modality: 'КЛКТ' }
      ];

      const uploadedIds = [];
      for (const patient of patients) {
        const FormData = require('form-data');
        const testImage = Buffer.from(`fake-image-data-${patient.id}`);
        
        const formData = new FormData();
        formData.append('file', testImage, {
          filename: `${patient.id}_${patient.modality.toLowerCase()}.jpg`,
          contentType: 'image/jpeg'
        });
        formData.append('patient_name', patient.name);
        formData.append('patient_id', patient.id);
        formData.append('study_date', '2025-01-16');
        formData.append('modality', patient.modality);

        const uploadResponse = await fetch('http://localhost:3000/api/images/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${apiTester.authToken}`,
            ...formData.getHeaders() // Important for multipart/form-data
          }
        });

        if (uploadResponse.status !== 200) {
          throw new Error(`Failed to upload image for ${patient.name}`);
        }

        const uploadData = await uploadResponse.json();
        uploadedIds.push(uploadData.id);
        log.info(`  ✓ Uploaded ${patient.modality} for ${patient.name} (ID: ${uploadData.id})`);
      }

      // Step 5: Verify all images are in the list
      log.info('Step 5: Verifying all images appear in list...');
      const updatedListResponse = await apiTester.request('/images/list');
      const newImageCount = updatedListResponse.data.length;
      
      if (newImageCount !== imageCount + patients.length) {
        throw new Error(`Expected ${imageCount + patients.length} images, got ${newImageCount}`);
      }
      log.info(`✓ All images appear in list (total: ${newImageCount})`);

      // Step 6: Test viewing each image
      log.info('Step 6: Testing individual image retrieval...');
      for (const imageId of uploadedIds) {
        const imageResponse = await apiTester.request(`/images/${imageId}`);
        if (imageResponse.status !== 200) {
          throw new Error(`Could not retrieve image ${imageId}`);
        }
      }
      log.info(`✓ All ${uploadedIds.length} images can be retrieved individually`);

      // Step 7: Clean up (delete uploaded images)
      log.info('Step 7: Cleaning up uploaded images...');
      for (const imageId of uploadedIds) {
        const deleteResponse = await apiTester.request(`/images/${imageId}`, {
          method: 'DELETE'
        });
        if (deleteResponse.status !== 200) {
          throw new Error(`Could not delete image ${imageId}`);
        }
      }
      log.info(`✓ All ${uploadedIds.length} test images cleaned up`);

      // Step 8: Verify cleanup
      log.info('Step 8: Verifying cleanup...');
      const finalListResponse = await apiTester.request('/images/list');
      const finalImageCount = finalListResponse.data.length;
      
      if (finalImageCount !== imageCount) {
        throw new Error(`Expected ${imageCount} images after cleanup, got ${finalImageCount}`);
      }
      log.info(`✓ System restored to initial state (${finalImageCount} images)`);
    });
  }

  async runAllTests() {
    console.log(`${colors.bold}🚀 Starting comprehensive full-flow testing...${colors.reset}\n`);

    try {
      await this.testCompleteUserFlow();
      await this.testUploadFlowSimulation();
    } catch (error) {
      log.error(`Test suite failed: ${error.message}`);
    }

    this.printResults();
  }

  printResults() {
    log.section('Full Flow Test Results Summary');
    
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
      console.log(`\n${colors.green}${colors.bold}🎉 All full-flow tests passed! Your system is working end-to-end!${colors.reset}`);
    } else if (successRate >= 80) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  Most full-flow tests passed, but some workflows need attention.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bold}❌ Multiple workflow failures detected. System needs significant fixes.${colors.reset}`);
    }
  }
}

// Main execution
async function main() {
  const tester = new FullFlowTester();
  await tester.runAllTests();
  
  // Exit with error code if tests failed
  if (tester.results.failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    log.error(`Full flow test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { FullFlowTester }; 