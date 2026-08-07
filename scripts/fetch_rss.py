import feedparser
import json
import datetime

# Reemplazar por los feeds RSS reales que se quieran mostrar
FEEDS = [
    "https://www.ultimahora.com/rss.xml",
    "https://www.abc.com.py/rss/",
]

MAX_ITEMS = 15


def main():
    items = []
    for url in FEEDS:
        feed = feedparser.parse(url)
        fuente = feed.feed.get("title", "")
        for entry in feed.entries[:MAX_ITEMS]:
            items.append({
                "titulo": entry.get("title", "").strip(),
                "fuente": fuente,
                "link": entry.get("link", ""),
                "fecha": entry.get("published", ""),
            })

    items = items[:MAX_ITEMS]

    data = {
        "actualizado": datetime.datetime.utcnow().isoformat() + "Z",
        "items": items,
    }

    with open("data/noticias.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
