'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>('login');

    // Determine active tab from URL
    useEffect(() => {
        if (pathname === '/auth') {
            router.push('/auth/login');
            return;
        }

        const path = pathname.split('/').pop();
        if (path === 'login' || path === 'signup') {
            setActiveTab(path);
        }
    }, [pathname, router]);

    const handleTabChange = (tab: string) => {
        router.push(`/auth/${tab}`);
    };

    return (
        <div className="w-full min-h-screen flex flex-col" data-oid=".qr4p:6">
            {/* Header */}
            <motion.header
                className="w-full p-6 flex justify-between items-center border-b border-gray-800 bg-black"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                data-oid="z13cjo6"
            >
                <div className="text-white font-bold text-xl tracking-wide" data-oid="sy4mr41">
                    UMBRA
                </div>
                <div className="flex items-center gap-6" data-oid="sh.ayek">
                    <Link href="/" data-oid="1jmh_.9">
                        <button
                            className="text-white border border-gray-800 px-5 py-2 hover:bg-gray-900 transition-colors"
                            data-oid="ye5s8jn"
                        >
                            Home
                        </button>
                    </Link>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6" data-oid="vtk13nf">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    data-oid="si5t25z"
                >
                    {/* Auth Container */}
                    <div className="border border-gray-800 overflow-hidden" data-oid="72l1ywu">
                        {/* Tabs */}
                        <div
                            className="grid grid-cols-2 border-b border-gray-800"
                            data-oid="k4p5jqi"
                        >
                            <button
                                className={`py-4 text-center transition-colors tracking-wider ${
                                    activeTab === 'signup'
                                        ? 'bg-[#111] text-white'
                                        : 'bg-transparent text-gray-400 hover:text-gray-300'
                                }`}
                                onClick={() => handleTabChange('signup')}
                                data-oid="vl:1l9:"
                            >
                                SIGN UP
                            </button>
                            <button
                                className={`py-4 text-center transition-colors tracking-wider ${
                                    activeTab === 'login'
                                        ? 'bg-[#111] text-white'
                                        : 'bg-transparent text-gray-400 hover:text-gray-300'
                                }`}
                                onClick={() => handleTabChange('login')}
                                data-oid="a_hbycm"
                            >
                                LOGIN
                            </button>
                        </div>

                        {/* Content */}
                        <div className="bg-[#0a0a0f] p-7" data-oid="zgyl-lo">
                            <AnimatePresence mode="wait" data-oid="_ifmu2c">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    data-oid="_ygonnw"
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
