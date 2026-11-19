"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import devFixtures from "../../fixtures/development.json";
import { Check, ChevronDown } from "lucide-react";

export interface ExampleOption {
  id: string;
  badge: string;
  description: string;
  category: "semantic" | "clean" | "structure";
}

export const EXAMPLES: ExampleOption[] = [
  {
    id: "DEV_NEGATION",
    badge: "DEV_NEGATION",
    description: "Negation dropped in Tamil version",
    category: "semantic",
  },
  {
    id: "DEV_VERB",
    badge: "DEV_VERB",
    description: "Verb mismatch (received vs gave)",
    category: "semantic",
  },
  {
    id: "DEV_CLEAN",
    badge: "DEV_CLEAN",
    description: "Clean mathematical parity control",
    category: "clean",
  },
  {
    id: "DEV_UNCERTAIN",
    badge: "DEV_UNCERTAIN",
    description: "Ambiguous context (needs review)",
    category: "semantic",
  },
  {
    id: "DEV_STRUCTURE",
    badge: "DEV_STRUCTURE",
    description: "Option count mismatch (4 vs 3 options)",
    category: "structure",
  },
];

interface ExampleSelectorProps {
  selectedId: string | "";
  onSelect: (exampleId: string) => void;
  disabled?: boolean;
}

export const ExampleSelector: React.FC<ExampleSelectorProps> = ({
  selectedId,
  onSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  const selectedExample = EXAMPLES.find((ex) => ex.id === selectedId) || null;

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        const idx = EXAMPLES.findIndex((ex) => ex.id === selectedId);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return next;
    });
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % EXAMPLES.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + EXAMPLES.length) % EXAMPLES.length);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (EXAMPLES[highlightedIndex]) {
          onSelect(EXAMPLES[highlightedIndex].id);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
    }
  };

  const handleSelectOption = (id: string) => {
    onSelect(id);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full sm:w-auto">
      {/* Combobox Button Trigger */}
      <button
        ref={triggerRef}
        type="button"
        id="example-selector-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label="Load an example question"
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="w-full sm:w-[250px] md:w-[270px] lg:w-[290px] h-8.5 px-2.5 text-xs font-semibold text-slate-900 border-[1.5px] border-slate-900 rounded-[6px] bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2154F4] shadow-[1.5px_1.5px_0_#0F172A] flex items-center justify-between gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="truncate flex items-center gap-1.5 text-left">
          {selectedExample ? (
            <>
              <span className="font-mono font-bold text-[#2154F4] text-[11px] shrink-0">
                {selectedExample.badge}
              </span>
              <span className="text-slate-600 truncate text-[11px]">
                ({selectedExample.description.split(" ")[0]}...)
              </span>
            </>
          ) : (
            <span className="text-slate-500 font-normal italic text-[11px]">
              Select an example…
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-700 shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Listbox Popover */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Example Questions"
          className="absolute left-0 top-full mt-1.5 z-50 w-full sm:w-[320px] md:w-[350px] bg-white border-[1.5px] border-slate-900 rounded-[6px] shadow-[3px_3px_0_#0F172A] p-1.5 space-y-1 focus:outline-none"
        >
          {EXAMPLES.map((example, index) => {
            const isSelected = example.id === selectedId;
            const isHighlighted = index === highlightedIndex;

            return (
              <div
                key={example.id}
                role="option"
                id={`example-option-${example.id}`}
                aria-selected={isSelected}
                tabIndex={-1}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelectOption(example.id)}
                className={`p-2 rounded-[5px] cursor-pointer transition-colors border ${
                  isSelected
                    ? "bg-[#EEF3FF] border-blue-200 text-[#1435AD]"
                    : isHighlighted
                    ? "bg-slate-100 border-slate-300 text-slate-900"
                    : "bg-white border-transparent text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        example.category === "semantic"
                          ? "bg-amber-500"
                          : example.category === "clean"
                          ? "bg-emerald-500"
                          : "bg-purple-500"
                      }`}
                    />
                    {example.badge}
                  </span>
                  {isSelected && (
                    <span className="flex items-center text-[#2154F4] text-xs font-bold gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="text-[10px] uppercase font-mono">Active</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  {example.description}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
