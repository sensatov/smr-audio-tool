"use client";

import { useState } from "react";

const QA_ITEMS = [
  "Title, author, and deck are correct",
  "Numbers are properly spelled out",
  "Company/person names are spelled for pronunciation",
  "Quotes are clearly introduced",
  'List items use "Number one," "Number two," etc.',
];

export default function QAChecklist() {
  const [checked, setChecked] = useState(() => QA_ITEMS.map(() => false));

  return (
    <div className="app-panel">
      <h3 className="font-serif text-xl text-smrBlue">QA Checklist</h3>
      <ul className="mt-3 space-y-2">
        {QA_ITEMS.map((item, index) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-2 rounded-md p-1 text-sm hover:bg-slate-50">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-smrBlue"
                checked={checked[index]}
                onChange={() =>
                  setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)))
                }
              />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
