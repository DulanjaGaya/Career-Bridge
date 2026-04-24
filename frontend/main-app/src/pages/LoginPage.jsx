import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login, logout, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setMessage({ type: "error", text: "Please fill all login fields." });
      return;
    }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) setMessage({ type: "success", text: "Login successful." });
    else setMessage({ type: "error", text: result.error });
  };

  if (isLoading) return <section className="panel">Loading authentication...</section>;

  if (user) {
    return (
      <section className="panel auth-grid">
        <h2>Welcome back, {user.name}</h2>
        <p>
          Signed in as {user.email} ({user.role}).
        </p>
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </section>
    );
  }

  return (
    <section className="panel auth-grid">
      <h2>Sign In</h2>
      <p className="hero-sub">Access your Career Bridge dashboard and continue your preparation.</p>
      {message.text ? (
        <div className={message.type === "error" ? "msg error" : "msg success"}>{message.text}</div>
      ) : null}
      <form onSubmit={onSubmit} className="form-grid">
        <label>Email</label>
        <input
          className="input"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <label>Password</label>
        <input
          className="input"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p>
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </section>
  );
}
