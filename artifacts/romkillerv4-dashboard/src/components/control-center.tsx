import { Link, useLocation } from 'wouter';
import { useHealthCheck, getHealthCheckQueryKey } from '@workspace/api-client-react';
import {
  Activity, BarChart3, Bot, ChevronRight, CircleHelp, Coins, Gift,
  Gamepad2, LayoutDashboard, LockKeyhole, Menu, PanelLeftClose, PanelLeftOpen,
  Radio, Settings, ShieldCheck, Sparkles, Ticket, X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

export const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard, group: 'Command' },
  { href: '/moderation', label: 'Moderation', icon: ShieldCheck, group: 'Command' },
  { href: '/tickets', label: 'Tickets', icon: Ticket, group: 'Command' },
  { href: '/minecraft', label: 'Minecraft', icon: Gamepad2, group: 'Operations' },
  { href: '/economy', label: 'Economy', icon: Coins, group: 'Operations' },
  { href: '/giveaways', label: 'Giveaways', icon: Gift, group: 'Engagement' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, group: 'Engagement' },
  { href: '/ai', label: 'AI assistant', icon: Sparkles, group: 'Intelligence' },
  { href: '/security', label: 'Security', icon: LockKeyhole, group: 'Intelligence' },
  { href: '/settings', label: 'Settings', icon: Settings, group: 'System' },
];

