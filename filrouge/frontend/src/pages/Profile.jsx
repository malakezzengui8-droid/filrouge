import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateMe, deleteMe } from "../api/auth";
import { BLOOD_TYPES, toShortBloodType } from "../utils/bloodTypes";
import { CITIES } from "../utils/cities";
import { formatDate } from "../utils/dates";
import Modal from "../components/Modal";
import "./Profile.css";

export default function Profile() {
  const { user, token, updateUserLocally, logout } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: user?.phone || "",
    city: user?.city || "",
    bloodType: user?.bloodType || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updated = await updateMe(token, form);
      updateUserLocally(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteMe(token);
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div>
      <h1>My Profile</h1>

      <div className="card profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{user?.name?.[0]}</div>
          <div>
            <p className="profile-name">{user?.name}</p>
            <span className="badge badge-red">{toShortBloodType(user?.bloodType)}</span>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="profile-grid">
            <div className="form-field">
              <label>Email</label>
              <input value={user?.email || ""} disabled />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="+212 6 XX XX XX XX"
              />
            </div>
            <div className="form-field">
              <label>City</label>
              {editing ? (
                <select name="city" value={form.city} onChange={handleChange}>
                  <option value="">Select city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={user?.city || ""} disabled />
              )}
            </div>
            <div className="form-field">
              <label>Blood type</label>
              {editing ? (
                <select name="bloodType" value={form.bloodType} onChange={handleChange}>
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {toShortBloodType(type)}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={toShortBloodType(user?.bloodType)} disabled />
              )}
            </div>
            <div className="form-field">
              <label>Last donation</label>
              <input value={formatDate(user?.lastDonationDate)} disabled />
              <span className="form-hint">Updated automatically after a completed donation.</span>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="profile-actions">
            {editing ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
                Edit profile
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card danger-card">
        <div>
          <p className="danger-title">Delete account</p>
          <p className="danger-subtitle">
            This permanently removes your profile and donation history.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-danger-outline"
          onClick={() => setConfirmingDelete(true)}
        >
          Delete account
        </button>
      </div>

      {confirmingDelete && (
        <Modal title="Delete your account?" onClose={() => setConfirmingDelete(false)}>
          <p className="form-hint">
            This can't be undone. Your profile will be permanently removed.
          </p>
          <div className="profile-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting..." : "Delete account"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
