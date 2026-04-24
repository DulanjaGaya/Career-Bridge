import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { user, signup, logout, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setMessage({ type: "error", text: "Please fill all signup fields." });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setLoading(true);
    const result = await signup(form.name, form.email, form.password, form.role);
    setLoading(false);
    if (result.success) setMessage({ type: "success", text: "Account created and logged in." });
    else setMessage({ type: "error", text: result.error });
  };

  if (isLoading) return <section className="panel">Loading authentication...</section>;

  if (user) {
    return (
      <section className="panel auth-grid">
        <h2>Account ready</h2>
        <p>
          Signed in as {user.name} ({user.email}).
        </p>
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </section>
    );
  }

  return (
    <section className="panel auth-grid">
      <h2>Create Account</h2>
      <p className="hero-sub">Join Career Bridge and unlock all modules in one place.</p>
      {message.text ? (
        <div className={message.type === "error" ? "msg error" : "msg success"}>{message.text}</div>
      ) : null}
      <form onSubmit={onSubmit} className="form-grid">
        <label>Full name</label>
        <input
          className="input"
          type="text"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <label>Email</label>
        <input
          className="input"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <label>Role</label>
        <select
          className="input"
          value={form.role}
          onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
        >
          <option value="student">Student</option>
          <option value="university">University</option>
          <option value="employer">Employer</option>
        </select>
        <label>Password</label>
        <input
          className="input"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
        <label>Confirm password</label>
        <input
          className="input"
          type="password"
          value={form.confirmPassword}
          onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </section>
  );
}
