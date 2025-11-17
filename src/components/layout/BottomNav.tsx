"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
	LayoutDashboard,
	Users,
	Briefcase,
	GraduationCap,
	Wallet2,
	MoreHorizontal,
	Settings,
	Palette,
	User,
	HelpCircle,
	Calendar,
	DollarSign,
	BadgeDollarSign,
	BookOpen,
	CalendarCheck2,
} from "lucide-react";
import clsx from "clsx";
import React, { useState } from "react";

const coreItems = [
	{ href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard },
	{ href: "/students/list", label: "nav.students.list", icon: Users },
	{ href: "/staff/list", label: "nav.staff.list", icon: Briefcase },
	{ href: "/academics/classes", label: "nav.academics.classes", icon: GraduationCap },
	{ href: "/finance/fees", label: "nav.finance.fees", icon: Wallet2 },
];

const moreItems = [
	{ href: "/settings/school", label: "Settings", icon: Settings },
	{ href: "/settings/theme", label: "Theme", icon: Palette },
	{ href: "/profile", label: "Profile", icon: User },
	{ href: "/help", label: "Help", icon: HelpCircle },
];

export const BottomNav: React.FC = () => {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	return (
		<>
			<nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border-t border-white/20 dark:border-white/10 h-16 flex items-stretch">
				{coreItems.map((i) => {
					const Icon = i.icon;
					const active = pathname.startsWith(i.href);
					return (
						<a
							key={i.href}
							href={i.href}
							className="flex-1 flex flex-col items-center justify-center text-[11px] font-medium relative group"
						>
							<Icon
								className={clsx(
									"w-5 h-5 mb-0.5",
									active
										? "text-[var(--color-primary)]"
										: "text-gray-500 group-hover:text-gray-800 dark:group-hover:text-gray-200"
								)}
							/>
							<span className={clsx(active ? "text-[var(--color-primary)]" : "text-gray-500")}>
								{i.label}
							</span>
							{active && (
								<span className="absolute top-0 inset-x-6 h-1 rounded-b-full bg-[var(--color-primary)]" />
							)}
						</a>
					);
				})}
				<button
					onClick={() => setOpen(true)}
					className="w-16 flex flex-col items-center justify-center text-[11px] font-medium relative group"
				>
					<MoreHorizontal className="w-6 h-6 mb-0.5" />
					<span>More</span>
				</button>
			</nav>
			{open && (
				<div className="md:hidden fixed inset-0 z-50 flex flex-col">
					<div
						className="flex-1 bg-black/50 backdrop-blur-sm"
						onClick={() => setOpen(false)}
					/>
					<div className="bg-white dark:bg-gray-900 rounded-t-2xl p-6 shadow-2xl max-h-[70vh] overflow-y-auto space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-semibold tracking-wide uppercase text-gray-600 dark:text-gray-300">
								More
							</h4>
							<button
								onClick={() => setOpen(false)}
								className="text-xs px-2 py-1 rounded-md bg-black/5 dark:bg-white/10"
							>
								Close
							</button>
						</div>
						<div className="grid grid-cols-2 gap-3">
							{moreItems.map((m) => {
								const Icon = m.icon;
								const active = pathname.startsWith(m.href);
								return (
									<a
										key={m.href}
										href={m.href}
										className={clsx(
											"flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border",
											active
												? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/30"
												: "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
										)}
									>
										<Icon className="w-4 h-4" /> {m.label}
									</a>
								);
							})}
							<Link
								href="/terms/list"
								className="flex flex-col items-center gap-1 text-[10px] font-medium text-gray-600 dark:text-gray-300"
							>
								<Calendar className="w-5 h-5" />
								Terms
							</Link>
							<a
								href="/finance"
								className="flex flex-col items-center gap-1 text-[10px] font-medium text-gray-600 dark:text-gray-300"
							>
								<DollarSign className="w-5 h-5" /> Finance
							</a>
							<a
								href="/payroll"
								className="flex flex-col items-center gap-1 text-[10px] font-medium text-gray-600 dark:text-gray-300"
							>
								<BadgeDollarSign className="w-5 h-5" /> Payroll
							</a>
							<a
								href="/academics"
								className="flex flex-col items-center gap-1 text-[10px] font-medium text-gray-600 dark:text-gray-300"
							>
								<BookOpen className="w-5 h-5" /> Academics
							</a>
							<a
								href="/attendance"
								className="flex flex-col items-center gap-1 text-[10px] font-medium text-gray-600 dark:text-gray-300"
							>
								<CalendarCheck2 className="w-5 h-5" /> Attendance
							</a>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default BottomNav;
