import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as appointmentsApi from "../api/appointement";
import { AppointmentStatusBadge } from "../components/StatusBadge";
import AppointmentConfirmModal from "../components/AppointmentConfirmModal";
import { formatDate } from "../utils/dates";
import { toShortBloodType } from "../utils/bloodTypes";
import "./MyAppointments.css";

export default function MyAppointments() {
  const { token } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingAppointment, setActingAppointment] = useState(null);

  useEffect(() => {
    load();
  }, [token]);

  function load() {
    setLoading(true);
    setError("");
    appointmentsApi
      .getMyAppointments(token)
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleConfirm({ appointmentDate, location }) {
    const updated = await appointmentsApi.confirmAppointment(token, actingAppointment._id, {
      appointmentDate,
      location,
    });
    setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    setActingAppointment(null);
  }

  async function handleReject(appointmentId) {
    try {
      const updated = await appointmentsApi.rejectAppointment(token, appointmentId);
      setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(appointmentId) {
    try {
      const updated = await appointmentsApi.cancelAppointment(token, appointmentId);
      setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page-loading">Loading your appointments...</div>;

  // Invitations sent TO me by requesters — I need to accept/decline
  const invitationsReceived = appointments.filter((a) => a.initiatedBy === "REQUESTER");
  // Offers I made myself — the requester decides, I just track status
  const myOffers = appointments.filter((a) => a.initiatedBy === "DONOR");

  return (
    <div>
      <h1>My Appointments</h1>
      <p className="page-subtitle">Invitations you received and offers you made.</p>

      {error && <p className="error-text">{error}</p>}

      <h3 className="section-title">Invitations received</h3>
      {invitationsReceived.length === 0 ? (
        <div className="card empty-state">No invitations yet.</div>
      ) : (
        <div className="my-appointments-list">
          {invitationsReceived.map((appointment) => (
            <div className="card my-appointment-card" key={appointment._id}>
              <div className="my-appointment-main">
                <span className="my-appointment-type">
                  {toShortBloodType(appointment.request?.bloodTypeNeeded)}
                </span>
                <div>
                  <p className="my-appointment-title">
                    {appointment.request?.hospital} · {appointment.request?.city}
                  </p>
                  {["CONFIRMED", "COMPLETED"].includes(appointment.status) && (
                    <p className="my-appointment-meta">
                      {formatDate(appointment.appointmentDate)}
                      {appointment.location ? ` · ${appointment.location}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {appointment.status === "PENDING" ? (
                <div className="appointment-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleReject(appointment._id)}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setActingAppointment(appointment)}
                  >
                    Accept
                  </button>
                </div>
              ) : (
                <div className="appointment-actions">
                  <AppointmentStatusBadge status={appointment.status} />
                  {appointment.status === "CONFIRMED" && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleCancel(appointment._id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h3 className="section-title">Offers I made</h3>
      {myOffers.length === 0 ? (
        <div className="card empty-state">
          You haven't offered to help anyone yet. <Link to="/urgent">Browse urgent requests</Link>.
        </div>
      ) : (
        <div className="my-appointments-list">
          {myOffers.map((appointment) => (
            <div className="card my-appointment-card" key={appointment._id}>
              <div className="my-appointment-main">
                <span className="my-appointment-type">
                  {toShortBloodType(appointment.request?.bloodTypeNeeded)}
                </span>
                <div>
                  <p className="my-appointment-title">
                    {appointment.request?.hospital} · {appointment.request?.city}
                  </p>
                  {["CONFIRMED", "COMPLETED"].includes(appointment.status) && (
                    <p className="my-appointment-meta">
                      {formatDate(appointment.appointmentDate)}
                      {appointment.location ? ` · ${appointment.location}` : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="appointment-actions">
                <AppointmentStatusBadge status={appointment.status} />
                {appointment.status === "CONFIRMED" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleCancel(appointment._id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {actingAppointment && (
        <AppointmentConfirmModal
          title="Confirm appointment"
          onClose={() => setActingAppointment(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
