// Medical rule: which donor blood types can safely give blood to a recipient of a given type.
// Key = blood type NEEDED (recipient), Value = list of donor blood types that are compatible.
const COMPATIBILITY_MAP = {
  O_NEGATIVE: ['O_NEGATIVE'],
  O_POSITIVE: ['O_POSITIVE', 'O_NEGATIVE'],
  A_NEGATIVE: ['A_NEGATIVE', 'O_NEGATIVE'],
  A_POSITIVE: ['A_POSITIVE', 'A_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  B_NEGATIVE: ['B_NEGATIVE', 'O_NEGATIVE'],
  B_POSITIVE: ['B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'],
  AB_NEGATIVE: ['AB_NEGATIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'O_NEGATIVE'],
  AB_POSITIVE: ['AB_POSITIVE', 'AB_NEGATIVE', 'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE']
};

function getCompatibleDonorTypes(bloodTypeNeeded) {
  return COMPATIBILITY_MAP[bloodTypeNeeded] || [];
}

function isCompatibleDonor(donorBloodType, bloodTypeNeeded) {
  return getCompatibleDonorTypes(bloodTypeNeeded).includes(donorBloodType);
}

export { getCompatibleDonorTypes, isCompatibleDonor };
