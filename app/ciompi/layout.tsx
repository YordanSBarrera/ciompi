'use client';

import AuthGuard from '@/app/components/AuthGuard';

export default function CiompiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
