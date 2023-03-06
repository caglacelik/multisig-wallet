const { ethers } = require("hardhat");
// console.log(ethers);

async function main() {
  const owners = ["AddressX", "AddressY", "AdressZ"];
  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  
  const contract = await MultiSigWallet.deploy(owners ,3);
  await contract.deployed();

  console.log(`Contract address: ${contract.address}`);
}

main().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
