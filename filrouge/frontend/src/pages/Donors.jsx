import { useEffect, useState } from "react";
import { Search, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { searchDonors } from "../api/donors";
import { BLOOD_TYPES, toShortBloodType } from "../utils/bloodTypes";
import { CITIES } from "../utils/cities";
import { formatDate, computeEligibility } from "../utils/dates";
import { EligibilityBadge } from "../components/StatusBadge";
import Modal from "../components/Modal";
import InviteToRequestModal from "../components/InviteToRequestModal";
import "./Donors.css";

export default function Donors() {
  const { token } = useAuth();

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [invitingDonor, setInvitingDonor] = useState(null);
  const [sentMessage, setSentMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    searchDonors(token, { city, bloodType })
      .then((data) => !ignore && setDonors(data))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [token, city, bloodType]);

  const visibleDonors = donors.filter((donor) =>
    donor.name.toLowerCase().includes(name.trim().toLowerCase())
  );

  return (
    <div>
      <h1>Find a Donor</h1>
      <p className="page-subtitle">Connect with people who may be able to help.</p>

      <div className="donors-filters">
        <div className="donors-search">
          <Search size={16} />
          <input
            placeholder="Search by name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <select value={city} onChange={(event) => setCity(event.target.value)}>
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={bloodType} onChange={(event) => setBloodType(event.target.value)}>
          <option value="">All blood types</option>
          {BLOOD_TYPES.map((type) => (
            <option key={type} value={type}>
              {toShortBloodType(type)}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="page-loading">Searching donors...</div>}
      {error && <p className="error-text">{error}</p>}
      {sentMessage && (
        <p className="form-hint" style={{ color: "var(--green-text)" }}>
          {sentMessage}
        </p>
      )}

      {!loading && !error && visibleDonors.length === 0 && (
        <div className="card empty-state">No donors match your search yet.</div>
      )}

      {!loading && !error && visibleDonors.length > 0 && (
        <div className="donors-grid">
          {visibleDonors.map((donor) => {
            const { eligible } = computeEligibility(donor.lastDonationDate);
            return (
              <div className="card donor-card" key={donor._id}>
                <div className="donor-card-top">
                  <div className="donor-header">
                    <div className="donor-avatar">
                      <UserIcon size={22} />
                    </div>
                    <div>
                      <p className="donor-name">{donor.name}</p>
                      <p className="donor-city">{donor.city || "—"}</p>
                    </div>
                  </div>
                  <span className="badge badge-red">{toShortBloodType(donor.bloodType)}</span>
                </div>

                <p className="donor-last-donation">
                  Last donation: <strong>{formatDate(donor.lastDonationDate)}</strong>
                </p>

                <EligibilityBadge eligible={eligible} />

                <div className="donor-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary donor-view-btn"
                    onClick={() => setSelectedDonor(donor)}
                  >
                    View profile
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary donor-view-btn"
                    disabled={!eligible}
                    onClick={() => setInvitingDonor(donor)}
                  >
                    {eligible ? "Send request" : "Not eligible"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedDonor && (
        <Modal title={selectedDonor.name} onClose={() => setSelectedDonor(null)}>
          <p className="modal-row">
            <span>City</span>
            {selectedDonor.city || "—"}
          </p>
          <p className="modal-row">
            <span>Blood type</span>
            {toShortBloodType(selectedDonor.bloodType)}
          </p>
          <p className="modal-row">
            <span>Last donation</span>
            {formatDate(selectedDonor.lastDonationDate)}
          </p>
          <p className="modal-row">
            <span>Phone</span>
            {selectedDonor.phone || "Not shared"}
          </p>
        </Modal>
      )}

      {invitingDonor && (
        <InviteToRequestModal
          donor={invitingDonor}
          onClose={() => setInvitingDonor(null)}
          onSent={() => {
            setInvitingDonor(null);
            setSentMessage(`Request sent to ${invitingDonor.name}!`);
            setTimeout(() => setSentMessage(""), 4000);
          }}
        />
      )}
    </div>
  );
}
