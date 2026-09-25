import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyRequests } from "../api/requests";
import { inviteDonor } from "../api/appointement";
import { canDonateTo, toShortBloodType } from "../utils/bloodTypes";
import Modal from "./Modal";

export default function InviteToRequestModal({ donor, onClose, onSent }) {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    getMyRequests(token)
      .then((data) =>
        setRequests(
          data.filter(
            (request) =>
              request.status === "ACTIVE" && canDonateTo(donor.bloodType, request.bloodTypeNeeded)
          )
        )
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, donor.bloodType]);

  async function handleSend(requestId) {
    setSendingId(requestId);
    setError("");
    try {
      await inviteDonor(token, requestId, donor._id);
      onSent();
    } catch (err) {
      setError(err.message);
      setSendingId(null);
    }
  }

  return (
    <Modal title={`Send a request to ${donor.name}`} onClose={onClose}>
      {loading && <p className="form-hint">Loading your requests...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && requests.length === 0 && (
        <p className="form-hint">
          You don't have an active request compatible with this donor.
        </p>
      )}

      {!loading && requests.length > 0 && (
        <div className="my-appointments-list">
          {requests.map((request) => (
            <div className="appointment-row" key={request._id}>
              <div>
                <p className="compatible-donor-name">
                  {toShortBloodType(request.bloodTypeNeeded)} needed
                </p>
                <p className="compatible-donor-meta">
                  {request.hospital} · {request.city}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={sendingId === request._id}
                onClick={() => handleSend(request._id)}
              >
                {sendingId === request._id ? "Sending..." : "Send"}
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
