import requests
from pathlib import Path

def download_robo_cats(count: int = 5, size: int = 512):
    games_dir = Path("games")
    games_dir.mkdir(exist_ok=True)

    for i in range(1, count + 1):
        folder = games_dir / str(i)
        folder.mkdir(exist_ok=True)
        icon_path = folder / "icon.png"

        # set4 = котики, уникальность через id=i
        url = f"https://robohash.org/{i}.png?set=set4&size={size}x{size}"

        try:
            print(f"[{i}/{count}] Запрос → {url}")
            response = requests.get(url, timeout=8)
            response.raise_for_status()

            ct = response.headers.get("content-type", "").lower()
            if "image/png" not in ct:
                raise ValueError(f"Ожидался PNG, получен: {ct}")

            icon_path.write_bytes(response.content)
            print(f"✅ Сохранено: {icon_path}")

        except Exception as e:
            print(f"❌ Ошибка #{i}: {e}")

if __name__ == "__main__":
    download_robo_cats(count=1000, size=512)