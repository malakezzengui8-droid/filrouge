import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getStatistics,
  getAdminRequests,
  getUsers,
  deleteUser,
  updateAdminRequestStatus,
} from "../api/admin";
import { RequestStatusBadge, EligibilityBadge } from "../components/StatusBadge";
import Modal from "../components/Modal";
import { toShortBloodType } from "../utils/bloodTypes";
import { computeEligibility } from "../utils/dates";
import "./Admin.css";

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingUser, setViewingUser] = useState(null);

  useEffect(() => {
    loadData();
  }, [token]);

  function loadData() {
    setLoading(true);
    setError("");
    Promise.all([getStatistics(token), getAdminRequests(token), getUsers(token)])
      .then(([statsData, requestData, userData]) => {
        setStats(statsData);
        setRequests(requestData.slice(0, 8));
        setDonors(userData.filter((u) => u.role === "USER").slice(0, 10));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  async function handleCancelRequest(id) {
    if (!window.confirm("Cancel this request?")) return;
    try {
      await updateAdminRequestStatus(token, id, "CANCELLED");
      setRequests((current) =>
        current.map((r) => (r._id === id ? { ...r, status: "CANCELLED" } : r))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteUser(token, id);
      setDonors((current) => current.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page-loading">Loading admin dashboard...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p className="page-subtitle">Oversight across donors and requests.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="admin-stats">
        <div className="card admin-stat">
          <span className="stat-value">{stats?.totalUsers ?? "—"}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="card admin-stat">
          <span className="stat-value">{stats?.activeRequests ?? "—"}</span>
          <span className="stat-label">Active Requests</span>
        </div>
        <div className="card admin-stat">
          <span className="stat-value">{stats?.fulfilledRequests ?? "—"}</span>
          <span className="stat-label">Fulfilled Requests</span>
        </div>
        <div className="card admin-stat">
          <span className="stat-value">{stats?.cancelledRequests ?? "—"}</span>
          <span className="stat-label">Cancelled Requests</span>
        </div>
      </div>

      <h3 className="admin-section-title">Recent urgent requests</h3>
      <div className="card admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Blood type</th>
              <th>Hospital</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id}>
                <td>{toShortBloodType(request.bloodTypeNeeded)}</td>
                <td>{request.hospital}</td>
                <td>{request.city}</td>
                <td>
                  <RequestStatusBadge status={request.status} />
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      title="View"
                      onClick={() => navigate(`/urgent/${request._id}`)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      title="Cancel request"
                      disabled={request.status !== "ACTIVE"}
                      onClick={() => handleCancelRequest(request._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="admin-section-title">Recent donors</h3>
      <div className="card admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Blood type</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor) => (
              <tr key={donor._id}>
                <td>{donor.name}</td>
                <td>{toShortBloodType(donor.bloodType)}</td>
                <td>{donor.city || "—"}</td>
                <td>
                  <EligibilityBadge eligible={computeEligibility(donor.lastDonationDate).eligible} />
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button type="button" title="View" onClick={() => setViewingUser(donor)}>
                      <Eye size={16} />
                    </button>
                    <button
                      type="button"
                      title="Delete user"
                      onClick={() => handleDeleteUser(donor._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {donors.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  No donors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingUser && (
        <Modal title={viewingUser.name} onClose={() => setViewingUser(null)}>
          <p className="modal-row">
            <span>Email</span>
            {viewingUser.email}
          </p>
          <p className="modal-row">
            <span>Phone</span>
            {viewingUser.phone || "—"}
          </p>
          <p className="modal-row">
            <span>City</span>
            {viewingUser.city || "—"}
          </p>
          <p className="modal-row">
            <span>Blood type</span>
            {toShortBloodType(viewingUser.bloodType)}
          </p>
        </Modal>
      )}
    </div>
  );
}