export function StatusDot({ status = 'online' }: { status?: string }) {
  const positive = ['online', 'healthy', 'active', 'enabled', 'operational'].includes(status.toLowerCase());
  const warning = ['degraded', 'pending', 'paused'].includes(status.toLowerCase());
  return <span className={`inline-block h-2 w-2 rounded-full ${positive ? 'bg-[#b8d957]' : warning ? 'bg-[#e4a449]' : 'bg-[#d46a5f]'}`} />;
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'lime' }) {
  const tones = {
    neutral: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
    good: 'bg-[#e8f1cd] text-[#4d6420]',
    warn: 'bg-[#f8ead1] text-[#8a5b16]',
    bad: 'bg-[#f8dfdb] text-[#963d35]',
    lime: 'bg-[#d7ed8c] text-[#344b16]',
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${tones[tone]}`}>{children}</span>;
}

export function SectionHeading({ eyebrow, title, detail, action }: { eyebrow?: string; title: string; detail?: string; action?: ReactNode }) {
  return <div className="mb-5 flex items-end justify-between gap-4">
    <div>
      {eyebrow && <div className="mb-1 font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">{eyebrow}</div>}
      <h2 className="font-serif text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">{title}</h2>
      {detail && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{detail}</p>}
    </div>
    {action}
  </div>;
}

export function Card({ children, className = '', testId }: { children: ReactNode; className?: string; testId?: string }) {
  return <section data-testid={testId} className={`rounded-2xl border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] shadow-[0_8px_22px_hsl(162_30%_15%/.035)] ${className}`}>{children}</section>;
}

export function Button({ children, className = '', variant = 'primary', onClick, type = 'button', testId }: { children: ReactNode; className?: string; variant?: 'primary' | 'quiet' | 'outline' | 'danger'; onClick?: () => void; type?: 'button' | 'submit'; testId?: string }) {
  const variants = {
    primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90',
    quiet: 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
    outline: 'border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]',
    danger: 'bg-[#f4dfdc] text-[#963d35] hover:bg-[#efd0cb]',
  };
  return <button data-testid={testId} type={type} onClick={onClick || (() => window.alert('This control is ready for the next server sync.'))} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold ${variants[variant]} ${className}`}>{children}</button>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[hsl(var(--muted))] ${className}`} />;
}

export function QueryState({ loading, error, empty, retry, children }: { loading?: boolean; error?: boolean; empty?: boolean; retry?: () => void; children?: ReactNode }) {
  if (loading) return <div className="grid gap-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  if (error) return <div className="rounded-xl border border-[#e7bbb5] bg-[#fbebe8] p-5 text-sm text-[#963d35]"><div className="font-bold">Could not reach the control plane</div><div className="mt-1 text-xs opacity-80">The latest response was unavailable. Nothing has been changed.</div>{retry && <Button variant="danger" className="mt-4" onClick={retry} testId="button-retry">Try again</Button>}</div>;
  if (empty) return <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] px-5 py-9 text-center"><CircleHelp className="mx-auto mb-2 h-5 w-5 text-[hsl(var(--muted-foreground))]" /><p className="text-sm font-bold">Nothing to review yet</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">New activity will appear here when the community moves.</p></div>;
  return <>{children}</>;
}

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const health = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 30000 } });
  const current = navItems.find(n => n.href === location);
  return <div className="cc-noise min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
    <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-[260px] border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] transition-transform md:translate-x-0 ${collapsed ? 'md:w-[82px]' : ''}`}>
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-8 flex items-center justify-between px-2">
          <Link href="/" data-testid="link-brand" className="flex items-center gap-3 overflow-hidden">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"><Radio className="h-5 w-5" /></span>
            {!collapsed && <span className="min-w-max"><strong className="block font-serif text-sm tracking-tight">ROMKILLER<span className="text-[hsl(var(--sidebar-primary))]">V4</span></strong><small className="font-mono text-[9px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.55)]">Control Center</small></span>}
          </Link>
          <button className="rounded-md p-1 text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))] md:hidden" onClick={() => setMobileOpen(false)} data-testid="button-close-menu"><X className="h-4 w-4" /></button>
        </div>
        {['Command', 'Operations', 'Engagement', 'Intelligence', 'System'].map(group => <div key={group} className="mb-5">
          {!collapsed && <div className="mb-2 px-3 font-mono text-[9px] uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground)/.42)]">{group}</div>}
          <div className="grid gap-1">{navItems.filter(n => n.group === group).map(item => {
            const active = location === item.href;
            const Icon = item.icon;
            return <Link href={item.href} key={item.href} onClick={() => setMobileOpen(false)} data-testid={`link-nav-${item.label.toLowerCase().replace(' ', '-')}`} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold ${active ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`}>
              <Icon className="h-4 w-4 shrink-0" />{!collapsed && <span>{item.label}</span>}{active && !collapsed && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
            </Link>;
          })}</div>
        </div>)}
        <div className="mt-auto border-t border-[hsl(var(--sidebar-border))] pt-3">
          <div className={`flex items-center gap-3 rounded-lg px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d9a06e] text-xs font-extrabold text-[#51331e]">RK</div>
            {!collapsed && <div className="min-w-0"><div className="truncate text-xs font-bold">Server owner</div><div className="flex items-center gap-1.5 font-mono text-[10px] text-[hsl(var(--sidebar-foreground)/.5)]"><StatusDot status={health.data?.status} />{health.data?.status || 'connecting'}</div></div>}
          </div>
          <button onClick={() => setCollapsed(v => !v)} className="mt-2 hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-[10px] text-[hsl(var(--sidebar-foreground)/.45)] hover:bg-[hsl(var(--sidebar-accent))] md:flex" data-testid="button-collapse-sidebar">{collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Collapse sidebar</>}</button>
        </div>
      </div>
    </aside>
    <div className={`${collapsed ? 'md:pl-[82px]' : 'md:pl-[260px]'} min-h-[100dvh] transition-[padding]`}>
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.9)] px-5 backdrop-blur-md md:px-8">
        <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg border border-[hsl(var(--border))] p-2 md:hidden" data-testid="button-open-menu"><Menu className="h-4 w-4" /></button><div><div className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Workspace / {current?.group}</div><div className="font-serif text-sm font-bold">{current?.label || 'Overview'}</div></div></div>
        <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-[10px] font-semibold text-[hsl(var(--muted-foreground))] sm:flex"><span className="cc-pulse h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />Live sync</div><button onClick={() => window.alert('Control Center help is available in the server owner handbook.')} className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" data-testid="button-help"><CircleHelp className="h-4 w-4" /></button></div>
      </header>
      <main className="mx-auto max-w-[1480px] p-5 md:p-8">{children}</main>
    </div>
  </div>;
}

export function StatCard({ label, value, detail, icon: Icon, tone = 'green' }: { label: string; value: string | number; detail?: string; icon: typeof Activity; tone?: 'green' | 'orange' | 'blue' | 'red' }) {
  const tones = { green: 'bg-[#e7f0c8] text-[#526a20]', orange: 'bg-[#f7e8d3] text-[#95601e]', blue: 'bg-[#dcebee] text-[#326776]', red: 'bg-[#f5dfdb] text-[#963d35]' };
  return <Card className="relative overflow-hidden p-5"><div className={`mb-5 grid h-9 w-9 place-items-center rounded-lg ${tones[tone]}`}><Icon className="h-4 w-4" /></div><div className="font-mono text-[10px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">{label}</div><div className="mt-1 font-serif text-3xl font-bold tracking-tight">{value}</div>{detail && <div className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">{detail}</div>}<div className="absolute -right-7 -top-7 h-24 w-24 rounded-full border-[16px] border-[hsl(var(--muted)/.6)]" /></Card>;
}

export function MiniChart({ color = '#b8d957', points = '0,38 16,34 32,36 48,22 64,27 80,13 96,18 112,6 128,12 144,2' }: { color?: string; points?: string }) {
  return <svg viewBox="0 0 144 42" className="h-12 w-full overflow-visible" aria-hidden="true"><polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><polyline points={`0,42 ${points} 144,42`} fill={`${color}`} opacity=".08" /></svg>;
}
