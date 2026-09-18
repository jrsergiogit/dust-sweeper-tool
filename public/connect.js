document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectBtn");
  const status = document.getElementById("walletStatus");

  if (!btn) return;

  const setStatus = (txt) => {
    if (status) status.textContent = txt;
  };

  btn.addEventListener("click", async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask não detectada. Abra no Chrome com a extensão instalada.");
        return;
      }

      setStatus("Connecting...");

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const addr = accounts?.[0];
      if (!addr) throw new Error("No accounts returned");

      btn.textContent = `Connected: ${addr.slice(0, 6)}...${addr.slice(-4)}`;
      setStatus("Connected ✅");
      console.log("Connected:", addr);
    } catch (e) {
      console.error("Connect error:", e);
      setStatus("Not connected");
      alert(e?.message || "Falha ao conectar");
    }
  });
});
