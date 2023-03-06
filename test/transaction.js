const { expect} = require("chai");
const { ethers } = require("hardhat");

describe("Transaction", () => {
    let contract;
    let accounts;
    let MultiSigWallet;
    let signer;
    const amount = ethers.utils.parseEther("2");

    beforeEach(async () => {
        MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        accounts = await ethers.provider.listAccounts();
        
        signer = ethers.provider.getSigner(accounts[1]);
        contract = await MultiSigWallet.deploy(accounts.slice(0, 3), 2);
        await contract.deployed();

        beforeBalance = await ethers.provider.getBalance(accounts[2]);
    });

        describe("Fund contract and create transaction", () => {
            beforeEach(async () => {
                await signer.sendTransaction({
                    to: contract.address,
                    value: amount,
                });

                await contract.createTransaction(accounts[2], amount);
            });
            
            it("contract balance should be equal 2 eth", async () => {
                expect(await ethers.provider.getBalance(contract.address)).to.be.equal(amount);
            });
            
            it("tx fields should be correct", async () => {
                const transaction = await contract.transactions(1);
                expect(transaction.executed).to.be.equal(false);
                expect(transaction.numConfirms).to.be.equal("1");
            });

            it("receiver account has not fund yet", async () => {
                expect(await ethers.provider.getBalance(accounts[2])).to.be.equal(beforeBalance);
            });

            describe("Fund transfer succesfully", () => {
                beforeEach(async () => {
                    await contract.connect(signer).confirmTransaction(1);
                });
                
            it("tx should be executed after reaching required confirm count", async () => {
                const transaction = await contract.transactions(1);

                expect(transaction.executed).to.be.equal(true);
                expect(transaction.numConfirms).to.be.equal(2);
            });
            
            it("receiver account should had fund", async () => {
                afterBalance = await ethers.provider.getBalance(accounts[2]); 
                expect((afterBalance.sub(beforeBalance)).toString()).to.be.equal(amount.toString());
            });
        });
    });
});