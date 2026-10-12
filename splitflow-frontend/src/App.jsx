import {
  useState,
} from "react";

import "./App.css";

import Dashboard from "./Dashboard";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

function App() {

  const [
    isRegistering,
    setIsRegistering,
  ] = useState(false);

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    messageType,
    setMessageType,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loggedIn,
    setLoggedIn,
  ] = useState(
    localStorage.getItem(
      "token"
    ) !== null
  );

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin =
    async (e) => {

      e.preventDefault();

      setMessage("");
      setMessageType("");
      setSubmitting(true);

      try {

        const response =
          await fetch(
            `${API_BASE_URL}/login`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  email:
                    email.trim(),

                  password,
                }),
            }
          );

        let data;

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {

          setMessage(
            data.message ||
              data.error ||
              "Login failed."
          );

          setMessageType(
            "error"
          );

          return;
        }

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "userName",
          data.name
        );

        localStorage.setItem(
          "userEmail",
          data.email
        );

        setLoggedIn(true);

      } catch (error) {

        console.error(
          error
        );

        setMessage(
          "Cannot connect to backend."
        );

        setMessageType(
          "error"
        );

      } finally {

        setSubmitting(false);
      }
    };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister =
    async (e) => {

      e.preventDefault();

      setMessage("");
      setMessageType("");

      if (
        password.length < 6
      ) {

        setMessage(
          "Password must be at least 6 characters."
        );

        setMessageType(
          "error"
        );

        return;
      }

      setSubmitting(true);

      try {

        const response =
          await fetch(
            `${API_BASE_URL}/users`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  name:
                    name.trim(),

                  email:
                    email.trim(),

                  password,
                }),
            }
          );

        let data;

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {

          setMessage(
            data.message ||
              data.error ||
              "Registration failed."
          );

          setMessageType(
            "error"
          );

          return;
        }

        setName("");
        setEmail("");
        setPassword("");

        setIsRegistering(
          false
        );

        setMessage(
          "Account created successfully. You can now log in."
        );

        setMessageType(
          "success"
        );

      } catch (error) {

        console.error(
          error
        );

        setMessage(
          "Cannot connect to backend."
        );

        setMessageType(
          "error"
        );

      } finally {

        setSubmitting(false);
      }
    };

  // =========================================================
  // SWITCH LOGIN / REGISTER
  // =========================================================

  const handleSwitchMode =
    () => {

      setIsRegistering(
        !isRegistering
      );

      setMessage("");
      setMessageType("");

      setPassword("");

      setShowPassword(
        false
      );
    };

  // =========================================================
  // LOGGED IN
  // =========================================================

  if (loggedIn) {

    return (
      <Dashboard />
    );
  }

  // =========================================================
  // LOGIN / REGISTER UI
  // =========================================================

  return (

    <div className="auth-page">

      {/* =====================================================
          LEFT BRAND PANEL
      ====================================================== */}

      <section className="auth-brand-panel">

        <div className="auth-brand-top">

          <div className="auth-logo">

            <div className="auth-logo-icon">
              S
            </div>

            <div className="auth-logo-text">

              <strong>
                SplitFlow
              </strong>

              <span>
                Expense Manager
              </span>

            </div>

          </div>

        </div>

        <div className="auth-brand-content">

          <p className="auth-eyebrow">
            SHARED EXPENSES MADE SIMPLE
          </p>

          <h1>

            Split expenses.

            <br />

            Settle balances.

            <br />

            Stay organised.

          </h1>

          <p className="auth-brand-description">

            Manage shared expenses
            with friends, housemates,
            travel groups and more —
            all in one place.

          </p>

          <div className="auth-features">

            <div className="auth-feature">

              <div className="auth-feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Smart expense splitting
                </strong>

                <span>

                  Split equally, by exact
                  amount or percentage.

                </span>

              </div>

            </div>

            <div className="auth-feature">

              <div className="auth-feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Track group balances
                </strong>

                <span>

                  See exactly who owes
                  whom at any time.

                </span>

              </div>

            </div>

            <div className="auth-feature">

              <div className="auth-feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Budget & analytics
                </strong>

                <span>

                  Understand spending
                  patterns across groups.

                </span>

              </div>

            </div>

          </div>

        </div>

        <div className="auth-brand-footer">

          <span>
            SplitFlow
          </span>

          <span>
            Simple • Secure • Organised
          </span>

        </div>

      </section>

      {/* =====================================================
          RIGHT AUTH PANEL
      ====================================================== */}

      <section className="auth-form-panel">

        <div className="auth-card">

          {/* MOBILE LOGO */}

          <div className="auth-mobile-logo">

            <div className="auth-logo-icon">
              S
            </div>

            <strong>
              SplitFlow
            </strong>

          </div>

          <div className="auth-card-header">

            <p className="auth-card-eyebrow">

              {isRegistering
                ? "GET STARTED"
                : "WELCOME BACK"}

            </p>

            <h2>

              {isRegistering
                ? "Create your account"
                : "Sign in to SplitFlow"}

            </h2>

            <p>

              {isRegistering
                ? "Create an account and start managing shared expenses."
                : "Enter your details to continue to your dashboard."}

            </p>

          </div>

          {/* MESSAGE */}

          {message && (

            <div
              className={`auth-message ${messageType}`}
            >

              <div className="auth-message-icon">

                {messageType ===
                "success"
                  ? "✓"
                  : "!"}

              </div>

              <span>
                {message}
              </span>

            </div>

          )}

          {/* =================================================
              REGISTER
          ================================================== */}

          {isRegistering ? (

            <form
              className="auth-form"
              onSubmit={
                handleRegister
              }
            >

              <div className="auth-field">

                <label>
                  Full Name
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    ♙
                  </span>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    autoComplete="name"
                    required
                  />

                </div>

              </div>

              <div className="auth-field">

                <label>
                  Email Address
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    @
                  </span>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              <div className="auth-field">

                <label>
                  Password
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    ●
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >

                    {showPassword
                      ? "Hide"
                      : "Show"}

                  </button>

                </div>

                <span className="password-help">
                  Use at least 6 characters.
                </span>

              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={
                  submitting
                }
              >

                {submitting
                  ? "Creating Account..."
                  : "Create Account"}

              </button>

            </form>

          ) : (

            /* =================================================
               LOGIN
            ================================================== */

            <form
              className="auth-form"
              onSubmit={
                handleLogin
              }
            >

              <div className="auth-field">

                <label>
                  Email Address
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    @
                  </span>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              <div className="auth-field">

                <label>
                  Password
                </label>

                <div className="auth-input-wrapper">

                  <span className="auth-input-icon">
                    ●
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >

                    {showPassword
                      ? "Hide"
                      : "Show"}

                  </button>

                </div>

              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={
                  submitting
                }
              >

                {submitting
                  ? "Signing In..."
                  : "Sign In"}

              </button>

            </form>

          )}

          {/* SWITCH */}

          <div className="auth-switch">

            <span>

              {isRegistering
                ? "Already have an account?"
                : "New to SplitFlow?"}

            </span>

            <button
              type="button"
              onClick={
                handleSwitchMode
              }
            >

              {isRegistering
                ? "Sign in"
                : "Create an account"}

            </button>

          </div>

        </div>

      </section>

    </div>
  );
}

export default App;