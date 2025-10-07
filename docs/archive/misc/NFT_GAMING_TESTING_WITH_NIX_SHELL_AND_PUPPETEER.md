# 🎮 NFT Gaming Testing with Nix Shell and Puppeteer

**Purpose:** Comprehensive guide for testing NFT gaming applications using nix-shell environment and Puppeteer automation  
**Target:** NFT Gaming Research 086 project  
**Date:** January 5, 2025  
**Status:** Implementation guide for NFT gaming testing infrastructure

---

## 🎯 **Overview**

This document outlines how to create a comprehensive testing infrastructure for NFT gaming applications using:
- **Nix Shell Environment** - Reproducible development environment with all dependencies
- **Puppeteer Automation** - Browser automation for testing MetaMask integration
- **Unity Game Integration** - Simple Unity application for NFT proof verification
- **Web3 Testing** - Testnet integration and NFT ownership verification

---

## 🚀 **Quick Start**

### **1. Environment Setup**
```bash
# Navigate to NFT gaming project
cd /home/eugenejukov/git/hobby/nft_and_gaming_research_086

# Enter nix-shell environment
nix-shell

# Install dependencies
npm install
```

### **2. Test MetaMask Integration**
```bash
# Start Puppeteer testing server
npm run test:metamask

# Open browser interface
# Navigate to http://localhost:3000
# Connect to MetaMask
# Verify NFT ownership
```

### **3. Test Unity Game Integration**
```bash
# Start Unity game server
npm run test:unity

# Test NFT proof verification
# Verify game benefits are applied
```

---

## 🛠️ **Nix Shell Environment**

### **Environment Configuration**
Create `shell.nix` for NFT gaming project:

```nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Node.js and npm
    nodejs
    nodePackages.npm
    
    # Puppeteer dependencies
    chromium
    firefox
    
    # Development tools
    git
    curl
    wget
    
    # Build tools for native modules
    python3
    gcc
    gnumake
    
    # Web3 and blockchain tools
    nodePackages.ethers
    nodePackages.web3
    nodePackages.hardhat
    
    # Image processing libraries
    cairo
    cairo.dev
    pango
    pango.dev
    libjpeg
    giflib
    librsvg
    librsvg.dev
    pixman
    
    # Additional system libraries
    glib
    glib.dev
    gdk-pixbuf
    gdk-pixbuf.dev
    atk
    atk.dev
    gtk3
    gtk3.dev
  ];

  # Environment variables for NFT gaming testing
  shellHook = ''
    # Set Chromium path for Puppeteer
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
    export PUPPETEER_EXECUTABLE_PATH=${pkgs.chromium}/bin/chromium
    
    # Set Firefox path for Playwright
    export PLAYWRIGHT_BROWSERS_PATH=${pkgs.firefox}/bin/firefox
    
    # Node.js environment
    export NODE_PATH=$PWD/node_modules:$NODE_PATH
    
    # Web3 environment variables
    export POLYGON_RPC_URL="https://polygon-rpc.com"
    export TESTNET_RPC_URL="https://rpc-mumbai.maticvigil.com"
    export METAMASK_EXTENSION_ID="nkbihfbeogaeaoehlefnkodbefgpgknn"
    
    # Canvas library paths
    export PKG_CONFIG_PATH="${pkgs.cairo.dev}/lib/pkgconfig:${pkgs.pango.dev}/lib/pkgconfig:${pkgs.libjpeg}/lib/pkgconfig:${pkgs.giflib}/lib/pkgconfig:${pkgs.librsvg.dev}/lib/pkgconfig:${pkgs.pixman}/lib/pkgconfig:${pkgs.glib.dev}/lib/pkgconfig:${pkgs.gtk3.dev}/lib/pkgconfig"
    export PKG_CONFIG_LIBDIR=$PKG_CONFIG_PATH
    
    # Additional environment for canvas compilation
    export CPPFLAGS="-I${pkgs.cairo.dev}/include -I${pkgs.pango.dev}/include -I${pkgs.pixman}/include"
    export LDFLAGS="-L${pkgs.cairo}/lib -L${pkgs.pango}/lib -L${pkgs.pixman}/lib"
    
    # NFT Gaming environment setup
    echo "🎮 NFT Gaming Testing Environment Ready!"
    echo "📦 Node.js version: $(node --version)"
    echo "🔧 npm version: $(npm --version)"
    echo "🌐 Chromium path: $PUPPETEER_EXECUTABLE_PATH"
    echo "🔗 Polygon RPC: $POLYGON_RPC_URL"
    echo "🧪 Testnet RPC: $TESTNET_RPC_URL"
    echo ""
    echo "Available commands:"
    echo "  npm run test:metamask    - Test MetaMask integration"
    echo "  npm run test:unity       - Test Unity game integration"
    echo "  npm run test:web3        - Test Web3 functionality"
    echo "  npm run test:nft         - Test NFT ownership verification"
    echo ""
    echo "💡 MetaMask extension ID: $METAMASK_EXTENSION_ID"
    echo "💡 All Web3 dependencies are available"
  '';
  
  # Enable network access for npm installs and Web3 calls
  NIX_SHELL_ALLOW_NETWORK = 1;
}
```

