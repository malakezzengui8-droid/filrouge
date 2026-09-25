import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createRequest } from "../api/requests";
import { BLOOD_TYPES, toShortBloodType } from "../utils/bloodTypes";
import { CITIES } from "../utils/cities";
import "./Urgent.css";

const initialForm = { bloodTypeNeeded: "", city: "", hospital: "", reason: "" };

export default function CreateRequest() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await createRequest(token, form);
      navigate(`/urgent/${created._id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button type="button" className="back-link" onClick={() => navigate("/urgent")}>
        <ArrowLeft size={15} />
        Back to requests
      </button>

      <h1>Create an Urgent Request</h1>
      <p className="page-subtitle">Share the details so nearby donors can respond.</p>

      <div className="card request-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="bloodTypeNeeded">Blood type needed</label>
            <select
              id="bloodTypeNeeded"
              name="bloodTypeNeeded"
              required
              value={form.bloodTypeNeeded}
              onChange={handleChange}
            >
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {toShortBloodType(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="city">City</label>
            <select id="city" name="city" required value={form.city} onChange={handleChange}>
              <option value="">Select city</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="hospital">Hospital</label>
            <input
              id="hospital"
              name="hospital"
              required
              placeholder="e.g. CHU Ibn Rochd"
              value={form.hospital}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              placeholder="Briefly describe the situation"
              value={form.reason}
              onChange={handleChange}
            />
          </div>
          <p className="form-hint">
            Donors will see the phone number on your profile, so make sure it's up to date.
          </p>

          {error && <p className="error-text">{error}</p>}

          <div className="request-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/urgent")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
