import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { listRequests } from "../api/requests";
import { RequestStatusBadge } from "../components/StatusBadge";
import BloodTypeAvatar from "../components/BloodTypeAvatar";
import { formatRelative } from "../utils/dates";
import { BLOOD_TYPES, toShortBloodType } from "../utils/bloodTypes";
import { CITIES } from "../utils/cities";
import "./Urgent.css";

export default function Urgent() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [city, setCity] = useState("");
  const [bloodType, setBloodType] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    listRequests(token, { city, bloodType })
      .then((data) => !ignore && setRequests(data))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [token, city, bloodType]);

  return (
    <div>
      <div className="urgent-header">
        <div>
          <h1>Urgent Requests</h1>
          <p className="page-subtitle">Someone may need your help today.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
  <Link to="/urgent/mine" className="btn btn-secondary">
    My Requests
  </Link>
  <Link to="/urgent/new" className="btn btn-primary">
    <Plus size={16} />
    New Request
  </Link>
</div>
      </div>

      <div className="urgent-filters">
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

      {loading && <div className="page-loading">Loading requests...</div>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <div className="card empty-state">No urgent requests right now. Check back soon.</div>
      )}

      <div className="urgent-list">
        {requests.map((request) => (
          <div className="card urgent-card" key={request._id}>
            <BloodTypeAvatar bloodType={request.bloodTypeNeeded} />
            <div className="urgent-card-body">
              <div className="urgent-card-top">
                <RequestStatusBadge status={request.status} />
              </div>
              <p className="urgent-card-title">Blood needed</p>
              <p className="urgent-card-meta">
                {request.hospital} · {request.city}
              </p>
              {request.reason && <p className="urgent-card-reason">{request.reason}</p>}
            </div>
            <div className="urgent-card-side">
              <span className="urgent-card-time">Posted: {formatRelative(request.createdAt)}</span>
              <Link className="btn btn-secondary" to={`/urgent/${request._id}`}>
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
