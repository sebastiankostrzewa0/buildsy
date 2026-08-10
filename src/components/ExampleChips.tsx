"use client";

const EXAMPLES = [
  "10m³ betonu C25/30 do Poznania na jutro",
  "8 ton stali zbrojeniowej B500SP do Wrocławia na przyszły tydzień",
  "50 worków cementu, Warszawa, pilne",
  "200 m² styropianu do ocieplenia, Kraków",
  "30 płyt OSB do Gdańska",
  "1000 pustaków ceramicznych, Katowice",
];

export default function ExampleChips({
  onSelect,
}: {
  onSelect: (text: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {EXAMPLES.map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => onSelect(example)}
          className="text-xs sm:text-sm font-mono-data px-3 py-1.5 rounded-full border border-concrete/25 text-concrete/80 hover:border-signal hover:text-signal transition-colors"
        >
          {example}
        </button>
      ))}
    </div>
  );
}
