"use client"
import React, { useState } from "react";
import {
    Home,
    Megaphone,
    Image,
    FileText,
    BarChart3,
    Settings,
    HelpCircle,
    ChevronsRight,
    ChevronDown,
} from "lucide-react";

interface SidebarProps {
    onNavigate?: (section: string) => void;
    defaultOpen?: boolean;
}

export const CollapsibleSidebar = ({ onNavigate, defaultOpen = true }: SidebarProps) => {
    const [open, setOpen] = useState(defaultOpen);
    const [selected, setSelected] = useState("Dashboard");

    const handleSelect = (title: string) => {
        setSelected(title);
        onNavigate?.(title);
    };

    return (
        <nav
            className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${open ? 'w-64' : 'w-16'
                } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm`}
        >
            <TitleSection open={open} />

            <div className="space-y-1 mb-8">
                <Option
                    Icon={Home}
                    title="Dashboard"
                    selected={selected}
                    setSelected={handleSelect}
                    open={open}
                />
                <Option
                    Icon={Megaphone}
                    title="Campaigns"
                    selected={selected}
                    setSelected={handleSelect}
                    open={open}
                    notifs={3}
                />
                <Option
                    Icon={Image}
                    title="Creatives"
                    selected={selected}
                    setSelected={handleSelect}
                    open={open}
                />
                <Option
                    Icon={FileText}
                    title="Templates"
                    selected={selected}
                    setSelected={handleSelect}
                    open={open}
                />
                <Option
                    Icon={BarChart3}
                    title="Analytics"
                    selected={selected}
                    setSelected={handleSelect}
                    open={open}
                />
            </div>

            {open && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Account
                    </div>
                    <Option
                        Icon={Settings}
                        title="Settings"
                        selected={selected}
                        setSelected={handleSelect}
                        open={open}
                    />
                    <Option
                        Icon={HelpCircle}
                        title="Help"
                        selected={selected}
                        setSelected={handleSelect}
                        open={open}
                    />
                </div>
            )}

            <ToggleClose open={open} setOpen={setOpen} />
        </nav>
    );
};

interface OptionProps {
    Icon: React.ElementType;
    title: string;
    selected: string;
    setSelected: (title: string) => void;
    open: boolean;
    notifs?: number;
}

const Option = ({ Icon, title, selected, setSelected, open, notifs }: OptionProps) => {
    const isSelected = selected === title;

    return (
        <button
            onClick={() => setSelected(title)}
            className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${isSelected
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
        >
            <div className="grid h-full w-12 place-content-center">
                <Icon className="h-4 w-4" />
            </div>

            {open && (
                <span className="text-sm font-medium">
                    {title}
                </span>
            )}

            {notifs && open && (
                <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white font-medium">
                    {notifs}
                </span>
            )}
        </button>
    );
};

interface TitleSectionProps {
    open: boolean;
}

const TitleSection = ({ open }: TitleSectionProps) => {
    return (
        <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-3">
                    <Logo />
                    {open && (
                        <div>
                            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Ad Builder
                            </span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                                SME Platform
                            </span>
                        </div>
                    )}
                </div>
                {open && <ChevronDown className="h-4 w-4 text-gray-400" />}
            </div>
        </div>
    );
};

const Logo = () => {
    return (
        <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
            <Megaphone className="h-5 w-5 text-white" />
        </div>
    );
};

interface ToggleCloseProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const ToggleClose = ({ open, setOpen }: ToggleCloseProps) => {
    return (
        <button
            onClick={() => setOpen(!open)}
            className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
            <div className="flex items-center p-3">
                <div className="grid size-10 place-content-center">
                    <ChevronsRight
                        className={`h-4 w-4 transition-transform duration-300 text-gray-500 ${open ? "rotate-180" : ""
                            }`}
                    />
                </div>
                {open && (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Hide
                    </span>
                )}
            </div>
        </button>
    );
};

export default CollapsibleSidebar;
