import { auth } from "@/auth";
import { ThemeToggle } from "./ThemeToggle";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="font-[var(--font-display)] text-xl font-bold text-primary">
              CMS
            </a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session?.user ? (
              <>
                <a
                  href="/dashboard"
                  className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="/profile"
                  className="flex items-center gap-2 text-sm px-5 py-2 rounded-full bg-surface-low text-on-surface hover:bg-outline-variant/30 transition-colors font-semibold"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="Profile" className="w-5 h-5 rounded-full" />
                  ) : null}
                  Profile
                </a>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-sm px-5 py-2 rounded-full ghost-border text-on-surface-variant hover:text-primary transition-colors font-semibold"
                >
                  Log in
                </a>
                <a
                  href="/register"
                  className="text-sm px-5 py-2 rounded-full gradient-primary text-on-primary hover:opacity-90 transition-opacity font-semibold"
                >
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
