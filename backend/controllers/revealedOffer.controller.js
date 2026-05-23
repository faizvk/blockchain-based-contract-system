const RevealedOffer = require("../models/RevealedOffer.model");
const { isEthAddress, isPositiveNumber } = require("../utils/validators");

exports.storeRevealedOffer = async (req, res) => {
  try {
    const { contractAddress, offeror, offerAmount, username } = req.body;

    if (!isEthAddress(contractAddress)) {
      return res.status(400).json({ error: "Invalid contractAddress" });
    }
    if (!isEthAddress(offeror)) {
      return res.status(400).json({ error: "Invalid offeror address" });
    }
    if (!isPositiveNumber(offerAmount)) {
      return res.status(400).json({ error: "offerAmount must be a positive number" });
    }

    const offer = new RevealedOffer({
      contractAddress,
      offeror,
      offerAmount,
      username,
    });

    await offer.save();
    res.json({ message: "Revealed offer stored", offer });
  } catch (error) {
    res.status(500).json({ error: "Failed to store revealed offer" });
  }
};

exports.getRevealedOffers = async (req, res) => {
  try {
    const { contractAddress } = req.params;
    const offers = await RevealedOffer.find({ contractAddress });
    res.json({ revealedOffers: offers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch revealed offers" });
  }
};
