import { signIn } from "@/auth";
import Link from "next/link";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-16 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center font-[var(--font-display)] text-3xl font-extrabold text-on-surface">
          Sign in to your account
        </h2>
        <p className="mt-3 text-center text-sm text-on-surface-variant font-[var(--font-body)]">
          Or&nbsp;
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary-container transition-colors"
          >
            register to create a new one
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-lowest py-10 px-6 shadow-ambient rounded-3xl sm:px-10">
          <form
            action={async (formData) => {
              "use server";
              try {
                await signIn("credentials", formData);
              } catch (error) {
                if (error instanceof AuthError) {
                  if (error.type === "CredentialsSignin") {
                    redirect("/login?error=CredentialsSignin");
                  }
                  redirect("/login?error=Default");
                }
                throw error;
              }
            }}
            className="space-y-7"
          >
            {error === "CredentialsSignin" && (
              <div className="p-4 rounded-xl bg-secondary-container/20 text-secondary text-sm font-medium">
                Invalid email or password
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-on-surface-variant font-[var(--font-body)] mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-4 py-2.5 rounded-xl bg-surface-lowest ghost-border ghost-border-focus text-on-surface text-sm outline-none transition-colors font-[var(--font-body)] placeholder:text-on-surface-variant/50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-on-surface-variant font-[var(--font-body)] mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-4 py-2.5 rounded-xl bg-surface-lowest ghost-border ghost-border-focus text-on-surface text-sm outline-none transition-colors font-[var(--font-body)] placeholder:text-on-surface-variant/50"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 rounded-full gradient-primary text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity"
              >
                Sign in with Credentials
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: "1px solid rgba(187, 202, 191, 0.2)" }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-surface-lowest text-on-surface-variant font-[var(--font-body)]">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/dashboard" });
                }}
              >
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2.5 px-4 rounded-full bg-surface-low text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="sr-only">Sign in with GitHub</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/dashboard" });
                }}
              >
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-2.5 px-4 rounded-full bg-surface-low text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
