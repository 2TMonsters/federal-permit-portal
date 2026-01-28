import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Archive,
  Search, 
  Bell, 
  Settings, 
  Menu,
  User,
  LogOut,
  Building2,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const queryClient = useQueryClient();

  const handleResetDemo = async () => {
    try {
      await fetch("/api/permits/reset", { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["/api/permits"] });
      setLocation("/intake");
    } catch (error) {
      console.error("Failed to reset demo data:", error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Intake Portal', href: '/intake', icon: FileText },
    { name: 'Agency Review', href: '/review', icon: Building2 },
    { name: 'Archive', href: '/archive', icon: Archive },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Banner - Official Gov Header */}
      <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border z-50 relative">
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <img 
                src="/agency-seal.png" 
                alt="Agency Seal" 
                className="h-10 w-10 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Federal Government</span>
                <span className="text-lg font-bold leading-none tracking-tight">Unified Permitting Portal</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center relative max-w-md w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-foreground/50" />
              <Input 
                type="search" 
                placeholder="Search permits, IDs, or locations..." 
                className="pl-9 bg-sidebar-primary/20 border-sidebar-primary-border text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus-visible:ring-sidebar-ring h-9"
              />
            </div>

            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8 border border-sidebar-primary-border">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-foreground font-medium">OS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Officer Smith</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      smith.j@permits.gov
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleResetDemo} className="text-muted-foreground focus:text-primary">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <span>Reset Demo Flow</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-sidebar text-sidebar-foreground w-64 flex-shrink-0 border-r border-sidebar-border transition-all duration-300 ease-in-out transform",
            !isSidebarOpen && "-ml-64 md:ml-0"
          )}
        >
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div 
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground")} />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                  </div>
                </Link>
              );
            })}
          </nav>
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-sidebar-primary/30 rounded-lg p-3 border border-sidebar-primary-border">
              <p className="text-xs font-medium text-sidebar-foreground/80 mb-1">System Status</p>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-sidebar-foreground/60">Maestro Connected</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}