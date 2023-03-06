const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Owner", () => {
    let contract;
    let accounts;
    let MultiSigWallet;

    beforeEach(async () => {
        MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        accounts = await ethers.provider.listAccounts();
        
        contract = await MultiSigWallet.deploy(accounts.slice(0, 7), 5);
        await contract.deployed();
    });

        it("should add new owner", async () => {
            await contract.addOwner(accounts[7]);
            const newOwner = await contract.owners(7);

            expect(newOwner).to.be.equal(accounts[7]);
            expect(await contract.isOwner(newOwner)).to.be.equal(true);
        });

        it("should be revert with owner already exist", async () => {
            await expect(contract.addOwner(accounts[2])).to.be.revertedWith('owner already exist');
        });

        it("should delete an owner", async () => {
            let ownersFirst = await contract.getOwners();
            expect(ownersFirst.length).to.be.equal(7);

            const owner = await contract.owners(4);
            await contract.deleteOwner(owner);
            expect(await contract.isOwner(owner)).to.be.equal(false);

            let owners = await contract.getOwners();
            expect(owners.length).to.be.equal(6);
        });

        it("should be revert with owner not found", async () => {
            await expect(contract.deleteOwner(accounts[15])).to.be.revertedWith('owner not found');
        });
});
        

    


        
        
