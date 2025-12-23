const RevealedOffer = require("../models/RevealedOffer.model");

exports.storeRevealedOffer = async (req, res) => {
  try {
    const { contractAddress, offeror, offerAmount, username } = req.body;

    if (!contractAddress || !offeror || !offerAmount) {
      return res.status(400).json({ error: "Missing required fields" });
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
