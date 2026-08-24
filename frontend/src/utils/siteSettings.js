export const defaultSiteSettings = {
  heroTitle: "Kuasai Keterampilan Digital dengan Mudah!",
  heroDescription: "Raih penguasaan digital dengan mudah! Jelajahi dan tingkatkan keterampilan Anda melalui platform kami yang ramah pengguna.",
  aboutText: "Platform e-learning untuk membantu siapa saja mengembangkan keterampilan digital secara terarah."
};
export function readSiteSettings(){ try { return { ...defaultSiteSettings, ...JSON.parse(localStorage.getItem("videoBelajarSiteSettings")) }; } catch { return defaultSiteSettings; } }
