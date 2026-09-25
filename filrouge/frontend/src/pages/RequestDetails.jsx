import { useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getRequest,
  getCompatibleDonors,
  updateRequestStatus,
} from "../api/requests";
import * as appointmentsApi from "../api/appointement";
import { RequestStatusBadge, AppointmentStatusBadge } from "../components/StatusBadge";
import BloodTypeAvatar from "../components/BloodTypeAvatar";
import AppointmentConfirmModal from "../components/AppointmentConfirmModal";
import { computeEligibility, formatDate } from "../utils/dates";
import { canDonateTo, toShortBloodType } from "../utils/bloodTypes";
import "./Urgent.css";

export default function RequestDetails() {
  const { id } = useParams();
  const { token, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [donors, setDonors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const [myOffer, setMyOffer] = useState(null); // this donor's own offer on this request, if any
  const [applying, setApplying] = useState(false);
  const [invitingDonorId, setInvitingDonorId] = useState(null);
  const [actingAppointment, setActingAppointment] = useState(null); // { appointment, mode: 'confirm' }

  const userId = user?._id || user?.id;
  const canManage = isAdmin || request?.createdBy?._id === userId;

  useEffect(() => {
    load();
  }, [token, id]);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getRequest(token, id), getCompatibleDonors(token, id)])
      .then(async ([requestData, donorData]) => {
        setRequest(requestData);
        setDonors(donorData);

        const isOwnerOrAdmin = isAdmin || requestData.createdBy?._id === userId;
        if (isOwnerOrAdmin) {
          const requestAppointments = await appointmentsApi.getRequestAppointments(token, id);
          setAppointments(requestAppointments);
        } else {
          // find out if the current donor already has an offer on this request
          const mine = await appointmentsApi.getMyAppointments(token);
          setMyOffer(mine.find((a) => a.request?._id === id) || null);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleStatusChange(status) {
    setUpdating(true);
    try {
      const updated = await updateRequestStatus(token, id, status);
      setRequest(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function handleApply() {
    setApplying(true);
    setError("");
    try {
      const appointment = await appointmentsApi.createAppointment(token, id);
      setMyOffer(appointment);
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  }

  async function handleInvite(donorId) {
    setInvitingDonorId(donorId);
    setError("");
    try {
      const appointment = await appointmentsApi.inviteDonor(token, id, donorId);
      setAppointments((current) => [...current, appointment]);
    } catch (err) {
      setError(err.message);
    } finally {
      setInvitingDonorId(null);
    }
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

  async function handleComplete(appointmentId) {
    setError("");
    try {
      const updated = await appointmentsApi.completeAppointment(token, appointmentId);
      setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancelAppointment(appointmentId) {
    setError("");
    try {
      const updated = await appointmentsApi.cancelAppointment(token, appointmentId);
      setAppointments((current) => current.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page-loading">Loading request...</div>;
  if (error && !request) return <p className="error-text">{error}</p>;
  if (!request) return null;

  const compatibleWithRequest = canDonateTo(user?.bloodType, request.bloodTypeNeeded);
  const donorIsEligible = computeEligibility(user?.lastDonationDate).eligible;

  // Appointments the OWNER needs to act on: donor-initiated offers, still pending
  const pendingOffers = appointments.filter((a) => a.initiatedBy === "DONOR" && a.status === "PENDING");
  // Invitations the owner already sent (awaiting the donor's answer)
  const sentInvites = appointments.filter(
    (a) => a.initiatedBy === "REQUESTER" && !["CONFIRMED", "COMPLETED"].includes(a.status)
  );
  const donationAppointments = appointments.filter((a) =>
    ["CONFIRMED", "COMPLETED"].includes(a.status)
  );

  function appointmentForDonor(donorId) {
    return appointments.find(
      (a) => a.donor?._id === donorId && ["PENDING", "CONFIRMED"].includes(a.status)
    );
  }

  return (
    <div>
      <button type="button" className="back-link" onClick={() => navigate("/urgent")}>
        <ArrowLeft size={15} />
        Back to requests
      </button>

      <div className="card detail-card">
        <div className="detail-top">
          <BloodTypeAvatar bloodType={request.bloodTypeNeeded} />
          <div>
            <RequestStatusBadge status={request.status} />
            <p className="detail-title">Blood needed</p>
            <p className="detail-meta">
              {request.hospital} · {request.city}
            </p>
          </div>
        </div>

        {request.reason && (
          <div className="detail-section">
            <h3>Reason</h3>
            <p>{request.reason}</p>
          </div>
        )}

        <div className="detail-section">
          <h3>Posted by</h3>
          <div className="detail-contact">
            <span>{request.createdBy?.name || "Unknown"}</span>
            {request.createdBy?.phone && <span>{request.createdBy.phone}</span>}
          </div>
          <p className="form-hint">Published on {formatDate(request.createdAt)}</p>
        </div>

        {/* Non-owner donor: offer to help */}
        {!canManage && request.status === "ACTIVE" && (
          <div className="detail-section">
            <h3>Want to help?</h3>
            {!compatibleWithRequest ? (
              <p className="form-hint">Your blood type is not compatible with this request.</p>
            ) : !donorIsEligible ? (
              <p className="form-hint">You are not eligible to donate yet.</p>
            ) : myOffer ? (
              <div className="appointment-row">
                <span>Your offer</span>
                <AppointmentStatusBadge status={myOffer.status} />
              </div>
            ) : (
              <button type="button" className="btn btn-primary" disabled={applying} onClick={handleApply}>
                {applying ? "Sending..." : "I can help"}
              </button>
            )}
          </div>
        )}

        {/* Owner: offers received from donors, needing a decision */}
        {canManage && (
          <div className="detail-section">
            <h3>Offers from donors</h3>
            {pendingOffers.length === 0 ? (
              <p className="form-hint">No pending offers yet.</p>
            ) : (
              <div className="appointment-list">
                {pendingOffers.map((appointment) => (
                  <div className="appointment-row" key={appointment._id}>
                    <div>
                      <p className="compatible-donor-name">{appointment.donor?.name}</p>
                      <p className="compatible-donor-meta">
                        {appointment.donor?.city} · {toShortBloodType(appointment.donor?.bloodType)}
                      </p>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="detail-section">
          <h3>Compatible donors nearby</h3>
          {donors.length === 0 ? (
            <p className="form-hint">No compatible donors found in this city yet.</p>
          ) : (
            <div className="compatible-donors-list">
              {donors.map((donor) => {
                const existing = canManage ? appointmentForDonor(donor._id) : null;
                return (
                  <div className="compatible-donor-row" key={donor._id}>
                    <div>
                      <p className="compatible-donor-name">{donor.name}</p>
                      <p className="compatible-donor-meta">{donor.city}</p>
                    </div>
                    <div className="appointment-actions">
                      <span className="badge badge-red">{toShortBloodType(donor.bloodType)}</span>
                      {canManage && request.status === "ACTIVE" && (
                        existing ? (
                          <AppointmentStatusBadge status={existing.status} />
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary donor-invite-btn"
                            disabled={invitingDonorId === donor._id}
                            onClick={() => handleInvite(donor._id)}
                          >
                            <Send size={14} />
                            {invitingDonorId === donor._id ? "Sending..." : "Invite"}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Owner: invitations already sent, awaiting donor's answer */}
        {canManage && sentInvites.length > 0 && (
          <div className="detail-section">
            <h3>Invitations sent</h3>
            <div className="appointment-list">
              {sentInvites.map((appointment) => (
                <div className="appointment-row" key={appointment._id}>
                  <div>
                    <p className="compatible-donor-name">{appointment.donor?.name}</p>
                    <p className="compatible-donor-meta">{appointment.donor?.city}</p>
                  </div>
                  <AppointmentStatusBadge status={appointment.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {canManage && donationAppointments.length > 0 && (
          <div className="detail-section">
            <h3>Scheduled donations</h3>
            <div className="appointment-list">
              {donationAppointments.map((appointment) => (
                <div className="appointment-row" key={appointment._id}>
                  <div>
                    <p className="compatible-donor-name">{appointment.donor?.name}</p>
                    <p className="compatible-donor-meta">
                      {formatDate(appointment.appointmentDate)}
                      {appointment.location ? ` · ${appointment.location}` : ""}
                    </p>
                  </div>
                  <div className="appointment-actions">
                    <AppointmentStatusBadge status={appointment.status} />
                    {appointment.status === "CONFIRMED" && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleCancelAppointment(appointment._id)}
                        >
                          Cancel appointment
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleComplete(appointment._id)}
                        >
                          Mark donation completed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {canManage && request.status === "ACTIVE" && (
          <div className="detail-actions">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={updating}
              onClick={() => handleStatusChange("CANCELLED")}
            >
              Cancel request
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={updating}
              onClick={() => handleStatusChange("FULFILLED")}
            >
              Mark as fulfilled
            </button>
          </div>
        )}
      </div>

      {actingAppointment && (
        <AppointmentConfirmModal
          title={`Confirm with ${actingAppointment.donor?.name}`}
          onClose={() => setActingAppointment(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
