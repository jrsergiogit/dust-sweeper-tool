"use client";

import { useEffect } from "react";

export default function CleanUrl() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // TRAVA DE SEGURANÇA: Não executa nada se estiver no localhost ou 127.0.0.1
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return;
    }

    const url = new URL(window.location.href);
    let changed = false;

    // Lista de parâmetros para remover
    const paramsToRemove = [
      "_gl", "fbclid", "msclkid"
    ];

    // Remove parâmetros que começam com ou são iguais aos da lista
    for (const key of Array.from(url.searchParams.keys())) {
      if (
        paramsToRemove.includes(key) ||
        key.startsWith("_ga") ||
        key.startsWith("_gcl") ||
        key.startsWith("utm")
      ) {
        url.searchParams.delete(key);
        changed = true;
      }
    }

    if (changed) {
      // Reconstrói a URL mantendo apenas o necessário, sem incluir o domínio manualmente
      const cleanPath = 
        url.pathname + 
        (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "") + 
        url.hash;

      // Atualiza a URL no navegador sem recarregar a página
      window.history.replaceState({}, "", cleanPath);
    }
  }, []);

  return null;
}