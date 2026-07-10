import { BirthDataForm } from "@/components/forms/BirthDataForm";

export default function NovoMapaPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold">
          Vamos criar seu <span className="text-gradient">mapa astral</span>
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Quanto mais precisos os dados, mais preciso o seu mapa.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-8">
        <BirthDataForm />
      </div>
    </div>
  );
}
