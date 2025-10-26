import Link from "next/link";
import Image from "next/image";

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="w-64 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-r border-purple-100 dark:border-purple-800 flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <Image src="/postcare-logo-new.webp" width={50} height={50} alt="Logo" className="rounded-full" />
          <h2 className="text-lg font-bold text-purple-700 dark:text-purple-300">AI PostCare</h2>
        </div>
        <nav className="flex flex-col gap-3 text-sm">
          <Link href="/dashboard/home" className="hover:text-purple-700">Home</Link>
          <Link href="/dashboard/patient" className="hover:text-purple-700 font-medium">Patient Dashboard</Link>
          <Link href="/dashboard/doctor" className="hover:text-purple-700">Doctor Dashboard</Link>
        </nav>
      </div>
      <button onClick={onLogout} className="text-sm text-red-600 hover:text-red-800 mt-8 text-left">
        Log Out
      </button>
    </aside>
  );
}