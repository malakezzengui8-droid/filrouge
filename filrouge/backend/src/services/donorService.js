import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { checkEligibility } from '../utils/eligibility.js';

async function searchDonors({ city, bloodType }) {
  const filter = { role: 'USER' };

  if (city) {
    filter.city = new RegExp(`^${city}$`, 'i');
  }

  if (bloodType) {
    filter.bloodType = bloodType;
  }

  const donors = await User.find(filter).select('name city bloodType phone lastDonationDate');
  const busyDonorIds = await Appointment.distinct('donor', { status: 'CONFIRMED' });
  const busyDonors = new Set(busyDonorIds.map(String));

  return donors.filter(
    (donor) => checkEligibility(donor.lastDonationDate).eligible && !busyDonors.has(donor._id.toString())
  );
}

export { searchDonors };
