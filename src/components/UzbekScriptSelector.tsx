import React, { useEffect, useState } from 'react';
import { getUzbekScript, setUzbekScript, type UzbekScript } from '../utils/uzbekScript';

const OPTIONS: { value: UzbekScript; label: string }[] = [
  { value: 'latin', label: 'Lotin (amaldagi)' },
  { value: 'cyrillic', label: 'Кирилл' },
  { value: 'updated-latin', label: 'Lotin (taklif etilgan)' },
];

export function UzbekScriptSelector() {
  const [script, setScript] = useState<UzbekScript>(() => getUzbekScript());

  useEffect(() => {
    setUzbekScript(script);
  }, [script]);

  return (
    <div
      data-uzbek-script-control="true"
      className="fixed top-2 right-2 z-[60] flex items-center gap-2 rounded-lg border border-white/15 bg-slate-950/90 px-2.5 py-1.5 shadow-lg backdrop-blur-md"
    >
      <label htmlFor="uzbek-script-select" className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
        Yozuv
      </label>
      <select
        id="uzbek-script-select"
        value={script}
        onChange={(event) => setScript(event.target.value as UzbekScript)}
        className="max-w-[155px] cursor-pointer bg-transparent text-xs font-medium text-white outline-none"
        aria-label="O‘zbek yozuvini tanlang"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900 text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
