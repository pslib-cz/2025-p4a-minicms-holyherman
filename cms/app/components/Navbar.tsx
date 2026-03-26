import { auth, signIn, signOut } from "@/auth";
import { ThemeToggle } from "./ThemeToggle";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              MiniCMS
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session?.user ? (
              <>
                <a href="/dashboard" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                  Dashboard
                </a>
                <a href="/profile" className="flex items-center gap-2 text-sm px-4 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium">
                  {session.user.image ? (
                    <img src={session.user.image} alt="Profile" className="w-5 h-5 rounded-full" />
                  ) : null}
                  Profile
                </a>
              </>
            ) : (
              <>
                <a href="/login" className="text-sm px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium">
                  Log in
                </a>
                <a href="/register" className="text-sm px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium">
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
