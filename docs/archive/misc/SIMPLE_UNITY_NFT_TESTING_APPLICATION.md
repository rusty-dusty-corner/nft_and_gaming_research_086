# 🎮 Simple Unity NFT Testing Application

**Purpose:** Minimal Unity application for testing NFT functionality without a full game  
**Target:** NFT Gaming Research 086 project  
**Date:** January 5, 2025  
**Status:** Implementation guide for NFT testing harness

---

## 🎯 **Overview**

This document outlines how to create a simple Unity application that serves as a **testing harness** for NFT functionality:
- **No Full Game** - Just a simple interface to test NFT integration
- **Web Server Connection** - Connect to simple server for NFT proof verification
- **NFT Benefits Testing** - Test all NFT utility functions without game complexity
- **Internal Testing** - Focus on functionality rather than gameplay

---

## 🚀 **Quick Start**

### **1. Unity Project Setup**
```bash
# Create new Unity project
# File -> New Project -> 2D Template
# Name: "NFT Testing Harness"

# Install required packages
# Window -> Package Manager -> Install:
# - Unity Web Request
# - JSON Utility (built-in)
```

### **2. Simple Server Setup**
```bash
# Start NFT proof server
npm run test:unity

# Server runs on http://localhost:3001
# Provides NFT proof verification API
```

### **3. Unity Testing**
```bash
# Open Unity project
# Play the scene
# Test NFT connection and benefits
```

---

## 🎮 **Unity Application Structure**

### **Minimal Scene Setup**
```
Scene: NFTTestingScene
├── Canvas (UI Canvas)
│   ├── ConnectionPanel (Wallet connection)
│   ├── NFTStatusPanel (NFT ownership display)
│   ├── BenefitsPanel (NFT benefits testing)
│   └── TestButtonsPanel (Testing controls)
├── NFTManager (Main testing script)
└── Camera (Simple camera for UI)
```

### **Core Components**
- **NFTManager** - Main testing script
- **ConnectionUI** - Wallet connection interface
- **NFTStatusUI** - NFT ownership display
- **BenefitsTester** - NFT benefits testing
- **TestLogger** - Test results logging

---

## 🛠️ **NFT Testing Manager**

### **Main Testing Script**
```csharp
// NFTTestingManager.cs
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;
using System.Collections;

public class NFTTestingManager : MonoBehaviour
{
    [Header("Server Configuration")]
    public string serverURL = "http://localhost:3001";
    public string nftProofEndpoint = "/api/nft-proof";
    
    [Header("UI References")]
    public Button connectButton;
    public Button testBenefitsButton;
    public Text statusText;
    public Text nftStatusText;
    public Text benefitsText;
    
    [Header("NFT Testing")]
    public string testWalletAddress = "0x..."; // Test wallet address
    private NFTProof currentNFTProof;
    private bool isConnected = false;
    
    void Start()
    {
        SetupUI();
        StartCoroutine(CheckServerConnection());
    }
    
    void SetupUI()
    {
        connectButton.onClick.AddListener(ConnectToWallet);
        testBenefitsButton.onClick.AddListener(TestNFTBenefits);
        
        statusText.text = "Ready to test NFT functionality";
        nftStatusText.text = "No NFT connection";
        benefitsText.text = "No benefits active";
    }
}
```

### **NFT Proof Data Structure**
```csharp
[System.Serializable]
public class NFTProof
{
    public string walletAddress;
    public string nftType;
    public int nftBalance;
    public bool isValid;
    public long timestamp;
    public string error;
}
```

---

## 🔗 **Wallet Connection Testing**

### **Connection Flow**
1. **Server Check** - Verify server is running
2. **Wallet Address** - Get wallet address (manual input for testing)
3. **NFT Proof Request** - Request NFT ownership verification
4. **Benefits Application** - Apply NFT benefits if valid

### **Connection Implementation**
```csharp
IEnumerator ConnectToWallet()
{
    statusText.text = "Connecting to wallet...";
    
    // For testing, use manual wallet address input
    string walletAddress = GetWalletAddressFromUI();
    
    if (string.IsNullOrEmpty(walletAddress))
    {
        statusText.text = "Please enter wallet address";
        yield break;
    }
    
    // Request NFT proof from server
    yield return StartCoroutine(GetNFTProof(walletAddress));
    
    if (currentNFTProof.isValid)
    {
        isConnected = true;
        statusText.text = $"Connected! NFT: {currentNFTProof.nftType}";
        nftStatusText.text = $"Owns {currentNFTProof.nftBalance} {currentNFTProof.nftType}";
    }
    else
    {
        statusText.text = "No valid NFT found";
        nftStatusText.text = "No NFT ownership";
    }
}
```

