import { useState } from "react";
import Modal from "./Modal";

export default function AppointmentConfirmModal({ title, onClose, onConfirm }) {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!appointmentDate) {
      setError("Please pick a date and time");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onConfirm({ appointmentDate, location });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="appointmentDate">Date &amp; time</label>
          <input
            id="appointmentDate"
            type="datetime-local"
            value={appointmentDate}
            onChange={(event) => setAppointmentDate(event.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            placeholder="e.g. CHU Ibn Rochd, blood bank"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="profile-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Confirming..." : "Confirm appointment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}