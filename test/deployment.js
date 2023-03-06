const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Deployment", () => {
    let contract;
    let accounts;
    let MultiSigWallet;

    beforeEach(async () => {
        MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        accounts = await ethers.provider.listAccounts();
    });

        it("should revert with owners required", async () => {
            await expect(MultiSigWallet.deploy([], 2)).to.be.revertedWith("owners required");
        });

        it("should revert with invalid number of required confirmations", async () => {
            await expect(MultiSigWallet.deploy(accounts, 0)).to.be.revertedWith("invalid number of required confirmations");
        });

        describe("Set fields", () => {
            beforeEach(async () => {
                contract = await MultiSigWallet.deploy(accounts.slice(0, 7), 5);
                await contract.deployed();
            });

            it("should set owners", async () => {
                const owners = await contract.getOwners();
    
                expect(accounts[0]).to.be.equal(owners[0]);
                expect(await contract.isOwner(owners[0])).to.be.equal(true);

                expect(accounts[6]).to.be.equal(owners[6]);
                expect(await contract.isOwner(owners[6])).to.be.equal(true);

                expect(owners.length).to.be.equal(7);
            });
    
            it("should set count of required confirmation", async () => {
                let reqConfirm = await contract.numConfirmsRequired();
                expect(reqConfirm).to.be.equal(5);
            });
        });
});
        

    


        
        
