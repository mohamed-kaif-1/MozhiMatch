"use client";

import React from "react";
import { I18nProvider } from "../i18n/provider";
import { Workbench } from "../components/workbench/Workbench";

export default function Page() {
  return (
    <I18nProvider>
      <main className="min-h-screen py-4">
        <Workbench />
      </main>
    </I18nProvider>
  );
}
