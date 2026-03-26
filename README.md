# Mini CMS Platform

## Architektura aplikace

Aplikace je tvořena třemi hlavními komponentami:
1. **Veřejná část:** Implementována pomocí Server Components pro zajištění výkonu a optimálního SEO. Zajišťuje zobrazení publikovaných entit, výpis souvisejících záznamů a vykreslování uživatelských komentářů.
2. **Interní dashboard:** Zabezpečená zóna implementovaná primárně pomocí Client Components. Obsahuje WYSIWYG editor (Tiptap) pro tvorbu obsahu a formuláře s klientskou validací (`zod`).
3. **API (Route Handlers):** Backendové rozhraní pro přenos dat, implementující server-side validaci vstupů, kontrolu autentizace a validaci vlastnictví databáze (User Ownership).

## Datový model

Datová vrstva využívá Prisma ORM nad relační databází (SQLite pro lokální vývoj, aplikačně připraveno pro přechod na PostgreSQL při nasazení).

### Entity a vztahy
- **User / Session:** Modely spravující autentizaci přes NextAuth. Model User zahrnuje atribut přístupových práv (`role`).
- **Post:** Hlavní publikační entita. Úchovává obsah a metadata (`title`, unikátní identifikátor `slug`, `description` a bool `published`).
- **Tag:** Entita pro kategorizaci obsahu.
- **PostTag:** Relační entita tvořící vazbu N:M mezi příspěvky a štítky.
- **Comment:** Diskusní entita tvořící vazbu zprávy k uživateli (1:N) a příspěvku (1:N).

## Seznam funkcí

- Autentizace uživatelů pomocí přístupových údajů (Credentials) i konfigurovatelných OAuth poskytovatelů.
- Správa publikací s plnou podporou CRUD operací prováděných skrze responzivní layout dashboardu.
- Štítkování s dynamickým generováním doporučeného souvisejícího obsahu.
- Komunitní interakce přes nezávislý modul pro správu komentářů.
- Úprava barveného profilu rozhraní (Light / Dark mode toggle).
- SEO architektura: Podpora `robots.txt`, staticky generované sitemapy i OpenGraph definic závislých na kontextu dané stránky.

 Aplikace bude po zkompilování dostupná na adrese `http://localhost:3000`.
