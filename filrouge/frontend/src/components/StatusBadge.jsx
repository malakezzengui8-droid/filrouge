const REQUEST_STATUS = {
  ACTIVE: { label: "Urgent", className: "badge-red" },
  FULFILLED: { label: "Fulfilled", className: "badge-grey" },
  CANCELLED: { label: "Cancelled", className: "badge-grey" },
};

export function RequestStatusBadge({ status }) {
  const { label, className } = REQUEST_STATUS[status] || REQUEST_STATUS.ACTIVE;
  return <span className={`badge ${className}`}>{label}</span>;
}

export function EligibilityBadge({ eligible }) {
  return (
    <span className={`badge ${eligible ? "badge-green" : "badge-grey"}`}>
      {eligible ? "Eligible" : "Not eligible yet"}
    </span>
  );
}

const APPOINTMENT_STATUS = {
  PENDING: { label: "Pending", className: "badge-gold" },
  CONFIRMED: { label: "Confirmed", className: "badge-green" },
  REJECTED: { label: "Rejected", className: "badge-grey" },
  COMPLETED: { label: "Completed", className: "badge-green" },
  CANCELLED: { label: "Cancelled", className: "badge-grey" },
};

export function AppointmentStatusBadge({ status }) {
  const { label, className } = APPOINTMENT_STATUS[status] || APPOINTMENT_STATUS.PENDING;
  return <span className={`badge ${className}`}>{label}</span>;
}