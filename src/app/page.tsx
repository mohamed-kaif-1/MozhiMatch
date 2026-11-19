"use client";

import React from "react";
import { I18nProvider } from "../i18n/provider";
import { Workbench } from "../components/workbench/Workbench";

export default function Page() {
  return (
    <I18nProvider>
      <main className="min-h-screen px-3 sm:px-4 lg:px-6 py-2.5 max-w-[1720px] mx-auto">
        <Workbench />
      </main>
    </I18nProvider>
  );
}
