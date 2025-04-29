"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { TRPCReactProvider } from "@/trpc/react";

export function WrapperQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TRPCReactProvider>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </TRPCReactProvider>
  );
}
