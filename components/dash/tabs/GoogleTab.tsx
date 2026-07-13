"use client";

import type { GoogleRow } from "@/lib/types";
import { EmptyState } from "@/components/dash/ui";
import { IconGoogle } from "@/components/dash/icons";

export function GoogleTab({ rows }: { rows: GoogleRow[] }) {
  return (
    <div className="space-y-6">
      {rows.length === 0 ? (
        <EmptyState
          icon={<IconGoogle size={30} />}
          title="Campanha em breve"
          message="A campanha de Google Ads ainda não está em veiculação — não há dados no período. Assim que os anúncios entrarem no ar, os indicadores aparecerão aqui automaticamente."
        />
      ) : (
        <EmptyState
          icon={<IconGoogle size={30} />}
          title="Dados recebidos"
          message={`${rows.length} registros disponíveis. A visualização detalhada do Google Ads será ativada nesta aba.`}
        />
      )}
    </div>
  );
}
