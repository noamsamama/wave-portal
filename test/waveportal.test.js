const { expect } = require("chai");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("WavePortal", function () {
  async function deployFixture() {
    const [alice, bob] = await ethers.getSigners();
    const portal = await ethers.deployContract("WavePortal");
    return { portal, alice, bob };
  }

  it("starts with zero waves", async function () {
    const { portal } = await loadFixture(deployFixture);
    expect(await portal.totalWaves()).to.equal(0n);
    expect(await portal.getAllWaves()).to.deep.equal([]);
  });

  it("stores a wave with sender, message and timestamp", async function () {
    const { portal, alice } = await loadFixture(deployFixture);

    await portal.connect(alice).wave("GM from Paris");

    const waves = await portal.getAllWaves();
    expect(waves).to.have.lengthOf(1);
    expect(waves[0].waver).to.equal(alice.address);
    expect(waves[0].message).to.equal("GM from Paris");
    expect(waves[0].timestamp).to.be.greaterThan(0n);
    expect(await portal.totalWaves()).to.equal(1n);
  });

  it("emits NewWave", async function () {
    const { portal, alice } = await loadFixture(deployFixture);

    await expect(portal.connect(alice).wave("hello"))
      .to.emit(portal, "NewWave")
      .withArgs(alice.address, (t) => t > 0n, "hello");
  });

  it("rejects empty messages", async function () {
    const { portal } = await loadFixture(deployFixture);
    await expect(portal.wave("")).to.be.revertedWithCustomError(
      portal,
      "EmptyMessage"
    );
  });

  it("enforces the per-address cooldown", async function () {
    const { portal, alice, bob } = await loadFixture(deployFixture);

    await portal.connect(alice).wave("first");
    await expect(
      portal.connect(alice).wave("too soon")
    ).to.be.revertedWithCustomError(portal, "CooldownActive");

    // Another address is not affected
    await expect(portal.connect(bob).wave("I am bob")).to.not.be.reverted;

    // After the cooldown, alice can wave again
    await time.increase(31);
    await expect(portal.connect(alice).wave("second")).to.not.be.reverted;
    expect(await portal.totalWaves()).to.equal(3n);
  });
});
