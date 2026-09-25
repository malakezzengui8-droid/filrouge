import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEligibility } from "../api/auth";
import { listRequests } from "../api/requests";
import { DONATION_INTERVAL_DAYS, formatDate } from "../utils/dates";
import { toShortBloodType } from "../utils/bloodTypes";
import "./Dashboard.css";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [eligibility, setEligibility] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    Promise.all([getEligibility(token), listRequests(token, { city: user?.city })])
      .then(([eligibilityData, requestData]) => {
        if (ignore) return;
        setEligibility(eligibilityData);
        setRequests(requestData.slice(0, 3));
      })
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [token, user?.city]);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;

  const daysSinceLast = eligibility?.lastDonationDate
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(eligibility.lastDonationDate).getTime()) / 86400000)
      )
    : null;

  const progressPercent = eligibility?.eligible
    ? 100
    : Math.min(100, Math.round(((daysSinceLast ?? 0) / DONATION_INTERVAL_DAYS) * 100));

  return (
    <div>
      <h1>
        {greeting()}, {user?.name?.split(" ")[0]} 👋
      </h1>
      <p className="page-subtitle">Every donation can save a life.</p>

      <div className="dashboard-top">
        <div className="card status-card">
          <p className="status-label">Your donation status</p>
          <h2 className="status-headline">
            {eligibility?.eligible ? "You're eligible today!" : "Not eligible just yet"}
          </h2>

          <div className="status-body">
            <div className="status-dates">
              <div>
                <span className="status-date-label">Last donation</span>
                <span className="status-date-value">{formatDate(eligibility?.lastDonationDate)}</span>
              </div>
              <div>
                <span className="status-date-label">Next donation</span>
                <span className="status-date-value">
                  {eligibility?.eligible ? "Today" : formatDate(eligibility?.nextDonationDate)}
                </span>
              </div>
              <div>
                <span className="status-date-label">Status</span>
                <span
                  className={`badge ${eligibility?.eligible ? "badge-green" : "badge-grey"}`}
                >
                  {eligibility?.eligible ? "Eligible" : "Not eligible yet"}
                </span>
              </div>
            </div>

            <div className="status-ring" style={{ "--progress": `${progressPercent}%` }}>
              <span className="status-ring-value">{progressPercent}%</span>
              <span className="status-ring-label">
                {eligibility?.eligible ? "Ready to donate" : "Until eligible"}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="card stat-card">
            <span className="stat-value">{toShortBloodType(user?.bloodType) || "—"}</span>
            <span className="stat-label">Blood type</span>
          </div>
          <div className="card stat-card">
            <span className="stat-value">{user?.city || "—"}</span>
            <span className="stat-label">City</span>
          </div>
          <div className="card stat-card">
            <span className="stat-value">{requests.length}</span>
            <span className="stat-label">Urgent requests near you</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section-header">
        <h3>Urgent requests near you</h3>
        <Link to="/urgent">See all</Link>
      </div>

      {requests.length === 0 ? (
        <div className="card empty-state">No urgent requests near you right now.</div>
      ) : (
        <div className="dashboard-requests">
          {requests.map((request) => (
            <div className="card mini-request-card" key={request._id}>
              <div className="mini-request-top">
                <span className="mini-request-type">{toShortBloodType(request.bloodTypeNeeded)}</span>
                <span className="badge badge-red">Urgent</span>
              </div>
              <p className="mini-request-title">Blood needed</p>
              <p className="mini-request-meta">
                {request.city} · {request.hospital}
              </p>
              <Link className="mini-request-link" to={`/urgent/${request._id}`}>
                View request
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-banner">
        <div>
          <p className="banner-title">Your blood is more valuable than you think.</p>
          <p className="banner-subtitle">One donation can help up to three people in need.</p>
        </div>
        <button className="btn btn-banner" onClick={() => navigate("/donors")}>
          Find someone to help
        </button>
      </div>
    </div>
  );
}
