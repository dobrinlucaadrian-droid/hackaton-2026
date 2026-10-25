"use client";
// University field of the opinion form: the student types a few letters and picks the university from the suggestions (Romanian ones first), or "Altă universitate" when it is not in our list.
import { useId, useState } from "react";
import { searchUniversities, universities } from "@/lib/universities";

export const OTHER = "__alta__";

type Props = { value: string; onChange: (id: string) => void; className: string };

export function UniversityPicker({ value, onChange, className }: Props) {
  const chosen = universities.find((u) => u.id === value);
  const [text, setText] = useState(chosen?.name ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const found = text.trim().length >= 2 ? searchUniversities(text, 40) : [];
  const hits = [...found.filter((u) => u.region === "ro"), ...found.filter((u) => u.region !== "ro")].slice(0, 8);
  // the last row is always "Altă universitate"
  const rows = [...hits.map((u) => ({ id: u.id, label: u.name, sub: `${u.city}, ${u.country}` })), { id: OTHER, label: "Altă universitate", sub: "nu e în listă: o scrii tu" }];
  const showList = open && text.trim().length >= 2 && value === "";

  function pick(id: string) {
    const u = universities.find((x) => x.id === id);
    setText(u ? u.name : "");
    setOpen(false);
    onChange(id);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(rows[active].id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  if (value === OTHER) {
    return (
      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        Universitatea nu e în listă: scrie-o mai jos.
        <button type="button" onClick={() => { onChange(""); setText(""); }} className="font-bold text-primary underline underline-offset-2">
          Caut-o din nou
        </button>
      </p>
    );
  }

  return (
    <div className="relative">
      <input
        id="p-uni"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${listId}-${active}` : undefined}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setActive(0);
          setOpen(true);
          if (value) onChange(""); // typing again clears the earlier choice
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKey}
        placeholder="Scrie numele, de exemplu: ASE sau Politehnica"
        autoComplete="off"
        required
        className={className}
      />
      {chosen && <p className="mt-1 text-xs font-bold text-teal-ink">✓ {chosen.city}, {chosen.country}</p>}
      {showList && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-xl bg-card py-1 shadow-lg ring-1 ring-line">
          {rows.map((r, i) => (
            <li
              key={r.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(r.id)}
              className={`cursor-pointer px-4 py-2 ${i === active ? "bg-primary-tint" : ""} ${r.id === OTHER ? "border-t border-line" : ""}`}
            >
              <span className="block font-bold text-ink">{r.label}</span>
              <span className="block text-xs text-ink-soft">{r.sub}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