---

## 🧪 **NFT Benefits Testing**

### **Benefits Testing System**
The application tests all NFT utility functions without game complexity:

1. **Discount Testing** - Test IAP discount calculations
2. **Resource Bonus Testing** - Test resource multiplier effects
3. **Exclusive Access Testing** - Test exclusive content access
4. **Gold Token Testing** - Test passive income calculations

### **Benefits Implementation**
```csharp
void TestNFTBenefits()
{
    if (!isConnected || !currentNFTProof.isValid)
    {
        benefitsText.text = "No NFT connection - benefits not available";
        return;
    }
    
    // Test different NFT types and their benefits
    switch (currentNFTProof.nftType)
    {
        case "Imperial Crown":
            TestImperialCrownBenefits();
            break;
        case "Master Scroll":
            TestMasterScrollBenefits();
            break;
        case "Conquest Map":
            TestConquestMapBenefits();
            break;
        case "Collector Hero":
            TestCollectorHeroBenefits();
            break;
        default:
            benefitsText.text = "Unknown NFT type";
            break;
    }
}

void TestImperialCrownBenefits()
{
    // Test 30% discount
    float originalPrice = 100f;
    float discountedPrice = originalPrice * 0.7f; // 30% discount
    
    // Test 15% resource bonus
    int baseResources = 100;
    int bonusResources = Mathf.RoundToInt(baseResources * 1.15f);
    
    // Test exclusive access
    bool hasExclusiveAccess = true;
    
    benefitsText.text = $"Imperial Crown Benefits:\n" +
                       $"Discount: {originalPrice} -> {discountedPrice} (-30%)\n" +
                       $"Resources: {baseResources} -> {bonusResources} (+15%)\n" +
                       $"Exclusive Access: {hasExclusiveAccess}";
}
```

---

## 🌐 **Server Integration**

### **NFT Proof Server Connection**
The Unity application connects to a simple Node.js server that provides:
- **NFT Ownership Verification** - Check wallet for NFT ownership
- **Benefits Calculation** - Calculate NFT benefits based on ownership
- **Test Data** - Provide test data for different NFT types

### **Server API Endpoints**
```
GET /api/nft-proof?walletAddress=0x...
- Returns NFT ownership information

GET /api/health
- Server health check

POST /api/test-benefits
- Test NFT benefits calculation
```

### **Connection Implementation**
```csharp
IEnumerator GetNFTProof(string walletAddress)
{
    string url = serverURL + nftProofEndpoint + "?walletAddress=" + walletAddress;
    
    using (UnityWebRequest request = UnityWebRequest.Get(url))
    {
        yield return request.SendWebRequest();
        
        if (request.result == UnityWebRequest.Result.Success)
        {
            string jsonResponse = request.downloadHandler.text;
            currentNFTProof = JsonUtility.FromJson<NFTProof>(jsonResponse);
        }
        else
        {
            Debug.LogError($"Failed to get NFT proof: {request.error}");
            currentNFTProof = new NFTProof { isValid = false, error = request.error };
        }
    }
}
```

---

## 🎯 **Testing Interface**

### **Simple UI Layout**
```
┌─────────────────────────────────────┐
│ NFT Testing Harness                 │
├─────────────────────────────────────┤
│ [Connect Wallet] [Test Benefits]    │
├─────────────────────────────────────┤
│ Status: Ready to test               │
│ NFT Status: No connection           │
│ Benefits: No benefits active        │
├─────────────────────────────────────┤
│ Test Results:                       │
│ - Discount: 100 -> 70 (-30%)        │
│ - Resources: 100 -> 115 (+15%)      │
│ - Exclusive Access: Yes              │
└─────────────────────────────────────┘
```

### **Testing Controls**
- **Connect Button** - Connect to wallet and verify NFT ownership
- **Test Benefits Button** - Test all NFT benefits
- **Status Display** - Show connection and testing status
- **Results Display** - Show calculated benefits

---

## 🧪 **Testing Scenarios**

### **Test Case 1: Imperial Crown (Type A)**
- **Discount**: 30% on all IAPs
- **Resource Bonus**: +15% resource extraction
- **Exclusive Access**: Yes
- **Expected Results**: Maximum benefits applied

