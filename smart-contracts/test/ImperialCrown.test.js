const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ImperialCrown", function () {
    let imperialCrown;
    let owner, minter, pauser, user1, user2;
    
    const MAX_SUPPLY = 100;
    const IAP_DISCOUNT = 3000; // 30% (3000 basis points)
    const PVP_WIN_RATE_BONUS = 1500; // +15% (1500 basis points)
    const ROYALTY_FEE = 500; // 5% (500 basis points)
    
    beforeEach(async function () {
        [owner, minter, pauser, user1, user2] = await ethers.getSigners();
        
        const ImperialCrown = await ethers.getContractFactory("ImperialCrown");
        imperialCrown = await ImperialCrown.deploy(
            "Imperial Crown",
            "CROWN",
            "https://api.nftgaming086.com/metadata/crown/"
        );
        await imperialCrown.waitForDeployment();
        
        // Grant minter role to minter address
        await imperialCrown.grantRole(await imperialCrown.MINTER_ROLE(), minter.address);
        await imperialCrown.grantRole(await imperialCrown.PAUSER_ROLE(), pauser.address);
    });
    
    describe("Deployment", function () {
        it("Should set the correct name and symbol", async function () {
            expect(await imperialCrown.name()).to.equal("Imperial Crown");
            expect(await imperialCrown.symbol()).to.equal("CROWN");
        });
        
        it("Should set the correct max supply", async function () {
            expect(await imperialCrown.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
        });
        
        it("Should set the correct royalty fee", async function () {
            const [receiver, feeNumerator] = await imperialCrown.royaltyInfo(0, 10000);
            expect(feeNumerator).to.equal(ROYALTY_FEE);
        });
    });
    
    describe("Minting", function () {
        it("Should mint NFT to specified address", async function () {
            await imperialCrown.connect(minter).mintCrown(user1.address);
            
            expect(await imperialCrown.ownerOf(0)).to.equal(user1.address);
            expect(await imperialCrown.balanceOf(user1.address)).to.equal(1);
        });
        
        it("Should enforce supply limit", async function () {
            // Mint up to max supply
            for (let i = 0; i < MAX_SUPPLY; i++) {
                await imperialCrown.connect(minter).mintCrown(user1.address);
            }
            
            // Attempt to mint beyond limit should fail
            await expect(
                imperialCrown.connect(minter).mintCrown(user1.address)
            ).to.be.revertedWith("Max supply reached");
        });
        
        it("Should only allow authorized minters", async function () {
            await expect(
                imperialCrown.connect(user1).mintCrown(user2.address)
            ).to.be.reverted;
        });
        
        it("Should emit CrownMinted event", async function () {
            await expect(
                imperialCrown.connect(minter).mintCrown(user1.address)
            ).to.emit(imperialCrown, "CrownMinted")
            .withArgs(user1.address, 0);
        });
        
        it("Should support batch minting", async function () {
            const recipients = [user1.address, user2.address, user1.address];
            await imperialCrown.connect(minter).batchMintCrown(recipients);
            
            expect(await imperialCrown.balanceOf(user1.address)).to.equal(2);
            expect(await imperialCrown.balanceOf(user2.address)).to.equal(1);
        });
    });
    
    describe("Utility Benefits", function () {
        beforeEach(async function () {
            await imperialCrown.connect(minter).mintCrown(user1.address);
        });
        
        it("Should return correct IAP discount", async function () {
            const [iapDiscount, pvpWinRateBonus, hasCrownSkin] = await imperialCrown.getUtilityBenefits(0);
            
            expect(iapDiscount).to.equal(IAP_DISCOUNT);
            expect(pvpWinRateBonus).to.equal(PVP_WIN_RATE_BONUS);
            expect(hasCrownSkin).to.equal(true);
        });
        
        it("Should validate token existence for utility benefits", async function () {
            await expect(
                imperialCrown.getUtilityBenefits(999)
            ).to.be.revertedWith("Token does not exist");
        });
    });
    
    describe("Royalty System", function () {
        it("Should set royalty information correctly", async function () {
            await imperialCrown.setRoyaltyInfo(user1.address, 750); // 7.5%
            
            const [receiver, feeNumerator] = await imperialCrown.royaltyInfo(0, 10000);
            expect(receiver).to.equal(user1.address);
            expect(feeNumerator).to.equal(750);
        });
        
        it("Should only allow admin to set royalty", async function () {
            await expect(
                imperialCrown.connect(user1).setRoyaltyInfo(user2.address, 500)
            ).to.be.reverted;
        });
    });
    
    describe("Pause Functionality", function () {
        it("Should pause and unpause contract", async function () {
            await imperialCrown.connect(pauser).pause();
            
            await expect(
                imperialCrown.connect(minter).mintCrown(user1.address)
            ).to.be.revertedWith("Pausable: paused");
            
            await imperialCrown.connect(pauser).unpause();
            
            await imperialCrown.connect(minter).mintCrown(user1.address);
            expect(await imperialCrown.ownerOf(0)).to.equal(user1.address);
        });
    });
    
    describe("Utility Functions", function () {
        it("Should return correct total supply", async function () {
            expect(await imperialCrown.getTotalSupply()).to.equal(0);
            
            await imperialCrown.connect(minter).mintCrown(user1.address);
            expect(await imperialCrown.getTotalSupply()).to.equal(1);
        });
        
        it("Should return correct remaining supply", async function () {
            expect(await imperialCrown.getRemainingSupply()).to.equal(MAX_SUPPLY);
            
            await imperialCrown.connect(minter).mintCrown(user1.address);
            expect(await imperialCrown.getRemainingSupply()).to.equal(MAX_SUPPLY - 1);
        });
        
        it("Should check holder status correctly", async function () {
            expect(await imperialCrown.isHolder(user1.address)).to.equal(false);
            
            await imperialCrown.connect(minter).mintCrown(user1.address);
            expect(await imperialCrown.isHolder(user1.address)).to.equal(true);
        });
    });
});