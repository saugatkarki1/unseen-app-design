"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, User, Loader2 } from "lucide-react";

export default function AuthSwitch() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Google OAuth handler
  const handleGoogleAuth = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Google auth error:", error);
        setError("Failed to connect to Google. Please try again.");
        setIsGoogleLoading(false);
      }
    } catch (err) {
      console.error("Unexpected Google auth error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        const errorMessage = error.message.toLowerCase();

        // Supabase returns "Invalid login credentials" for both non-existent email and wrong password
        // This is intentional security behavior to prevent email enumeration
        if (errorMessage.includes("invalid") || errorMessage.includes("credentials")) {
          setError("Invalid email or password. Please check your credentials or sign up for a new account.");
          return;
        }

        setError(error.message || "Failed to sign in.");
        return;
      }

      if (data.session) {
        // Set server-side cookies for session
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        });

        // Check onboarding status from Supabase
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", data.user.id)
          .single();

        if (profile?.onboarding_completed) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!signupName.trim()) {
      setError("Username is required.");
      return;
    }

    if (!signupEmail.trim() || !signupPassword.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (signupPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setIsLoading(true);

      // Sign up without email confirmation (autoConfirm should be enabled in Supabase)
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
        options: {
          data: {
            full_name: signupName.trim(),
          },
        },
      });

      if (error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes("already registered") || errorMessage.includes("already exists")) {
          setError("This email is already registered. Please sign in instead.");
          return;
        }
        setError(error.message || "Failed to create account.");
        return;
      }

      if (data.user) {
        // Account created successfully - show success and switch to sign-in
        setSuccessMessage("Account created! Please sign in to start onboarding.");

        // Clear signup fields
        setSignupName("");
        setSignupEmail("");
        setSignupPassword("");

        // Pre-fill sign-in email
        setLoginEmail(signupEmail.trim());
        setLoginPassword("");

        // Switch to sign-in mode after a brief delay
        setTimeout(() => {
          setIsSignUp(false);
          setSuccessMessage("Account created! Please sign in to start onboarding.");
        }, 1500);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .auth-container {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 550px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .auth-container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #0B1D51 0%, #1E3A8A 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        .auth-container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }

        .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .auth-container.sign-up-mode .signin-signup {
          left: 25%;
        }

        .auth-form {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 2.5rem;
          transition: all 0.2s 0.7s;
          overflow: hidden;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .auth-form.sign-up-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-form.sign-in-form {
          z-index: 2;
        }

        .auth-container.sign-up-mode .auth-form.sign-up-form {
          opacity: 1;
          z-index: 2;
        }

        .auth-container.sign-up-mode .auth-form.sign-in-form {
          opacity: 0;
          z-index: 1;
        }

        .auth-title {
          font-size: 2rem;
          color: #1f2937;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .input-field {
          max-width: 380px;
          width: 100%;
          background-color: #f3f4f6;
          margin: 10px 0;
          height: 55px;
          border-radius: 55px;
          display: grid;
          grid-template-columns: 15% 85%;
          padding: 0 0.4rem;
          position: relative;
          transition: 0.3s;
        }

        .input-field:focus-within {
          background-color: #e5e7eb;
          box-shadow: 0 0 0 2px #0B1D51;
        }

        .input-field .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .input-field input {
          background: none;
          outline: none;
          border: none;
          line-height: 1;
          font-weight: 500;
          font-size: 1rem;
          color: #1f2937;
          width: 100%;
        }

        .input-field input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .auth-btn {
          width: 150px;
          background-color: #0B1D51;
          border: none;
          outline: none;
          height: 49px;
          border-radius: 49px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 600;
          margin: 10px 0;
          cursor: pointer;
          transition: 0.5s;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .auth-btn:hover:not(:disabled) {
          background-color: #1E3A8A;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(11, 29, 81, 0.4);
        }

        .auth-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .auth-container.sign-up-mode .left-panel {
          pointer-events: none;
        }

        .auth-container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .panel h3 {
          font-weight: 600;
          line-height: 1;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .panel p {
          font-size: 0.95rem;
          padding: 0.7rem 0;
          opacity: 0.9;
        }

        .btn-transparent {
          margin: 0;
          background: none;
          border: 2px solid #fff;
          width: 130px;
          height: 41px;
          font-weight: 600;
          font-size: 0.8rem;
          border-radius: 41px;
          color: #fff;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-transparent:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .right-panel .content {
          transform: translateX(800px);
        }

        .auth-container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }

        .auth-container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          max-width: 380px;
          margin: 10px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background-color: #e5e7eb;
        }

        .divider-text {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .google-btn {
          max-width: 380px;
          width: 100%;
          height: 49px;
          border-radius: 49px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #1f2937;
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .google-btn:hover:not(:disabled) {
          background-color: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .google-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.85rem;
          margin-bottom: 10px;
          text-align: center;
          max-width: 380px;
        }

        .success-message {
          color: #4CAF50;
          font-size: 0.85rem;
          margin-bottom: 10px;
          text-align: center;
          max-width: 380px;
        }

        @media (max-width: 870px) {
          .auth-container {
            min-height: 800px;
            height: auto;
            max-height: 100vh;
          }
          .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .signin-signup,
          .auth-container.sign-up-mode .signin-signup {
            left: 50%;
          }
          .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .right-panel {
            grid-row: 3 / 4;
          }
          .left-panel {
            grid-row: 1 / 2;
          }
          .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .panel h3 {
            font-size: 1.2rem;
          }
          .panel p {
            font-size: 0.7rem;
            padding: 0.5rem 0;
          }
          .btn-transparent {
            width: 110px;
            height: 35px;
            font-size: 0.7rem;
          }
          .auth-container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .auth-container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .auth-container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .auth-container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .right-panel .content {
            transform: translateY(300px);
          }
          .auth-container.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
        }

        @media (max-width: 570px) {
          .auth-form {
            padding: 0 1.5rem;
          }
          .panel .content {
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      <div className={`auth-container ${isSignUp ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* Sign In Form */}
            <form className="auth-form sign-in-form" onSubmit={handleSignIn}>
              <h2 className="auth-title">Sign in</h2>

              {error && !isSignUp && <p className="error-message">{error}</p>}
              {successMessage && !isSignUp && <p className="success-message">{successMessage}</p>}

              <div className="input-field">
                <span className="icon-wrapper">
                  <Mail size={20} />
                </span>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setError("");
                  }}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <div className="input-field">
                <span className="icon-wrapper">
                  <Lock size={20} />
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setError("");
                  }}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <button type="submit" className="auth-btn" disabled={isLoading || isGoogleLoading}>
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Login"}
              </button>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">or</span>
                <div className="divider-line" />
              </div>

              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleAuth}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Form */}
            <form className="auth-form sign-up-form" onSubmit={handleSignUp}>
              <h2 className="auth-title">Sign up</h2>

              {error && isSignUp && <p className="error-message">{error}</p>}
              {successMessage && isSignUp && <p className="success-message">{successMessage}</p>}

              <div className="input-field">
                <span className="icon-wrapper">
                  <User size={20} />
                </span>
                <input
                  type="text"
                  placeholder="Username"
                  value={signupName}
                  onChange={(e) => {
                    setSignupName(e.target.value);
                    setError("");
                  }}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <div className="input-field">
                <span className="icon-wrapper">
                  <Mail size={20} />
                </span>
                <input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    setError("");
                  }}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <div className="input-field">
                <span className="icon-wrapper">
                  <Lock size={20} />
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    setError("");
                  }}
                  disabled={isLoading || isGoogleLoading}
                />
              </div>
              <button type="submit" className="auth-btn" disabled={isLoading || isGoogleLoading}>
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Sign up"}
              </button>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">or</span>
                <div className="divider-line" />
              </div>

              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleAuth}
                disabled={isLoading || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign up with Google
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <p>Join us today and discover a world of possibilities. Create your account in seconds!</p>
              <button className="btn-transparent" onClick={() => { setIsSignUp(true); setError(""); setSuccessMessage(""); }} type="button">
                Sign up
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Welcome back! Sign in to continue your journey with us.</p>
              <button className="btn-transparent" onClick={() => { setIsSignUp(false); setError(""); setSuccessMessage(""); }} type="button">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
