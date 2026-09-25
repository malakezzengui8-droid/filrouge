import { toShortBloodType } from "../utils/bloodTypes";
import "./BloodTypeAvatar.css";

export default function BloodTypeAvatar({ bloodType, size = "md" }) {
  return (
    <div className={`blood-avatar blood-avatar-${size}`}>{toShortBloodType(bloodType)}</div>
  );
}