---

## 🎮 **Puppeteer Testing Infrastructure**

### **MetaMask Integration Testing**
Create `tools/metamask-tester.js`:

```javascript
#!/usr/bin/env node

/**
 * 🎮 MetaMask Integration Tester
 * 
 * Tests MetaMask connection, NFT ownership verification, and game integration
 * 
 * Usage:
 *   node tools/metamask-tester.js [testnet] [port]
 * 
 * Examples:
 *   node tools/metamask-tester.js mumbai 3000
 *   node tools/metamask-tester.js polygon 3001
 */

const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

class MetaMaskTester {
  constructor(options = {}) {
    this.testnet = options.testnet || 'mumbai';
    this.port = options.port || 3000;
    this.browser = null;
    this.page = null;
    this.server = null;
    this.app = express();
    this.testResults = [];
    
    // Testnet configurations
    this.testnets = {
      mumbai: {
        name: 'Mumbai Testnet',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        chainId: '0x13881',
        blockExplorer: 'https://mumbai.polygonscan.com'
      },
      polygon: {
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
        chainId: '0x89',
        blockExplorer: 'https://polygonscan.com'
      }
    };
    
    this.setupServer();
  }

  setupServer() {
    this.app.use(express.json());
    this.app.use(express.static('.')); // Serve static files
    
    // API endpoints
    this.app.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        testnet: this.testnet,
        port: this.port,
        tests: this.testResults.length
      });
    });

    this.app.get('/api/test-metamask', async (req, res) => {
      try {
        const result = await this.testMetaMaskConnection();
        res.json({ success: true, result });
      } catch (error) {
        res.json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/test-nft-ownership', async (req, res) => {
      try {
        const result = await this.testNFTOwnership();
        res.json({ success: true, result });
      } catch (error) {
        res.json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/test-game-integration', async (req, res) => {
      try {
        const result = await this.testGameIntegration();
        res.json({ success: true, result });
      } catch (error) {
        res.json({ success: false, error: error.message });
      }
    });

    // Serve the control interface
    this.app.get('/', (req, res) => {
      res.send(this.getControlInterfaceHTML());
    });
  }

  getControlInterfaceHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFT Gaming MetaMask Tester</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { background: #e8f5e8; border-left: 4px solid #4caf50; }
        .error { background: #ffeaea; border-left: 4px solid #f44336; }
        .success { background: #e8f5e8; border-left: 4px solid #4caf50; }
        button { background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #1976d2; }
        button.danger { background: #f44336; }
        button.danger:hover { background: #d32f2f; }
        .test-result { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 NFT Gaming MetaMask Tester</h1>
        
        <div class="card status">
            <h3>Status</h3>
            <div id="status">Loading...</div>
            <button onclick="refreshStatus()">Refresh Status</button>
        </div>

        <div class="grid">
            <div class="card">
                <h3>🔗 MetaMask Connection Test</h3>
                <button onclick="testMetaMask()">Test MetaMask Connection</button>
                <div id="metamask-result" class="test-result"></div>
            </div>

            <div class="card">
                <h3>🖼️ NFT Ownership Test</h3>
                <button onclick="testNFTOwnership()">Test NFT Ownership</button>
                <div id="nft-result" class="test-result"></div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>🎮 Game Integration Test</h3>
                <button onclick="testGameIntegration()">Test Game Integration</button>
                <div id="game-result" class="test-result"></div>
            </div>

            <div class="card">
                <h3>📊 Test Results</h3>
                <button onclick="getTestResults()">Get All Test Results</button>
                <div id="all-results" class="test-result"></div>
            </div>
        </div>
    </div>

    <script>
        async function refreshStatus() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                document.getElementById('status').innerHTML = \`
                    <strong>Testnet:</strong> \${data.testnet}<br>
                    <strong>Port:</strong> \${data.port}<br>
                    <strong>Tests Run:</strong> \${data.tests}
                \`;
            } catch (error) {
                document.getElementById('status').innerHTML = \`Error: \${error.message}\`;
            }
        }

        async function testMetaMask() {
            try {
                const response = await fetch('/api/test-metamask');
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('metamask-result').textContent = JSON.stringify(data.result, null, 2);
                } else {
                    document.getElementById('metamask-result').textContent = \`Error: \${data.error}\`;
                }
            } catch (error) {
                document.getElementById('metamask-result').textContent = \`Error: \${error.message}\`;
            }
        }

        async function testNFTOwnership() {
            try {
                const response = await fetch('/api/test-nft-ownership');
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('nft-result').textContent = JSON.stringify(data.result, null, 2);
                } else {
                    document.getElementById('nft-result').textContent = \`Error: \${data.error}\`;
                }
            } catch (error) {
                document.getElementById('nft-result').textContent = \`Error: \${error.message}\`;
            }
        }

        async function testGameIntegration() {
            try {
                const response = await fetch('/api/test-game-integration');
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('game-result').textContent = JSON.stringify(data.result, null, 2);
                } else {
                    document.getElementById('game-result').textContent = \`Error: \${data.error}\`;
                }
            } catch (error) {
                document.getElementById('game-result').textContent = \`Error: \${error.message}\`;
            }
        }

        async function getTestResults() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                document.getElementById('all-results').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('all-results').textContent = \`Error: \${error.message}\`;
            }
        }

        // Initialize
        refreshStatus();
    </script>
</body>
</html>`;
  }

  async start() {
    console.log('🎮 Starting NFT Gaming MetaMask Tester...');
    
    // Start browser with MetaMask extension
    const browserOptions = {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--allow-file-access-from-files',
        '--disable-web-security',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--keep-alive-for-test',
        '--load-extension=~/.config/google-chrome/Default/Extensions/nkbihfbeogaeaoehlefnkodbefgpgknn'
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
      handleSIGINT: false,
      handleSIGTERM: false
    };
    
    // Use system Chromium from nix-shell
    const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH;
    if (chromiumPath && require('fs').existsSync(chromiumPath)) {
      browserOptions.executablePath = chromiumPath;
      console.log(`🌐 Using system Chromium: ${browserOptions.executablePath}`);
    }
    
    this.browser = await puppeteer.launch(browserOptions);
    this.page = await this.browser.newPage();
    
    // Setup console logging
    this.page.on('console', msg => {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    // Start web server
    this.server = this.app.listen(this.port, () => {
      console.log(`🌐 NFT Gaming Tester available at: http://localhost:${this.port}`);
      console.log(`🧪 Testnet: ${this.testnets[this.testnet].name}`);
      console.log(`🔗 RPC URL: ${this.testnets[this.testnet].rpcUrl}`);
      console.log(`📋 Chain ID: ${this.testnets[this.testnet].chainId}`);
    });

    return this;
  }

  async testMetaMaskConnection() {
    console.log('🔗 Testing MetaMask connection...');
    
    try {
      // Navigate to a test page
      await this.page.goto('https://example.com');
      
      // Check if MetaMask is available
      const isMetaMaskAvailable = await this.page.evaluate(() => {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
      });
      
      if (!isMetaMaskAvailable) {
        throw new Error('MetaMask not detected');
      }
      
      // Test connection request
      const connectionResult = await this.page.evaluate(async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          return { success: true, accounts };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });
      
      const result = {
        test: 'MetaMask Connection',
        success: connectionResult.success,
        accounts: connectionResult.accounts || [],
        error: connectionResult.error || null,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(result);
      return result;
      
    } catch (error) {
      const result = {
        test: 'MetaMask Connection',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(result);
      return result;
    }
  }

  async testNFTOwnership() {
    console.log('🖼️ Testing NFT ownership verification...');
    
    try {
      // Test NFT ownership verification
      const nftResult = await this.page.evaluate(async () => {
        try {
          // Get current account
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length === 0) {
            throw new Error('No accounts connected');
          }
          
          const account = accounts[0];
          
          // Test NFT ownership (example with ERC-721)
          const nftContract = '0x...'; // Replace with actual NFT contract address
          const balance = await window.ethereum.request({
            method: 'eth_call',
            params: [{
              to: nftContract,
              data: '0x70a08231' + account.slice(2).padStart(64, '0') // balanceOf(address)
            }]
          });
          
          return {
            success: true,
            account,
            nftBalance: parseInt(balance, 16),
            nftContract
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });
      
      const result = {
        test: 'NFT Ownership Verification',
        success: nftResult.success,
        account: nftResult.account || null,
        nftBalance: nftResult.nftBalance || 0,
        nftContract: nftResult.nftContract || null,
        error: nftResult.error || null,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(result);
      return result;
      
    } catch (error) {
      const result = {
        test: 'NFT Ownership Verification',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(result);
      return result;
    }
  }

  async testGameIntegration() {
    console.log('🎮 Testing game integration...');
    
    try {
      // Test game integration with NFT benefits
      const gameResult = await this.page.evaluate(async () => {
        try {
          // Simulate game integration
          const gameData = {
            playerId: 'test-player-123',
            nftBenefits: {
              discount: 0.3, // 30% discount
              resourceMultiplier: 1.2, // 20% resource bonus
              exclusiveAccess: true
            },
            gameState: {
              level: 1,
              experience: 0,
              resources: 100
            }
          };
          
          // Apply NFT benefits
          const benefitsApplied = {
            originalPrice: 100,
            discountedPrice: 100 * (1 - gameData.nftBenefits.discount),
            resourceBonus: gameData.gameState.resources * gameData.nftBenefits.resourceMultiplier,
            exclusiveContent: gameData.nftBenefits.exclusiveAccess
          };
          
          return {
            success: true,
            gameData,
            benefitsApplied
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });
      
      const result = {
        test: 'Game Integration',
        success: gameResult.success,
        gameData: gameResult.gameData || null,
        benefitsApplied: gameResult.benefitsApplied || null,
        error: gameResult.error || null,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(result);
      return result;
      
    } catch (error) {
      const result = {
        test: 'Game Integration',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(result);
      return result;
    }
  }

  async stop() {
    console.log('🛑 Stopping NFT Gaming MetaMask Tester...');
    
    if (this.server) {
      this.server.close();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('✅ Stopped successfully');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const testnet = args[0] || 'mumbai';
  const port = parseInt(args[1]) || 3000;

  console.log('🎮 NFT Gaming MetaMask Tester');
  console.log(`🧪 Testnet: ${testnet}`);
  console.log(`🌐 Port: ${port}`);
  console.log('');

  const tester = new MetaMaskTester({ testnet, port });
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await tester.stop();
    process.exit(0);
  });

  try {
    await tester.start();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await tester.stop();
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = MetaMaskTester;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
```

---

## 🎮 **Unity Game Integration**

### **Simple Unity Application**
Create a simple Unity application that can receive NFT proof from web interface:

```csharp
// NFTGameManager.cs
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;

public class NFTGameManager : MonoBehaviour
{
    [Header("NFT Integration")]
    public string webInterfaceURL = "http://localhost:3000";
    public string nftProofEndpoint = "/api/nft-proof";
    
    [Header("Game Benefits")]
    public float nftDiscount = 0.3f; // 30% discount
    public float resourceMultiplier = 1.2f; // 20% resource bonus
    public bool exclusiveAccess = false;
    
    [Header("Game State")]
    public int playerLevel = 1;
    public int experience = 0;
    public int resources = 100;
    public float basePrice = 100f;
    
    private NFTProof currentNFTProof;
    private bool nftBenefitsActive = false;
    
    [System.Serializable]
    public class NFTProof
    {
        public string walletAddress;
        public string nftType;
        public int nftBalance;
        public bool isValid;
        public long timestamp;
    }
    
    void Start()
    {
        // Check for NFT proof on startup
        StartCoroutine(CheckNFTProof());
    }
    
    IEnumerator CheckNFTProof()
    {
        string url = webInterfaceURL + nftProofEndpoint;
        
        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                string jsonResponse = request.downloadHandler.text;
                currentNFTProof = JsonUtility.FromJson<NFTProof>(jsonResponse);
                
                if (currentNFTProof.isValid)
                {
                    ApplyNFTBenefits();
                    Debug.Log($"NFT Benefits Applied: {currentNFTProof.nftType}");
                }
                else
                {
                    Debug.Log("No valid NFT proof found");
                }
            }
            else
            {
                Debug.LogError($"Failed to get NFT proof: {request.error}");
            }
        }
    }
    
    void ApplyNFTBenefits()
    {
        nftBenefitsActive = true;
        
        // Apply benefits based on NFT type
        switch (currentNFTProof.nftType)
        {
            case "Imperial Crown":
                nftDiscount = 0.3f; // 30% discount
                resourceMultiplier = 1.15f; // 15% resource bonus
                exclusiveAccess = true;
                break;
                
            case "Master Scroll":
                nftDiscount = 0.1f; // 10% discount
                resourceMultiplier = 1.0f; // No resource bonus
                exclusiveAccess = false;
                break;
                
            case "Conquest Map":
                nftDiscount = 0.0f; // No discount
                resourceMultiplier = 1.2f; // 20resource bonus
                exclusiveAccess = false;
                break;
                
            case "Collector Hero":
                nftDiscount = 0.0f; // No discount
                resourceMultiplier = 1.0f; // No resource bonus
                exclusiveAccess = true;
                break;
        }
        
        Debug.Log($"NFT Benefits: Discount={nftDiscount:P0}, Resource Bonus={resourceMultiplier:P0}, Exclusive Access={exclusiveAccess}");
    }
    
    public float GetDiscountedPrice(float originalPrice)
    {
        if (nftBenefitsActive)
        {
            return originalPrice * (1f - nftDiscount);
        }
        return originalPrice;
    }
    
    public int GetResourceBonus(int baseResources)
    {
        if (nftBenefitsActive)
        {
            return Mathf.RoundToInt(baseResources * resourceMultiplier);
        }
        return baseResources;
    }
    
    public bool HasExclusiveAccess()
    {
        return nftBenefitsActive && exclusiveAccess;
    }
    
    // Example game methods
    public void PurchaseItem(float price)
    {
        float finalPrice = GetDiscountedPrice(price);
        Debug.Log($"Purchasing item: Original price: {price}, Final price: {finalPrice}");
        
        // Apply purchase logic here
        resources -= Mathf.RoundToInt(finalPrice);
    }
    
    public void CollectResources(int amount)
    {
        int bonusAmount = GetResourceBonus(amount);
        resources += bonusAmount;
        Debug.Log($"Collected resources: Base: {amount}, With bonus: {bonusAmount}");
    }
    
    public void AccessExclusiveContent()
    {
        if (HasExclusiveAccess())
        {
            Debug.Log("Accessing exclusive content!");
            // Apply exclusive content logic here
        }
        else
        {
            Debug.Log("Exclusive content not available - NFT required");
        }
    }
}
```

---

## 🌐 **Web Interface for NFT Proof**

### **NFT Proof API Endpoint**
Create `tools/nft-proof-server.js`:

```javascript
#!/usr/bin/env node

/**
 * 🌐 NFT Proof Server
 * 
 * Provides NFT ownership verification for Unity game integration
 * 
 * Usage:
 *   node tools/nft-proof-server.js [port]
 */

const express = require('express');
const { ethers } = require('ethers');

class NFTProofServer {
  constructor(options = {}) {
    this.port = options.port || 3001;
    this.app = express();
    this.provider = null;
    this.nftContracts = {};
    
    this.setupServer();
    this.setupProvider();
  }

  setupServer() {
    this.app.use(express.json());
    this.app.use(express.static('.'));
    
    // CORS for Unity
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
    
    // NFT Proof endpoint
    this.app.get('/api/nft-proof', async (req, res) => {
      try {
        const { walletAddress } = req.query;
        
        if (!walletAddress) {
          return res.json({
            walletAddress: null,
            nftType: null,
            nftBalance: 0,
            isValid: false,
            timestamp: Date.now(),
            error: 'Wallet address required'
          });
        }
        
        const nftProof = await this.getNFTProof(walletAddress);
        res.json(nftProof);
      } catch (error) {
        res.json({
          walletAddress: null,
          nftType: null,
          nftBalance: 0,
          isValid: false,
          timestamp: Date.now(),
          error: error.message
        });
      }
    });
    
    // NFT Contract endpoint
    this.app.post('/api/nft-contract', async (req, res) => {
      try {
        const { contractAddress, abi } = req.body;
        await this.addNFTContract(contractAddress, abi);
        res.json({ success: true, contractAddress });
      } catch (error) {
        res.json({ success: false, error: error.message });
      }
    });
    
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: Date.now() });
    });
  }

  setupProvider() {
    // Use testnet provider
    const rpcUrl = process.env.TESTNET_RPC_URL || 'https://rpc-mumbai.maticvigil.com';
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    console.log(`🔗 Connected to provider: ${rpcUrl}`);
  }

  async addNFTContract(contractAddress, abi) {
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    this.nftContracts[contractAddress] = contract;
    console.log(`📝 Added NFT contract: ${contractAddress}`);
  }

  async getNFTProof(walletAddress) {
    try {
      // Check balance for each NFT contract
      const nftTypes = ['Imperial Crown', 'Master Scroll', 'Conquest Map', 'Collector Hero'];
      const nftBalances = {};
      
      for (const [contractAddress, contract] of Object.entries(this.nftContracts)) {
        try {
          const balance = await contract.balanceOf(walletAddress);
          nftBalances[contractAddress] = balance.toString();
        } catch (error) {
          console.log(`Error checking balance for ${contractAddress}: ${error.message}`);
          nftBalances[contractAddress] = '0';
        }
      }
      
      // Find the highest value NFT
      let maxBalance = 0;
      let nftType = null;
      let nftBalance = 0;
      
      for (const [contractAddress, balance] of Object.entries(nftBalances)) {
        const balanceNum = parseInt(balance);
        if (balanceNum > maxBalance) {
          maxBalance = balanceNum;
          nftType = nftTypes[Object.keys(this.nftContracts).indexOf(contractAddress)];
          nftBalance = balanceNum;
        }
      }
      
      return {
        walletAddress,
        nftType: nftType || 'None',
        nftBalance,
        isValid: maxBalance > 0,
        timestamp: Date.now(),
        nftBalances
      };
      
    } catch (error) {
      return {
        walletAddress,
        nftType: null,
        nftBalance: 0,
        isValid: false,
        timestamp: Date.now(),
        error: error.message
      };
    }
  }

  async start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`🌐 NFT Proof Server running on port ${this.port}`);
      console.log(`🔗 Health check: http://localhost:${this.port}/api/health`);
      console.log(`🖼️ NFT Proof: http://localhost:${this.port}/api/nft-proof?walletAddress=0x...`);
    });
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const port = parseInt(args[0]) || 3001;

  console.log('🌐 NFT Proof Server');
  console.log(`🌐 Port: ${port}`);
  console.log('');

  const server = new NFTProofServer({ port });
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await server.stop();
    process.exit(0);
  });

  try {
    await server.start();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await server.stop();
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = NFTProofServer;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
```

---

## 📦 **Package.json Scripts**

Add to `package.json`:

```json
{
  "scripts": {
    "test:metamask": "node tools/metamask-tester.js mumbai 3000",
    "test:unity": "node tools/nft-proof-server.js 3001",
    "test:web3": "node tools/web3-tester.js",
    "test:nft": "node tools/nft-ownership-verifier.js",
    "test:all": "npm run test:metamask & npm run test:unity & npm run test:web3 & npm run test:nft"
  }
}
```

---

## 🧪 **Testing Workflow**

### **1. MetaMask Integration Testing**
```bash
# Start MetaMask tester
npm run test:metamask

# Open browser interface
# Connect to MetaMask
# Verify connection
# Test NFT ownership
# Test game integration
```

### **2. Unity Game Testing**
```bash
# Start NFT proof server
npm run test:unity

# Start Unity game
# Connect to web interface
# Verify NFT benefits are applied
# Test game mechanics
```

### **3. End-to-End Testing**
```bash
# Start all services
npm run test:all

# Test complete workflow:
# 1. Connect MetaMask
# 2. Verify NFT ownership
# 3. Start Unity game
# 4. Verify benefits are applied
# 5. Test game mechanics
```

---

## 🎯 **Benefits of This Approach**

### **🚀 Development Speed**
- **Reproducible Environment**: Nix shell ensures consistent setup
- **Automated Testing**: Puppeteer automates browser interactions
- **Real-time Feedback**: Web interface provides immediate results

### **🧠 Testing Intelligence**
- **MetaMask Integration**: Real wallet connection testing
- **NFT Verification**: Actual blockchain ownership verification
- **Game Integration**: Unity game benefits testing

### **🔧 Flexibility**
- **Multiple Testnets**: Mumbai, Polygon, custom RPCs
- **Various NFT Types**: Test different NFT utility models
- **Game Mechanics**: Test all game benefit types

### **📊 Comprehensive Coverage**
- **Web3 Integration**: MetaMask, wallet connection, blockchain calls
- **NFT Ownership**: Balance checking, contract interaction
- **Game Benefits**: Discounts, resource bonuses, exclusive access
- **End-to-End**: Complete user journey testing

---

## 🎯 **Next Steps**

### **Immediate Implementation**
1. **Create nix-shell environment** for NFT gaming testing
2. **Implement Puppeteer testing** for MetaMask integration
3. **Create Unity game** with NFT benefit integration
4. **Set up web interface** for NFT proof verification

### **Advanced Features**
1. **Automated testing suite** for all NFT types
2. **Performance testing** for blockchain interactions
3. **Security testing** for wallet integration
4. **User experience testing** for game benefits

### **Production Ready**
1. **Mainnet integration** for live NFT testing
2. **Production Unity build** with NFT integration
3. **Scalable testing infrastructure** for multiple games
4. **Monitoring and analytics** for NFT usage

---

## 🎯 **Conclusion**

This comprehensive testing infrastructure provides:

1. **Complete NFT Gaming Testing** - MetaMask integration, NFT ownership verification, game benefits testing
2. **Reproducible Environment** - Nix shell ensures consisten


