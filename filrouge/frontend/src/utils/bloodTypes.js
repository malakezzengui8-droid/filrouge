// The backend stores blood types as e.g. "A_POSITIVE". We only ever show
// the short form ("A+") to users.
export const BLOOD_TYPES = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
];

const COMPATIBILITY_MAP = {
  O_NEGATIVE: ["O_NEGATIVE"],
  O_POSITIVE: ["O_POSITIVE", "O_NEGATIVE"],
  A_NEGATIVE: ["A_NEGATIVE", "O_NEGATIVE"],
  A_POSITIVE: ["A_POSITIVE", "A_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
  B_NEGATIVE: ["B_NEGATIVE", "O_NEGATIVE"],
  B_POSITIVE: ["B_POSITIVE", "B_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
  AB_NEGATIVE: ["AB_NEGATIVE", "A_NEGATIVE", "B_NEGATIVE", "O_NEGATIVE"],
  AB_POSITIVE: BLOOD_TYPES,
};

export function canDonateTo(donorBloodType, bloodTypeNeeded) {
  return (COMPATIBILITY_MAP[bloodTypeNeeded] || []).includes(donorBloodType);
}

export function toShortBloodType(bloodType) {
  if (!bloodType) return "";
  const [letters, sign] = bloodType.split("_");
  return `${letters}${sign === "POSITIVE" ? "+" : "-"}`;
}
