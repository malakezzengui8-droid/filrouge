import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BLOOD_TYPES, toShortBloodType } from "../utils/bloodTypes";
import "./Auth.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
  CIN: "",
  phone: "",
  city: "",
  bloodType: "",
};

export default function Register() {
  const { register } = useAuth();
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
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">
            <Droplet size={17} strokeWidth={0} fill="currentColor" />
          </span>
          <span className="auth-logo-text">
            Your Blood
            <br />
            is Gold
          </span>
        </div>

        <h1>Create your account</h1>
        <p className="auth-subtitle">Join as a donor and help someone in need.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="form-field">
            <label htmlFor="CIN">CIN</label>
            <input id="CIN" name="CIN" required value={form.CIN} onChange={handleChange} />
          </div>
          <div className="auth-row">
            <div className="form-field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label htmlFor="city">City</label>
              <input id="city" name="city" value={form.city} onChange={handleChange} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="bloodType">Blood type</label>
            <select id="bloodType" name="bloodType" value={form.bloodType} onChange={handleChange}>
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {toShortBloodType(type)}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
