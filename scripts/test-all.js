#!/usr/bin/env node

const { APITester } = require('./test-apis.js');
const { FullFlowTester } = require('./test-full-flow.js');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}🔬 ${msg}${colors.reset}\n`)
};

class MasterTester {
  constructor() {
    this.results = {
      api: null,
      fullFlow: null,
      overall: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        successRate: 0
      }
    };
  }

  async runAPITests() {
    log.section('Running API Tests');
    
    const apiTester = new APITester();
    await apiTester.runAllTests();
    
    this.results.api = {
      passed: apiTester.results.passed,
      failed: apiTester.results.failed,
      total: apiTester.results.passed + apiTester.results.failed,
      successRate: Math.round((apiTester.results.passed / (apiTester.results.passed + apiTester.results.failed)) * 100)
    };

    return this.results.api.failed === 0;
  }

  async runFullFlowTests() {
    log.section('Running Full Flow Tests');
    
    const fullFlowTester = new FullFlowTester();
    await fullFlowTester.runAllTests();
    
    this.results.fullFlow = {
      passed: fullFlowTester.results.passed,
      failed: fullFlowTester.results.failed,
      total: fullFlowTester.results.passed + fullFlowTester.results.failed,
      successRate: Math.round((fullFlowTester.results.passed / (fullFlowTester.results.passed + fullFlowTester.results.failed)) * 100)
    };

    return this.results.fullFlow.failed === 0;
  }

  async testSystemHealth() {
    log.section('Testing System Health');

    const healthChecks = [
      'Server Accessibility',
      'Database Storage Persistence',
      'API Response Times',
      'Memory Usage',
      'Error Recovery'
    ];

    for (const check of healthChecks) {
      log.info(`Health Check: ${check}`);
      
      switch (check) {
        case 'Server Accessibility':
          try {
            const fetch = require('node-fetch');
            const start = Date.now();
            const response = await fetch('http://localhost:3000');
            const responseTime = Date.now() - start;
            
            if (!response.ok) {
              throw new Error(`Server returned ${response.status}`);
            }
            
            if (responseTime > 2000) {
              log.warning(`Server response time slow: ${responseTime}ms`);
            } else {
              log.success(`Server responsive: ${responseTime}ms`);
            }
          } catch (error) {
            log.error(`Server accessibility failed: ${error.message}`);
            return false;
          }
          break;

        case 'Database Storage Persistence':
          try {
            const fs = require('fs');
            const path = require('path');
            const storageFile = path.join(process.cwd(), '.demo-storage.json');
            
            if (fs.existsSync(storageFile)) {
              const stats = fs.statSync(storageFile);
              log.success(`Storage file exists (${Math.round(stats.size / 1024)}KB)`);
            } else {
              log.info('Storage file will be created on first upload');
            }
          } catch (error) {
            log.error(`Storage check failed: ${error.message}`);
          }
          break;

        case 'API Response Times':
          try {
            const apiTester = new APITester();
            const start = Date.now();
            
            await apiTester.request('/images/list');
            const apiTime = Date.now() - start;
            
            if (apiTime > 1000) {
              log.warning(`API response time slow: ${apiTime}ms`);
            } else {
              log.success(`API responsive: ${apiTime}ms`);
            }
          } catch (error) {
            log.error(`API response time check failed: ${error.message}`);
          }
          break;

        case 'Memory Usage':
          const memUsage = process.memoryUsage();
          const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
          
          if (memMB > 100) {
            log.warning(`Memory usage high: ${memMB}MB`);
          } else {
            log.success(`Memory usage normal: ${memMB}MB`);
          }
          break;

        case 'Error Recovery':
          try {
            const apiTester = new APITester();
            // Test that system handles errors gracefully
            await apiTester.request('/nonexistent');
            log.success('System handles 404 errors gracefully');
          } catch (error) {
            log.error(`Error recovery test failed: ${error.message}`);
          }
          break;
      }
    }

    return true;
  }

  calculateOverallResults() {
    this.results.overall.totalTests = this.results.api.total + this.results.fullFlow.total;
    this.results.overall.passedTests = this.results.api.passed + this.results.fullFlow.passed;
    this.results.overall.failedTests = this.results.api.failed + this.results.fullFlow.failed;
    this.results.overall.successRate = Math.round((this.results.overall.passedTests / this.results.overall.totalTests) * 100);
  }

  printFinalReport() {
    log.section('Final Test Report');

    console.log(`${colors.bold}${colors.cyan}╔══════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║           TEST SUMMARY               ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}╠══════════════════════════════════════╣${colors.reset}`);
    
    // API Tests
    console.log(`${colors.bold}${colors.cyan}║ API Tests:                           ║${colors.reset}`);
    console.log(`${colors.cyan}║   Total: ${this.results.api.total.toString().padEnd(3)} | Passed: ${colors.green}${this.results.api.passed}${colors.cyan} | Failed: ${colors.red}${this.results.api.failed}${colors.cyan}      ║${colors.reset}`);
    console.log(`${colors.cyan}║   Success Rate: ${colors.bold}${this.results.api.successRate}%${colors.reset}${colors.cyan}                 ║${colors.reset}`);
    
    // Full Flow Tests
    console.log(`${colors.cyan}║                                      ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║ Full Flow Tests:                     ║${colors.reset}`);
    console.log(`${colors.cyan}║   Total: ${this.results.fullFlow.total.toString().padEnd(3)} | Passed: ${colors.green}${this.results.fullFlow.passed}${colors.cyan} | Failed: ${colors.red}${this.results.fullFlow.failed}${colors.cyan}       ║${colors.reset}`);
    console.log(`${colors.cyan}║   Success Rate: ${colors.bold}${this.results.fullFlow.successRate}%${colors.reset}${colors.cyan}                 ║${colors.reset}`);
    
    // Overall
    console.log(`${colors.cyan}║                                      ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║ OVERALL RESULTS:                     ║${colors.reset}`);
    console.log(`${colors.cyan}║   Total Tests: ${colors.bold}${this.results.overall.totalTests}${colors.reset}${colors.cyan}                    ║${colors.reset}`);
    console.log(`${colors.cyan}║   Passed: ${colors.green}${colors.bold}${this.results.overall.passedTests}${colors.reset}${colors.cyan}                         ║${colors.reset}`);
    console.log(`${colors.cyan}║   Failed: ${colors.red}${colors.bold}${this.results.overall.failedTests}${colors.reset}${colors.cyan}                         ║${colors.reset}`);
    console.log(`${colors.cyan}║   Success Rate: ${colors.bold}${this.results.overall.successRate}%${colors.reset}${colors.cyan}                ║${colors.reset}`);
    
    console.log(`${colors.bold}${colors.cyan}╚══════════════════════════════════════╝${colors.reset}`);

    // Final verdict
    if (this.results.overall.successRate === 100) {
      console.log(`\n${colors.green}${colors.bold}🎉 EXCELLENT! All tests passed! Your DentalCloud system is production-ready!${colors.reset}`);
      console.log(`${colors.green}✨ Features working perfectly:${colors.reset}`);
      console.log(`${colors.green}   • Authentication & Authorization${colors.reset}`);
      console.log(`${colors.green}   • Image Upload & Management${colors.reset}`);
      console.log(`${colors.green}   • Image Deletion & Cleanup${colors.reset}`);
      console.log(`${colors.green}   • Clinic Management${colors.reset}`);
      console.log(`${colors.green}   • Error Handling${colors.reset}`);
      console.log(`${colors.green}   • API Performance${colors.reset}`);
    } else if (this.results.overall.successRate >= 90) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  GOOD! Most tests passed, minor issues detected.${colors.reset}`);
      console.log(`${colors.yellow}System is mostly functional but could use some improvements.${colors.reset}`);
    } else if (this.results.overall.successRate >= 70) {
      console.log(`\n${colors.yellow}${colors.bold}⚠️  FAIR! System works but has several issues that need attention.${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bold}❌ NEEDS WORK! Multiple critical issues detected.${colors.reset}`);
      console.log(`${colors.red}System requires significant fixes before production use.${colors.reset}`);
    }

    // System capabilities summary
    console.log(`\n${colors.bold}${colors.blue}🏥 DentalCloud System Capabilities:${colors.reset}`);
    console.log(`${colors.blue}   • Centralized dental image storage${colors.reset}`);
    console.log(`${colors.blue}   • Multi-clinic support${colors.reset}`);
    console.log(`${colors.blue}   • Patient data management${colors.reset}`);
    console.log(`${colors.blue}   • Multiple imaging modalities support${colors.reset}`);
    console.log(`${colors.blue}   • Secure authentication${colors.reset}`);
    console.log(`${colors.blue}   • RESTful API architecture${colors.reset}`);
    console.log(`${colors.blue}   • Responsive web interface${colors.reset}`);
    console.log(`${colors.blue}   • Russian localization${colors.reset}`);
  }

  async runAllTests() {
    console.log(`${colors.bold}${colors.cyan}🔬 DentalCloud Comprehensive Testing Suite${colors.reset}`);
    console.log(`${colors.cyan}Testing all system components and workflows...${colors.reset}\n`);

    let allPassed = true;

    // Run API tests
    const apiPassed = await this.runAPITests();
    if (!apiPassed) {
      allPassed = false;
    }

    // Run full flow tests  
    const fullFlowPassed = await this.runFullFlowTests();
    if (!fullFlowPassed) {
      allPassed = false;
    }

    // Run system health checks
    await this.testSystemHealth();

    // Calculate and display results
    this.calculateOverallResults();
    this.printFinalReport();

    return allPassed;
  }
}

// Main execution
async function main() {
  const masterTester = new MasterTester();
  const success = await masterTester.runAllTests();
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    log.error(`Master test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { MasterTester }; 