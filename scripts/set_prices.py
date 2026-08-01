import time
import sys
import json
import os
import argparse
import pyautogui

# Abilita il fail-safe di PyAutoGUI: se muovi il mouse nell'angolo in alto a sinistra dello schermo, lo script si interrompe.
pyautogui.FAILSAFE = True

def click_at(x, y):
    # Movimento lento del mouse per compatibilità con la VM
    pyautogui.moveTo(x, y, duration=0.6)
    time.sleep(0.3)  # Pausa pre-clic
    pyautogui.click()
    time.sleep(0.3)  # Pausa post-clic

def clear_and_type(text):
    # Cancella il valore precedente inviando 4 backspace
    for _ in range(4):
        pyautogui.press('backspace')
        time.sleep(0.05)
    time.sleep(0.1)
    # Scrive il prezzo
    pyautogui.write(str(text))
    time.sleep(0.1)

def main():
    # Gestione parametri da riga di comando
    parser = argparse.ArgumentParser(description="Automazione inserimento prezzi Patrician III")
    parser.add_argument("--delta-x", type=int, default=180, help="Distanza orizzontale tra P1 e P2 (default: 180)")
    parser.add_argument("--delta-y", type=int, default=28, help="Distanza verticale base tra le righe (default: 28)")
    parser.add_argument("--adjust-x", type=int, default=5, help="Compensazione X (spostamento a destra) ad ogni riga per il drift (default: 5)")
    parser.add_argument("--adjust-y", type=int, default=0, help="Compensazione Y aggiuntiva ad ogni riga per il drift (default: 0)")
    args = parser.parse_args()
    
    # Path del JSON
    # Cerca goods.json sia nel path assoluto specifico che relativo rispetto alla cartella del progetto
    json_path = "/Users/michele/Sites/patrician3-assistant/public/data/goods.json"
    if not os.path.exists(json_path):
        # Fallback a path relativo se eseguito da un'altra cartella
        json_path = os.path.join(os.path.dirname(__file__), "../public/data/goods.json")
        
    if not os.path.exists(json_path):
        print(f"[ERRORE] File goods.json non trovato in: {json_path}")
        sys.exit(1)
        
    # Ordine delle risorse come appaiono nel gioco
    ordered_ids = [
        "beer",       # Birra
        "bricks",     # mattoni
        "cloth",      # cloth
        "fish",       # fish
        "grain",      # grain
        "hemp",       # emp (hemp)
        "honey",      # onay (honey)
        "iron_goods", # iron goods
        "leather",    # leather
        "meat",       # meat
        "pig_iron",   # pig iron
        "pitch",      # peach (pitch)
        "pottery",    # pottery
        "salt",       # salt
        "skins",      # skins
        "spices",     # spices
        "timber",     # timber
        "whale_oil",  # whale oil
        "wine",       # wine
        "wool"        # wool
    ]
    
    # Caricamento dei dati dal file JSON
    print("Caricamento dati delle risorse...")
    with open(json_path, "r", encoding="utf-8") as f:
        goods_data = json.load(f)
        
    goods_map = {item["id"]: item for item in goods_data}
    
    # Costruisci l'elenco dei prezzi
    resources_to_process = []
    print("\n--- PREZZI DA INSERIRE ---")
    for gid in ordered_ids:
        item = goods_map.get(gid)
        if not item:
            print(f"[ATTENZIONE] Risorsa '{gid}' non trovata nel file JSON!")
            continue
            
        buy_price = item["buyPriceRange"][1]   # Prezzo massimo di acquisto
        sell_price = item["sellPriceRange"][0]  # Prezzo minimo di vendita
        
        resources_to_process.append({
            "id": gid,
            "name": item["name"]["it"],
            "buy": buy_price,
            "sell": sell_price
        })
        print(f"{item['name']['it']}: Acquisto = {buy_price} | Vendita = {sell_price}")
        
    print("-" * 50)
    print("Parametri attuali:")
    print(f"  Delta X: {args.delta_x}")
    print(f"  Delta Y: {args.delta_y}")
    print(f"  Regolazione X/giro: {args.adjust_x}")
    print(f"  Regolazione Y/giro: {args.adjust_y}")
    print("-" * 50)
    print("Istruzioni:")
    print("1. Posiziona la finestra del gioco in modo visibile.")
    print("2. Hai 5 secondi per posizionare il mouse sul PRIMO ELEMENTO (P1 della Birra).")
    print("3. Lo script seguirà la sequenza di click (P1 -> P2 -> P1 -> P2 -> P1) per configurare Compra e Vendi.")
    print("\n* EMERGENZA *: Sposta il mouse nell'angolo in alto a sinistra per fermare lo script.")
    print("-" * 50)
    
    # Conto alla rovescia
    for i in range(5, 0, -1):
        print(f"Posiziona il mouse... Inizio tra {i}...")
        sys.stdout.flush()
        time.sleep(1)
        
    # Registra coordinate di partenza (P1 Birra)
    start_x, start_y = pyautogui.position()
    print(f"\nCoordinata iniziale registrata: x={start_x}, y={start_y}")
    print("Avvio inserimento automatico...\n")
    sys.stdout.flush()
    
    total_resources = len(resources_to_process)
    current_x = start_x
    current_y = start_y
    
    for row, res in enumerate(resources_to_process):
        p1 = (current_x, current_y)
        p2 = (current_x + args.delta_x, current_y)
        
        print(f"\n[{row + 1}/{total_resources}] {res['name']} (y={current_y}, x_corrente={current_x}):")
        sys.stdout.flush()
        
        # 1. Clic su P1 (imposta modalità Compra)
        print(f"  -> Clic su P1: {p1}")
        click_at(*p1)
        time.sleep(1.5)
        
        # 2. Spostamento a P2 (+ delta_x) e Clic (inserisce prezzo Acquisto)
        print(f"  -> Clic su P2 (Acquisto = {res['buy']}): {p2}")
        click_at(*p2)
        clear_and_type(res['buy'])
        time.sleep(1.5)
        
        # 3. Ritorno a P1 (imposta modalità Vendi)
        print(f"  -> Clic su P1: {p1}")
        click_at(*p1)
        time.sleep(1.5)
        
        # 4. Spostamento a P2 (+ delta_x) e Clic (inserisce prezzo Vendita)
        print(f"  -> Clic su P2 (Vendita = {res['sell']}): {p2}")
        click_at(*p2)
        clear_and_type(res['sell'])
        time.sleep(1.5)
        
        # 5. Ritorno a P1 (imposta modalità Compra & Vendi)
        print(f"  -> Clic su P1: {p1}")
        click_at(*p1)
        
        # Applica gli spostamenti/compensazioni per posizionarsi sulla riga successiva
        current_y += args.delta_y + args.adjust_y
        current_x += args.adjust_x
        
        # Attendi prima di passare alla riga successiva
        if row < total_resources - 1:
            time.sleep(1.5)
            
    print("\nAutomazione prezzi completata con successo!")

if __name__ == "__main__":
    main()