### **Test Case 2: Master Scroll (Type B)**
- **Discount**: 10% on IAPs
- **Resource Bonus**: None
- **Exclusive Access**: No
- **Expected Results**: Moderate benefits

### **Test Case 3: Conquest Map (Type C)**
- **Discount**: None
- **Resource Bonus**: +20% resource extraction
- **Exclusive Access**: No
- **Expected Results**: Resource bonus only

### **Test Case 4: Collector Hero (Type D)**
- **Discount**: None
- **Resource Bonus**: None
- **Exclusive Access**: Yes
- **Expected Results**: Exclusive access only

### **Test Case 5: No NFT**
- **Discount**: None
- **Resource Bonus**: None
- **Exclusive Access**: No
- **Expected Results**: No benefits

---

## 📊 **Test Results Logging**

### **Logging System**
The application logs all test results for analysis:

```csharp
void LogTestResult(string testName, bool success, string details)
{
    string timestamp = System.DateTime.Now.ToString("HH:mm:ss");
    string logEntry = $"[{timestamp}] {testName}: {(success ? "PASS" : "FAIL")} - {details}";
    
    Debug.Log(logEntry);
    
    // Add to UI log
    testLogText.text += logEntry + "\n";
}
```

### **Test Metrics**
- **Connection Success Rate** - Wallet connection success
- **NFT Detection Rate** - NFT ownership detection
- **Benefits Calculation** - Benefit calculation accuracy
- **Performance Metrics** - Response times and efficiency

---

## 🎯 **Benefits of This Approach**

### **🚀 Development Speed**
- **No Game Complexity** - Focus on NFT functionality only
- **Quick Testing** - Rapid iteration and testing
- **Simple Interface** - Easy to understand and use

### **🧠 Testing Intelligence**
- **All NFT Types** - Test all 4 NFT types and their benefits
- **Real Blockchain** - Test with actual blockchain data
- **Comprehensive Coverage** - Test all utility functions

### **🔧 Flexibility**
- **Easy Modification** - Simple to add new test cases
- **Multiple Scenarios** - Test different wallet addresses
- **Server Integration** - Test with different server configurations

### **📊 Comprehensive Testing**
- **NFT Ownership** - Verify NFT ownership detection
- **Benefits Calculation** - Test all benefit calculations
- **Error Handling** - Test error scenarios and edge cases
- **Performance** - Test response times and efficiency

---

## 🎯 **Implementation Steps**

### **Phase 1: Basic Setup**
1. **Create Unity Project** - New 2D project for testing
2. **Setup UI** - Simple interface for testing
3. **Create NFTManager** - Main testing script
4. **Server Connection** - Connect to NFT proof server

### **Phase 2: NFT Testing**
1. **Wallet Connection** - Test wallet address input
2. **NFT Detection** - Test NFT ownership verification
3. **Benefits Testing** - Test all NFT benefit calculations
4. **Error Handling** - Test error scenarios

### **Phase 3: Advanced Testing**
1. **Multiple NFTs** - Test multiple NFT ownership
2. **Performance Testing** - Test response times
3. **Edge Cases** - Test unusual scenarios
4. **Integration Testing** - Test with real blockchain

---

## 🎯 **Next Steps**

### **Immediate Implementation**
1. **Create Unity Project** - Set up basic testing harness
2. **Implement NFTManager** - Core testing functionality
3. **Connect to Server** - Integrate with NFT proof server
4. **Test All Scenarios** - Test all NFT types and benefits

### **Advanced Features**
1. **Automated Testing** - Automated test suite
2. **Performance Monitoring** - Response time tracking
3. **Error Simulation** - Test error scenarios
4. **Integration Testing** - Test with real blockchain

### **Production Ready**
1. **Comprehensive Testing** - Full test coverage
2. **Performance Optimization** - Optimize for speed
3. **Error Handling** - Robust error handling
4. **Documentation** - Complete testing documentation

---

## 🎯 **Conclusion**

This simple Unity NFT testing application provides:

1. **Minimal Complexity** - No full game, just NFT functionality testing
2. **Comprehensive Testing** - Test all NFT types and their benefits
3. **Easy Integration** - Simple server connection and testing
4. **Rapid Development** - Quick setup and testing

**Next Priority**: Create Unity project and implement basic NFT testing harness.

---

*This simple Unity application enables comprehensive NFT functionality testing without the complexity of a full game, focusing on NFT utility verification and benefits testing.*
