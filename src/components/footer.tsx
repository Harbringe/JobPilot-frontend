import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-[#E8E8ED] bg-white">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-[#1D1D1F] flex items-center justify-center">
                                <Zap className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-base font-semibold">JobPilot</span>
                        </Link>
                        <p className="text-sm text-[#86868B] leading-relaxed">
                            AI-powered job applications. <br />One tap to apply everywhere.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-4">
                            Product
                        </h4>
                        <ul className="space-y-3">
                            <li><Link href="/#features" className="text-sm text-[#1D1D1F] hover:text-[#2997FF] transition-colors">Features</Link></li>
                            <li><Link href="/jobs" className="text-sm text-[#1D1D1F] hover:text-[#2997FF] transition-colors">Browse Jobs</Link></li>
                            <li><Link href="/#how-it-works" className="text-sm text-[#1D1D1F] hover:text-[#2997FF] transition-colors">How it Works</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-4">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            <li><span className="text-sm text-[#1D1D1F]">About</span></li>
                            <li><span className="text-sm text-[#1D1D1F]">Blog</span></li>
                            <li><span className="text-sm text-[#1D1D1F]">Careers</span></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-4">
                            Legal
                        </h4>
                        <ul className="space-y-3">
                            <li><span className="text-sm text-[#1D1D1F]">Privacy</span></li>
                            <li><span className="text-sm text-[#1D1D1F]">Terms</span></li>
                            <li><span className="text-sm text-[#1D1D1F]">Contact</span></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#E8E8ED] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-[#86868B]">
                        © 2026 JobPilot. All rights reserved.
                    </p>
                    <p className="text-xs text-[#86868B]">
                        Built with AI. Designed for humans.
                    </p>
                </div>
            </div>
        </footer>
    );
}
