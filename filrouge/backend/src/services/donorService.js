import User from '../models/User.js';

async function searchDonors({ city, bloodType }) {
  const filter = { role: 'USER' };

  if (city) {
    filter.city = new RegExp(`^${city}$`, 'i');
  }

  if (bloodType) {
    filter.bloodType = bloodType;
  }

  const donors = await User.find(filter).select('name city bloodType phone');

  return donors;
}

export { searchDonors };