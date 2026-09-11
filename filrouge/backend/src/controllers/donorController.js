import * as donorService from '../services/donorService.js';

async function getDonors(req, res, next) {
  try {
    const { city, bloodType } = req.query;
    const donors = await donorService.searchDonors({ city, bloodType });
    res.status(200).json(donors);
  } catch (error) {
    next(error);
  }
}

export { getDonors };