"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        const signInResult = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (signInResult?.error) {
          setError(signInResult.error);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-16 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center font-[var(--font-display)] text-3xl font-extrabold text-on-surface">
          Create a new account
        </h2>
        <p className="mt-3 text-center text-sm text-on-surface-variant font-[var(--font-body)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-container transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-lowest py-10 px-6 shadow-ambient rounded-3xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-7">
            {error && (
              <div className="p-4 rounded-xl bg-secondary-container/20 text-secondary text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-on-surface-variant font-[var(--font-body)] mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-4 py-2.5 rounded-xl bg-surface-lowest ghost-border ghost-border-focus text-on-surface text-sm outline-none transition-colors font-[var(--font-body)] placeholder:text-on-surface-variant/50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface-variant font-[var(--font-body)] mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full px-4 py-2.5 rounded-xl bg-surface-lowest ghost-border ghost-border-focus text-on-surface text-sm outline-none transition-colors font-[var(--font-body)] placeholder:text-on-surface-variant/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface-variant font-[var(--font-body)] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full px-4 py-2.5 rounded-xl bg-surface-lowest ghost-border ghost-border-focus text-on-surface text-sm outline-none transition-colors font-[var(--font-body)] placeholder:text-on-surface-variant/50"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-full gradient-primary text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
