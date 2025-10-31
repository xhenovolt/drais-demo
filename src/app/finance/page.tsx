"use client";
import React from 'react';
import Link from 'next/link';

export default function FinanceHome(){
  const links = [
    { href:'/finance/wallets', label:'Wallets'},
    { href:'/finance/ledger', label:'Ledger'},
    { href:'/finance/payments', label:'Fee Payments'},
    { href:'/finance/fees', label:'Fee Structures'}
  ];
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold tracking-wide uppercase">Finance Dashboard</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {links.map(l=> (
          <Link key={l.href} href={l.href} className="rounded-xl border border-black/10 dark:border-white/10 p-4 hover:bg-black/5 dark:hover:bg-white/5 font-medium text-sm">{l.label}</Link>
        ))}
      </div>
      <p className="text-xs text-slate-500">Select a module to manage financial records.</p>
    </div>
  );
}