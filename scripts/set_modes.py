import time
import sys
import json
import os
import argparse
import pyautogui

# Abilita il fail-safe di PyAutoGUI: se muovi il mouse nell'angolo in alto a sinistra dello schermo, lo script si interrompe.
pyautogui.FAILSAFE = True

def click_and_toggle(x, y, should_sell, args):
    # Muove il mouse all'input
    pyautogui.moveTo(x, y, duration=args.move_duration)
    time.sleep(args.delay_pre_click)  # Pausa pre-clic
    pyautogui.click()
    
    if should_sell:
        # Se deve vendere, fa un secondo clic.
        time.sleep(args.delay_toggle)
        pyautogui.click()
        
    time.sleep(args.delay_post_click)  # Pausa post-clic

def main():
    parser = argparse.ArgumentParser(description="Configura Compra/Vendi per le risorse in Patrician III")
    parser.add_argument("--town", type=str, help="Nome o ID della città corrente (es. lubeck, danzig)")
    parser.add_argument("--delta-y", type=int, default=28, help="Distanza verticale base tra le righe (default: 28)")
    parser.add_argument("--adjust-x", type=int, default=5, help="Compensazione X (spostamento a destra) ad ogni riga per il drift (default: 5)")
    parser.add_argument("--adjust-y", type=int, default=0, help="Compensazione Y aggiuntiva ad ogni riga per il drift (default: 0)")
    
    # Parametri per i delay e la velocità
    parser.add_argument("--move-duration", type=float, default=0.6, help="Durata del movimento del mouse (default: 0.6)")
    parser.add_argument("--delay-pre-click", type=float, default=0.3, help="Attesa prima del clic (default: 0.3)")
    parser.add_argument("--delay-toggle", type=float, default=0.8, help="Attesa tra i due clic per Vendi (default: 0.8)")
    parser.add_argument("--delay-post-click", type=float, default=0.3, help="Attesa dopo il clic (default: 0.3)")
    parser.add_argument("--delay-row", type=float, default=1.0, help="Attesa tra il completamento di una riga e la successiva (default: 1.0)")
    
    args = parser.parse_args()
    
    # Path del JSON
    towns_json_path = "/Users/michele/Sites/patrician3-assistant/public/data/towns.json"
    if not os.path.exists(towns_json_path):
        towns_json_path = os.path.join(os.path.dirname(__file__), "../public/data/towns.json")
        
    if not os.path.exists(towns_json_path):
        print(f"[ERRORE] File towns.json non trovato in: {towns_json_path}")
        sys.exit(1)
        
    # Caricamento città
    with open(towns_json_path, "r", encoding="utf-8") as f:
        towns_data = json.load(f)
        
    # Richiedi la città se non passata come argomento
    town_input = args.town
    if not town_input:
        town_input = input("Inserisci il nome o l'ID della città (es. lubeck, danzig): ").strip()
        
    if not town_input:
        print("[ERRORE] Nessuna città specificata.")
        sys.exit(1)
        
    # Trova la città
    town_input_lower = town_input.lower()
    matched_town = None
    for town in towns_data:
        if (town_input_lower == town["id"].lower() or 
            town_input_lower in town["name"].lower()):
            matched_town = town
            break
            
    if not matched_town:
        print(f"\n[ERRORE] Nessuna città trovata che corrisponde a '{town_input}'.")
        print("Città disponibili nel database:")
        for town in towns_data:
            print(f"  - ID: {town['id']:<15} | Nome: {town['name']}")
        sys.exit(1)
        
    print(f"\nCittà selezionata: {matched_town['name']} (ID: {matched_town['id']})")
    produced_goods = matched_town["produces"]
    print(f"Merci prodotte da questa città (imposteremo VENDI): {', '.join(produced_goods)}")
    print(f"Altre merci (imposteremo COMPRA)")
    
    # Ordine delle risorse nel gioco
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
    
    # Genera la configurazione di azioni
    actions = []
    print("\n--- PROGRAMMA DI CONFIGURAZIONE ---")
    for gid in ordered_ids:
        # Se la merce NON è prodotta dalla città -> Vendi (2 click). Se è prodotta -> Compra (1 click).
        should_sell = gid not in produced_goods
        action_name = "VENDI (2 Clic)" if should_sell else "COMPRA (1 Clic)"
        actions.append({
            "id": gid,
            "should_sell": should_sell,
            "action_name": action_name
        })
        print(f"  - {gid:<12}: {action_name}")
        
    print("-" * 50)
    print("Parametri e attese correnti:")
    print(f"  Delta Y: {args.delta_y} | Regolazione X: {args.adjust_x} | Regolazione Y: {args.adjust_y}")
    print(f"  Velocità mouse: {args.move_duration}s")
    print(f"  Attese clic: Pre={args.delay_pre_click}s | Toggle/Vendi={args.delay_toggle}s | Post={args.delay_post_click}s")
    print(f"  Attesa riga: {args.delay_row}s")
    print("-" * 50)
    print("Istruzioni:")
    print("1. Apri la finestra dell'amministratore dell'ufficio commerciale.")
    print("2. Hai 5 secondi per posizionare il mouse sul PRIMO ELEMENTO (P1 della Birra).")
    print("3. Lo script configurerà l'opzione per tutte le 20 righe automaticamente.")
    print("\n* EMERGENZA *: Sposta il mouse nell'angolo in alto a sinistra per fermare lo script.")
    print("-" * 50)
    
    # Conto alla rovescia
    for i in range(5, 0, -1):
        print(f"Posiziona il mouse... Inizio tra {i}...")
        sys.stdout.flush()
        time.sleep(1)
        
    # Registra coordinate iniziali (P1 Birra)
    start_x, start_y = pyautogui.position()
    print(f"\nCoordinata iniziale registrata: x={start_x}, y={start_y}")
    print("Avvio configurazione automatica...\n")
    sys.stdout.flush()
    
    total_resources = len(actions)
    current_x = start_x
    current_y = start_y
    
    for row, act in enumerate(actions):
        p1 = (current_x, current_y)
        
        print(f"[{row + 1}/{total_resources}] Imposto {act['id']:<12} -> {act['action_name']} su {p1}")
        sys.stdout.flush()
        
        click_and_toggle(p1[0], p1[1], act['should_sell'], args)
        
        # Spostamento alla riga successiva
        current_y += args.delta_y + args.adjust_y
        current_x += args.adjust_x
        
        # Attendi prima di passare alla riga successiva
        if row < total_resources - 1:
            time.sleep(args.delay_row)
            
    print("\nConfigurazione dell'amministratore completata con successo!")

if __name__ == "__main__":
    main()
