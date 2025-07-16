#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

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
  section: (msg) => console.log(`\n${colors.bold}${colors.blue}🌐 ${msg}${colors.reset}\n`)
};

class FrontendTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    this.browser = null;
    this.page = null;
  }

  async setup() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set viewport for consistent testing
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`);
      }
    });
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
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

  async goto(path) {
    const url = `${BASE_URL}${path}`;
    try {
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
    } catch (error) {
      if (error.message.includes('timeout')) {
        // Try with domcontentloaded instead
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      } else {
        throw error;
      }
    }
  }

  async testHomePage() {
    log.section('Testing Home Page');

    await this.test('Home page loads successfully', async () => {
      await this.goto('/');
      
      const title = await this.page.title();
      if (!title.includes('DentalCloud')) {
        throw new Error(`Expected title to contain 'DentalCloud', got: ${title}`);
      }

      // Check for main content
      const heading = await this.page.$('h1');
      if (!heading) {
        throw new Error('No h1 heading found on home page');
      }

      const headingText = await this.page.evaluate(el => el.textContent, heading);
      if (!headingText.includes('DentalCloud') && !headingText.includes('стоматологических')) {
        throw new Error(`Expected heading to contain 'DentalCloud' or dental-related text, got: ${headingText}`);
      }
    });

    await this.test('Navigation links are present', async () => {
      await this.goto('/');
      
      // Check for login button/link
      const loginLink = await this.page.$('a[href*="login"]');
      if (!loginLink) {
        throw new Error('No login link found');
      }
    });
  }

  async testAuthPages() {
    log.section('Testing Authentication Pages');

    await this.test('Login page loads and has form', async () => {
      await this.goto('/auth/login');
      
      const title = await this.page.title();
      if (!title.includes('DentalCloud')) {
        throw new Error(`Expected title to contain 'DentalCloud', got: ${title}`);
      }

      // Check for login form elements
      const usernameInput = await this.page.$('input[name="username"], input[type="text"]');
      const passwordInput = await this.page.$('input[name="password"], input[type="password"]');
      const submitButton = await this.page.$('button[type="submit"], input[type="submit"]');

      if (!usernameInput) throw new Error('Username input not found');
      if (!passwordInput) throw new Error('Password input not found');
      if (!submitButton) throw new Error('Submit button not found');
    });

    await this.test('Login form submission works', async () => {
      await this.goto('/auth/login');
      
      // Fill login form
      await this.page.type('input[name="username"], input[type="text"]', 'dental_clinic_1');
      await this.page.type('input[name="password"], input[type="password"]', 'demo123');
      
      // Submit form
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle0' }),
        this.page.click('button[type="submit"], input[type="submit"]')
      ]);

      // Should redirect to dashboard
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/dashboard')) {
        throw new Error(`Expected to redirect to dashboard, but URL is: ${currentUrl}`);
      }
    });
  }

  async testDashboardPages() {
    log.section('Testing Dashboard Pages');

    // Login first
    await this.goto('/auth/login');
    await this.page.type('input[name="username"], input[type="text"]', 'dental_clinic_1');
    await this.page.type('input[name="password"], input[type="password"]', 'demo123');
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle0' }),
      this.page.click('button[type="submit"], input[type="submit"]')
    ]);

    await this.test('Dashboard main page loads', async () => {
      await this.goto('/dashboard');
      
      const title = await this.page.title();
      if (!title.includes('DentalCloud')) {
        throw new Error(`Expected title to contain 'DentalCloud', got: ${title}`);
      }

      // Check for dashboard content
      const heading = await this.page.$('h1, h2');
      if (!heading) {
        throw new Error('No main heading found on dashboard');
      }
    });

    await this.test('Images page loads with list', async () => {
      await this.goto('/dashboard/images');
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for images grid or list
      const imagesContainer = await this.page.$('[class*="grid"], [class*="list"], .images');
      if (!imagesContainer) {
        // Try alternative selectors
        const anyImage = await this.page.$('img, [class*="image"]');
        if (!anyImage) {
          throw new Error('No images container or images found');
        }
      }
    });

    await this.test('Upload page loads with form', async () => {
      await this.goto('/dashboard/images/upload');
      
      // Check for upload form (dropzone creates hidden file input)
      const fileInput = await this.page.$('input[type="file"], input[accept]');
      if (!fileInput) {
        // Try to find dropzone area
        const dropzone = await this.page.$('[class*="dropzone"], [role="button"]');
        if (!dropzone) {
          throw new Error('File input or dropzone not found on upload page');
        }
      }

      // Check for patient name input
      const patientInput = await this.page.$('input[name*="patient"], input[placeholder*="пациент"], input[placeholder*="Patient"]');
      if (!patientInput) {
        throw new Error('Patient name input not found');
      }
    });

    await this.test('Clinics page loads', async () => {
      await this.goto('/dashboard/clinics');
      
      const title = await this.page.title();
      if (!title.includes('DentalCloud')) {
        throw new Error(`Expected title to contain 'DentalCloud', got: ${title}`);
      }
    });

    await this.test('Settings page loads', async () => {
      await this.goto('/dashboard/settings');
      
      const title = await this.page.title();
      if (!title.includes('DentalCloud')) {
        throw new Error(`Expected title to contain 'DentalCloud', got: ${title}`);
      }

      // Check for settings content
      const settingsContent = await this.page.$('form, [class*="setting"], [class*="tab"]');
      if (!settingsContent) {
        throw new Error('No settings content found');
      }
    });
  }

  async testResponsiveDesign() {
    log.section('Testing Responsive Design');

    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await this.test(`${viewport.name} viewport (${viewport.width}x${viewport.height})`, async () => {
        await this.page.setViewport({ width: viewport.width, height: viewport.height });
        
        // Test main pages on different viewports
        const pages = ['/', '/auth/login'];
        
        for (const pagePath of pages) {
          await this.goto(pagePath);
          
          // Check if page content is visible
          const body = await this.page.$('body');
          const bodyBox = await body.boundingBox();
          
          if (!bodyBox || bodyBox.width < viewport.width * 0.8) {
            throw new Error(`Content not properly visible on ${viewport.name} for ${pagePath}`);
          }
        }
      });
    }

    // Reset to default viewport
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  async testErrorPages() {
    log.section('Testing Error Handling');

    await this.test('404 page for non-existent route', async () => {
      try {
        await this.goto('/nonexistent-page');
        
        // Check if we get a proper 404 page or are redirected
        const currentUrl = this.page.url();
        const title = await this.page.title();
        
        // Either should show 404 content or redirect to a valid page
        if (currentUrl.includes('/nonexistent-page')) {
          // Should have 404 content
          const pageText = await this.page.evaluate(() => document.body.textContent);
          if (!pageText.includes('404') && !pageText.includes('Not Found')) {
            throw new Error('404 page should contain error message');
          }
        }
        // If redirected, that's also acceptable behavior
      } catch (error) {
        if (error.message.includes('net::ERR_ABORTED')) {
          // This is expected for 404s
          return;
        }
        throw error;
      }
    });

    await this.test('Protected routes redirect to login', async () => {
      // Clear any existing authentication
      await this.page.deleteCookie();
      
      await this.goto('/dashboard');
      
      // Should redirect to login
      await new Promise(resolve => setTimeout(resolve, 2000));
      const currentUrl = this.page.url();
      
      if (!currentUrl.includes('/auth/login') && !currentUrl.includes('/login')) {
        // Check if we're on a dashboard page with login form/requirement
        const loginForm = await this.page.$('form');
        const loginButton = await this.page.$('button[type="submit"]');
        
        if (!loginForm && !loginButton) {
          throw new Error(`Expected redirect to login or login form on page, but URL is: ${currentUrl}`);
        }
      }
    });
  }

  async testPerformance() {
    log.section('Testing Performance');

    await this.test('Page load performance', async () => {
      const startTime = Date.now();
      await this.goto('/');
      const loadTime = Date.now() - startTime;
      
      if (loadTime > 5000) {
        throw new Error(`Page load time too slow: ${loadTime}ms`);
      }
      
      log.info(`Home page loaded in ${loadTime}ms`);
    });

    await this.test('Images page performance', async () => {
      // Login first
      await this.goto('/auth/login');
      await this.page.type('input[name="username"], input[type="text"]', 'dental_clinic_1');
      await this.page.type('input[name="password"], input[type="password"]', 'demo123');
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle0' }),
        this.page.click('button[type="submit"], input[type="submit"]')
      ]);

      const startTime = Date.now();
      await this.goto('/dashboard/images');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for images to load
      const loadTime = Date.now() - startTime;
      
      if (loadTime > 7000) {
        throw new Error(`Images page load time too slow: ${loadTime}ms`);
      }
      
      log.info(`Images page loaded in ${loadTime}ms`);
    });
  }

  async runAllTests() {
    console.log(`${colors.bold}🚀 Starting comprehensive frontend testing...${colors.reset}\n`);

    try {
      await this.setup();
      
      await this.testHomePage();
      await this.testAuthPages();
      await this.testDashboardPages();
      await this.testResponsiveDesign();
      await this.testErrorPages();
      await this.testPerformance();
      
    } catch (error) {
      log.error(`Test suite failed: ${error.message}`);
    } finally {
      await this.teardown();
    }

    this.printResults();
  }

  printResults() {
    log.section('Frontend Test Results Summary');
    
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
      console.log(`\n${colors.green}${colors.bold}🎉 All frontend tests passed! Your UI is working perfectly!${colors.reset}`);
    } else if (successRate >= 80) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  Most frontend tests passed, but some issues need attention.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bold}❌ Multiple frontend failures detected. UI needs significant fixes.${colors.reset}`);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const fetch = require('node-fetch');
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

  const tester = new FrontendTester();
  await tester.runAllTests();
  
  // Exit with error code if tests failed
  if (tester.results.failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    log.error(`Frontend test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { FrontendTester }; 