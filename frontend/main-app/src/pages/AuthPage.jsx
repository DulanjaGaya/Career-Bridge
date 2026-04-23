import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Message({ type, text }) {
  if (!text) return null;
  return <div className={type === "error" ? "msg error" : "msg success"}>{text}</div>;
}

export default function AuthPage() {
  const { user, login, signup, logout, isLoading } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });

  const onLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setMessage({ type: "error", text: "Please fill all login fields." });
      return;
    }
    setLoading(true);
    const result = await login(loginData.email, loginData.password);
    setLoading(false);
    if (result.success) {
      setMessage({ type: "success", text: "Login successful." });
    } else {
      setMessage({ type: "error", text: result.error });
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setMessage({ type: "error", text: "Please fill all signup fields." });
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setLoading(true);
    const result = await signup(
      signupData.name,
      signupData.email,
      signupData.password,
      signupData.role
    );
    setLoading(false);
    if (result.success) {
      setMessage({ type: "success", text: "Account created and logged in." });
    } else {
      setMessage({ type: "error", text: result.error });
    }
  };

  if (isLoading) {
    return (
      <section className="panel">
        <h2>Loading authentication...</h2>
      </section>
    );
  }

  if (user) {
    return (
      <section className="panel">
        <h2>Authenticated</h2>
        <p>
          Signed in as <strong>{user.name}</strong> ({user.email}) - role: <strong>{user.role}</strong>
        </p>
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </section>
    );
  }

  return (
    <section className="panel auth-grid">
      <div className="auth-tabs">
        <button className={mode === "login" ? "btn" : "btn ghost"} onClick={() => setMode("login")}>
          Login
        </button>
        <button className={mode === "signup" ? "btn" : "btn ghost"} onClick={() => setMode("signup")}>
          Signup
        </button>
      </div>

      <Message type={message.type} text={message.text} />

      {mode === "login" ? (
        <form onSubmit={onLogin} className="form-grid">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={loginData.email}
            onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
          />
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={loginData.password}
            onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      ) : (
        <form onSubmit={onSignup} className="form-grid">
          <label>Full name</label>
          <input
            className="input"
            type="text"
            value={signupData.name}
            onChange={(e) => setSignupData((p) => ({ ...p, name: e.target.value }))}
          />
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={signupData.email}
            onChange={(e) => setSignupData((p) => ({ ...p, email: e.target.value }))}
          />
          <label>Role</label>
          <select
            className="input"
            value={signupData.role}
            onChange={(e) => setSignupData((p) => ({ ...p, role: e.target.value }))}
          >
            <option value="student">Student</option>
            <option value="university">University</option>
            <option value="employer">Employer</option>
          </select>
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={signupData.password}
            onChange={(e) => setSignupData((p) => ({ ...p, password: e.target.value }))}
          />
          <label>Confirm password</label>
          <input
            className="input"
            type="password"
            value={signupData.confirmPassword}
            onChange={(e) => setSignupData((p) => ({ ...p, confirmPassword: e.target.value }))}
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      )}
    </section>
  );
}
