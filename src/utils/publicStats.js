// src/utils/publicStats.js
// საჯარო სტატისტიკა — StatsSection-ისთვის
// რეალურ პროექტში ეს API-დან წამოვიდოდა; ახლა placeholder-ებია.

export async function getPublicStats() {
  // TODO: ჩაანაცვლეთ რეალური API გამოძახებით, მაგ:
  // const res = await fetch("/api/public/stats");
  // return await res.json();

  return {
    users: 1250,
    reports: 3480,
    agents: 12,
    uptime: 99.9,
  };
}

export default getPublicStats;