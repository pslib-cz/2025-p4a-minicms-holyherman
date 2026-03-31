# Mini CMS Platform

Moderní redakční systém postavený na **Next.js 16**, **Prisma ORM** a **Material UI**. Aplikace podporuje kompletní správu obsahu, uživatelské role a plně responzivní rozhraní s podporou tmavého režimu.

## Architektura aplikace

Aplikace je tvořena třemi hlavními komponentami:
1. **Veřejná část:** Implementována pomocí Server Components pro maximální rychlost a SEO. Zahrnuje výpis článků, vyhledávání podle tagů a systém komentářů.
2. **Interní dashboard:** Zabezpečená zóna pro správu obsahu s WYSIWYG editorem (Tiptap). Obsahuje pokročilé úpravy layoutu pro pohodlnou práci (scrollbar lock, padding fix).
3. **API (Route Handlers):** Backendové rozhraní implementující bezpečný přenos dat, validaci vstupů (`zod`) a kontrolu oprávnění (RBAC).

## Správa Rolí (RBAC)

Systém automaticky rozlišuje mezi dvěma úrovněmi přístupu:
- **USER:** Vidí a spravuje pouze své vlastní vytvořené příspěvky.
- **ADMIN:** Má absolutní kontrolu nad celou platformou. Vidí příspěvky všech autorů, může je editovat i mazat. V Dashboardu vidí rozšířené statistiky a jména autorů.

## Seznam klíčových funkcí

- **Dark Mode Integration:** Plná podpora tmavého režimu v celém rozhraní (Tailwind i Material UI). Přepínač je přístupný z hlavičky dashboardu i z profilu.
- **Quick Edit:** Admini a autoři vidí přímo na veřejném webu u svých článků tlačítko pro rychlý přechod do editoru.
- **WYSIWYG Editor:** Bohatý editor textu (Tiptap) s podporou formátování, odkazů a seznamů, plně optimalizovaný pro tmavý režim.
- **SEO & Social:** Automatické generování metadat, podpora OpenGraph a validní HTML5 sémantika.
- **Komentářový systém:** Umožňuje interakci čtenářů s autory u každého publikovaného článku.

## Datový model (Prisma)

- **User / Session:** Autentizace a správa rolí (`USER` / `ADMIN`).
- **Post:** Obsah, metadata a stav publikace.
- **Tag / PostTag:** Systém štítkování a kategorizace (M:N).
- **Comment:** Diskusní vlákna u příspěvků.
