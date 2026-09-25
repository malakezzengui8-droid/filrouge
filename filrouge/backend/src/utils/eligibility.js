// One simple, conservative rule for every donor.
const DONATION_INTERVAL_DAYS = 120;

function calculateNextDonationDate(lastDonationDate) {
  if (!lastDonationDate) return null;

  const nextDate = new Date(lastDonationDate);
  nextDate.setDate(nextDate.getDate() + DONATION_INTERVAL_DAYS);
  return nextDate;
}

function calculateDaysRemaining(nextDonationDate) {
  if (!nextDonationDate) return 0;

  const today = new Date();
  const diffInMs = nextDonationDate.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return diffInDays > 0 ? diffInDays : 0;
}

function checkEligibility(lastDonationDate) {
  const nextDonationDate = calculateNextDonationDate(lastDonationDate);
  const daysRemaining = calculateDaysRemaining(nextDonationDate);

  return {
    lastDonationDate: lastDonationDate || null,
    nextDonationDate,
    daysRemaining,
    eligible: daysRemaining === 0
  };
}

export { DONATION_INTERVAL_DAYS, calculateNextDonationDate, calculateDaysRemaining, checkEligibility };
