'use client';

import React from 'react';

import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/icons';

import { siteConfig } from '@/config/site.config';

export const LandingFooter: React.FC = () => {
    return (
        <footer className="px-6 pb-12">
            <Separator className="bg-slate-200 mb-8" />
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Logo className="w-5 h-5 text-red-500" />
                    GuardM
                </div>
                <div className="flex gap-8">
                    <a 
                        href={siteConfig.links.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-slate-900 transition-colors"
                    >
                        Về chúng tôi
                    </a>
                    <a href={`mailto:${siteConfig.author.email}`} className="hover:text-slate-900 transition-colors">
                        Liên hệ
                    </a>
                </div>
                <span>© 2025 GuardM Project.</span>
            </div>
        </footer>
    );
};


