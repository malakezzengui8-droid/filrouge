import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyRequests } from "../api/requests";
import { RequestStatusBadge } from "../components/StatusBadge";
import BloodTypeAvatar from "../components/BloodTypeAvatar";
import { formatRelative } from "../utils/dates";
import "./Urgent.css";

export default function MyRequests() {
  const { token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getMyRequests(token)
      .then(setRequests)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div className="urgent-header">
        <div>
          <h1>My Requests</h1>
          <p className="page-subtitle">All the blood requests you've published.</p>
        </div>
        <Link to="/urgent/new" className="btn btn-primary">
          <Plus size={16} />
          New Request
        </Link>
      </div>

      {loading && <div className="page-loading">Loading your requests...</div>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <div className="card empty-state">
          You haven't published any request yet. <Link to="/urgent/new">Create one</Link>.
        </div>
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