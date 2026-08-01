## Calcolatore PII

## Versione 2.0

Di Lutz Gollhardt (Hopsing) & Falko (Falko)

## Indice

1 Introduzione....1
1.1 Panoramica dell'estensione....2
2 Spiegazioni dei fogli di calcolo....2
2.1 Foglio di inserimento (Beiblatt)....2
2.2 Popolazione....3
2.3 Imprese....3
2.4 Case....3
2.5 Dati di produzione....4
2.6 Consumo....4
2.7 Gestore commercio dell'ufficio commerciale (Kontorhandels-Manager)....4
2.8 Gestore convogli (Konvoi-Manager)....5
2.9 All\_in\_One....5
2.10 Tempi di viaggio....8
2.11 Materiali da costruzione....8
2.12 Raccolta di tabelle....8
2.13 Stampa....8
2.14 Scadenze/Appuntamenti....8
2.15 Altro....9
3 FAQ (Domande frequenti)....9

## 1 Introduzione

Per Patrician II (Patrizier II) sono già in circolazione diversi strumenti utilizzati da molti giocatori che consentono loro di ottimizzare la propria strategia di gioco in un modo o nell'altro.

Tuttavia, poiché nessuno di questi corrispondeva pienamente alle mie aspettative o faceva tutto ciò che volevo, ho deciso di riprogettare il calcolatore PII di Hopsing secondo i miei desideri. Nello sviluppo di questo calcolatore PII sono stati utilizzati come base gli strumenti di Brasileiro, Armbruster, Gesil und Ugh!. A loro va ancora una volta il mio sentito ringraziamento.

L'obiettivo principale dello sviluppo era creare uno strumento adatto sia ai principianti che ai giocatori esperti, per supportarli durante il gioco. Spero di esserci riuscito con questo calcolatore PII e sarei ovviamente molto felice di ricevere feedback, critiche e suggerimenti di miglioramento da parte degli utenti.

A mio parere, il calcolatore si utilizza in modo simile alla versione 1.1. La modifica più significativa è il formato del file: il calcolatore è ora disponibile como file OpenOffice. Questo file ora funziona con le macro. Questo si è reso necessario per migliorarne la comodità d'uso e per rendere possibili alcuni calcoli.

## 1.1 Panoramica dell'estensione

Una breve panoramica delle funzionalità dello strumento:

• Calcolo delle quantità di produzione e consumo delle singole merci per ogni città

• Numero di imprese in esubero o mancanti

• Numero di case d'abitazione necessarie per ospitare un certo numero di nuovi abitanti

• Calcolo delle quantità minime che l'amministratore dell'ufficio commerciale (Kontor) deve tenere in magazzino per la produzione

• Configurazione di un numero di magazzini centrali/regionali da 1 a 15 (sì, lo so che 15 sono troppi :-) )

• Quantità di carico dei convogli di rifornimento

• Calcolo di una strategia salvaspazio per il bilanciamento delle merci (Mengenausgleich)

• Allestimento di convogli di bilanciamento tra magazzini regionali

• Un semplice gestore di scadenze/appuntamenti

• Una panoramica dei progetti edilizi con relativi costi e incremento demografico previsto

• e uno strumento (si spera) semplice per l'inserimento di tutte le informazioni specifiche delle città

Nessuno userà tutti gli strumenti. Ognuno può mostrare o nascondere i fogli di calcolo a proprio piacimento. Questo è possibile tramite il menu "Formato -> Tabella -> Mostra/Nascondi". Per impostazione predefinita, non tutti i fogli di calcolo sono visibili.

I esempi nelle spiegazioni seguenti si riferiscono alla mappa standard.

## 2 Spiegazioni dei fogli di calcolo

La base per il corretto funzionamento dello strumento è l'inserimento di quattro valori rilevanti. Si tratta essenzialmente dei numeri leggibili nella schermata della città e di alcune informazioni sui convogli di rifornimento.

Questi sono:

1. **Dati sulla popolazione** - rilevati per Poveri, Benestanti e Ricchi nella schermata della città (barra in alto a sinistra).

2. **Imprese produttive** - rilevate cliccando sul rispettivo tipo di impresa nella città. Nell'interfaccia appariranno le informazioni relative a quel tipo di impresa.

3. **Case d'abitazione completate** - rilevate per case a graticcio (Fachwerk), case a timpano (Giebel) e case patrizie (Kaufmannshäuser) cliccando su una casa di proprietà della città. Nell'interfaccia appariranno le informazioni relative a tutte le case d'abitazione della città.

4. **Dati sui convogli** - per ogni convoglio di rifornimento si dovrebbe conoscere il tipo di nave più lenta e il numero di tappe nella rotta automatica. Per il calcolatore avanzato dei convogli è necessaria anche la dimensione del convoglio.

## 2.1 Foglio di inserimento (Beiblatt)

Il foglio di inserimento è la schermata centrale per l'immissione di tutti i dati nel calcolatore.

È composto da 3 parti principali e da una sezione di inserimento opzionale.

## 2.1.1 Popolazione

Il giocatore ottiene i dati per l'inserimento della popolazione dalla schermata di riepilogo "Popolazione" (cliccando sull'icona della testa in alto a sinistra della schermata di gioco), suddivisi tra Ricchi, Benestanti e Poveri.

## 2.1.2 Imprese

L'indicazione se una città ha una possibilità di produzione e se questa è efficace viene gestita tramite il colore di sfondo della cella corrispondente. Nella stessa cella viene inserito direttamente anche il numero di imprese presenti.

Significato dei colori:

* **verde** – nessuna produzione
* **bianco** – produzione efficace (effektiv)
* **giallo** – produzione inefficace (ineffektiv)

Naturalmente, il foglio di inserimento deve essere adattato a seconda della mappa utilizzata.

La macro "Genera" (Generieren) rileva i 3 colori mostrati nelle celle A44-A46 e formatta tutte le tabelle rilevanti in base ad essi. La macro "Genera" deve essere eseguita solo se cambiano le possibilità di produzione (ad esempio, di norma dopo la configurazione iniziale della mappa o in caso di nuove fondazioni/succursali). Se cambia solo il numero di imprese, la macro "Genera" non è necessaria.

## 2.1.3 Case

Qui è possibile inserire il numero totale dei vari tipi di case per città. Questa informazione non è necessaria per il solo calcolo dei consumi e dei convogli.

## 2.1.4 Info aggiuntive (Zusatzinfos)

Il pulsante "Info aggiuntive" mostra opzioni di inserimento supplementari.

A sinistra dell'inserimento delle case appariranno le informazioni aggiuntive sul convoglio di rifornimento.

Sotto l'inserimento della popolazione è possibile definire le importazioni e le esportazioni/consumi. Sono possibili fino a 200 voci di export/import. Poiché questo metodo di inserimento non è molto efficiente se si desidera impostare un determinato consumo di merci per tutte le città, esiste auch una possibilità alternativa per indicare import/export. Breve esempio: se si vuole dire al calcolatore di considerare il consumo di cuoio dell'armiere, ma inserirlo per ogni singola città è troppo faticoso, si possono indicare le merci di import/export nelle colonne BP-BV e impostarle rapidamente per ciascuna città.

Nella versione 1.1, il foglio di inserimento era pensato come pagina da stampare. Poiché ora tutti i dati vengono inseriti hier, esiste la tabella "13\_Ausdruck" (13\_Stampa) in cui è possibile stampare una copia vuota del foglio di inserimento.

La lista delle città nella colonna A può essere adattata alla mappa specifica nascondendo o mostrando le righe. Il nascondiglio delle singole righe viene trasferito a tutti gli altri fogli di calcolo quando si esegue la macro "Genera".

## 2.2 Popolazione

Nella tabella "2\_Bevölkerung" (2\_Popolazione) viene mostrata la popolazione totale di ciascuna città. I mendicanti non sono stati presi in considerazione poiché non hanno rilevanza ai fini del rifornimento della città.

Nella riga 44 viene mostrata la percentuale delle tre fasce di popolazione. Questi numeri sono importanti per il calcolo del consumo di merci per il sostentamento dei cittadini, poiché le diverse fasce di popolazione consumano quantità differenti di ciascuna categoria di merci.

La riga 46 mostra la popolazione totale della Lega Anseatica al momento dell'aggiornamento.

## 2.3 Imprese

Nel foglio di calcolo "Betriebe" (Imprese) il giocatore visualizza le imprese rilevate. Le categorie di produzione "efficace" e "inefficace" sono predefinite per ciascuna città a seconda della mappa giocata. (Verde = efficace, Giallo = inefficace)

Come indicazione visiva per il giocatore, il cui obiettivo dovrebbe sempre essere quello di ottenere il massimo bonus di produzione possibile (a partire da 9 imprese dello stesso tipo), i tipi di imprese nelle città in cui questo bonus non è stato ancora raggiunto sono evidenziati in ocra. Al raggiungimento del bonus massimo, il colore ocra passa a verde o giallo a seconda della categoria di produzione.

Nella colonna 45 viene mostrato il numero di imprese efficaci, nella colonna 46 il numero di imprese inefficaci. Nella colonna 47 le imprese inefficaci sono state convertite in equivalenti di imprese efficaci. La riga 48 restituisce la somma delle imprese efficaci e di quelle inefficaci convertite.

Il calcolo dell'eccedenza/carenza di imprese nelle righe 50 (estate) e 51 (inverno) si basa quindi esclusivamente sulle imprese efficaci (il bianco indica eccedenza, il rosso indica carenza di imprese). Inoltre, va notato che i numeri vengono calcolati sulla base del massimo bonus di produzione. Nella riga 52 viene calcolata una media tra la carenza/eccedenza estiva e quella invernale.

## 2.4 Case

In questo foglio di calcolo il giocatore visualizza le case d'abitazione suddivise in case a graticcio, case a timpano e case patrizie. Nelle colonne "Total" viene indicata la carenza o l'eccedenza. (Verde = eccedenza, Rosso = carenza)

Cliccando sul campo B-C 47, a destra appare una casella a discesa. Qui il giocatore può selezionare la città desiderata e visualizzare nuovamente i dati della città relativi alla struttura degli abitanti e al patrimonio edilizio residenziale.

C'è una funzionalità aggiuntiva per i giocatori che puntano al completamento dello sviluppo (Vollausbau). Di seguito alla selezione della città desiderata come descritto sopra, il giocatore può inserire il numero di abitanti previsto nel campo BC59 per scoprire quante case di ciascun tipo deve ancora costruire per ospitare tutti i residenti.

## 2.5 Dati di produzione (Produktionszahlen)

Questa tabella è nascosta per impostazione predefinita.

In questa tabella sono indicati i dati di produzione delle singole tipologie di imprese, suddivisi per efficaci ed inefficaci, estate e inverno, e in base ai singoli bonus di produzione. Contiene inoltre i consumi di produzione delle imprese di raffinazione/trasformazione (veredelnde Betriebe) suddivisi in base ai bonus di produzione. Nei commenti (triangolo rosso) è indicato di quale materia prima si tratti.

I valori sono stati determinati durante il Contest 2005. Per i singoli bonus di produzione sono stati utilizzati i numeri di imprese effettivamente presenti. Ciò significa che sono i valori restituiti dal gioco in presenza di un numero di imprese fino a 2, 3-5, 6-8 e 9 o più. A tale scopo, il numero corrispondente di imprese è stato verificato tramite demolizioni mirate. Non è stata effettuata alcuna proiezione/estrapolazione.

## 2.6 Consumo (Verbrauch)

Questa tabella si divide in 3 parti:

### 2.6.1 Quantità di produzione e consumo delle singole città
Qui si trovano i valori relativi alla produzione dei singoli gruppi di imprese nelle città, nonché il consumo della popolazione e delle imprese di raffinazione su base settimanale. Questi dati costituiscono la base per il carico dei convogli e per il calcolo della carenza/eccedenza di imprese nella tabella 3.

### 2.6.2 Imprese cittadine (Stadtbetriebe)
Il calcolatore può includere la produzione e il consumo di materie prime delle imprese cittadine (quelle preesistenti appartenenti alla città). A questo scopo, sotto il calcolo delle quantità di consumo c'è una riga in cui è possibile attivare o disattivare singolarmente il calcolo della produzione e del consumo delle imprese cittadine.

### 2.6.3 Panoramica del magazzino centrale (Zentrallagerübersicht)
Le ultime 15 righe mostrano l'eccedenza/carenza a seconda del magazzino centrale. Qui sono facilmente visibili gli squilibri delle merci. Ad esempio, una produzione eccessiva di vino nelle città del magazzino regionale che rifornisce il Mare del Nord e troppe pelli nelle città del Mar Baltico. Sono visibili anche distribuzioni di merci meno evidenti. Molto utile se si desidera calcolare manualmente il convoglio di bilanciamento tra i magazzini regionali.

## 2.7 Gestore commercio dell'ufficio commerciale (Kontorhandels-Manager)

Questa funzione è una variante del gestore convogli descritto nel punto successivo. Ha lo scopo di consentire, in particolare al giocatore meno esperto, di effettuare le impostazioni necessarie tramite l'amministratore dell'ufficio commerciale (Kontor) per garantire il massimo rifornimento alle proprie imprese che consumano materie prime e per assicurare un corretto flusso di ritorno delle merci dalla città di destinazione al magazzino centrale tramite il bilanciamento delle quantità (Mengenausgleich) effettuato dai convogli di rifornimento.

I magazzini regionali/centrali sono evidenziati in rosso.

I valori indicati in questa tabella devono essere bloccati almeno nel "commercio dell'ufficio commerciale" (Kontorhandel) per l'amministratore e per i convogli (segno di spunta rosso), al fine di ottenere il massimo rifornimento per le imprese di raffinazione. Chi lavora con un margine di sicurezza per compensare, ad esempio, tempi di riparazione, congelamento dei porti o lunghi intervalli di aggiornamento dei convogli, può inserire questa riserva nel campo A2. Si prega di notare che l'inserimento va effettuato in percentuale (es. 10%).

Per il bilanciamento delle quantità, ciò significa che nelle rotte automatiche questo può sempre essere impostato su "Massimo" per le materie prime destinate alle imprese di raffinazione. Per informazioni sulle impostazioni di base per un bilanciamento ottimale delle quantità, consultare il forum di Patrician o la raccolta di suggerimenti (Tippsammlung). Uno strumento per creare le rotte dei convogli di bilanciamento si trova nella tabella 9.

La quantità accumulata si basa sul periodo di tempo per il quale devono essere presenti materie prime sufficienti (senza ulteriori rifornimenti).

Per il calcolo di questo periodo sono possibili 3 diverse modalità:

• **Tempo di viaggio (Fahrtzeit)**: la durata di un ciclo della rotta automatica del convoglio.

• **X settimane**: per tutte le città si applica lo stesso periodo di riserva, ad esempio 1,5 settimane.

• **Predefinito (vordefiniert)**: si applica la durata della riserva settimanale impostata per i convogli di bilanciamento delle merci.

## 2.8 Gestore convogli (Konvoi-Manager)

In questo foglio di calcolo confluiscono quasi tutti i dati inseriti dal giocatore e i vari calcoli effettuati negli altri fogli.

Viene mostrato il carico dei convogli automatici per garantire il pieno rifornimento delle singole città. È inoltre possibile visualizzare le impostazioni per il trasporto delle merci prodotte nelle città. (Rosso = caricare merce nel magazzino centrale (ZL), Verde = caricare merce per il magazzino centrale (ZL))

Nelle colonne W e X vengono indicate le quantità di merci in barili (Fass) che devono essere trasportate dal o al magazzino centrale. Per garantire il pieno rifornimento quando le scorte sono sufficienti, occorre prestare attenzione a una dimensione adeguata del convoglio. Come promemoria visivo, i convogli che trasportano più merci dal magazzino centrale alla città di destinazione sono evidenziati in rosso, poiché per questi convogli è particolarmente importante prestare attenzione alla dimensione ottimale per garantire il rifornimento completo. Se le quantità trasportate cambiano (più merci dal magazzino centrale alla città di destinazione), l'evidenziazione visiva viene aggiornata.

Come per il gestore del commercio dell'ufficio commerciale, nel campo A2 è possibile impostare un margine di sicurezza e adattare l'elenco delle città alla mappa specifica. Questa è la quantità di merci trasportata dal magazzino regionale/centrale alla città.

Sotto l'indicazione dei convogli è possibile inserire una "Riserva". Questa aumenta la dimensione del convoglio nella colonna Y qualora la produzione di merci sia superiore al consumo.

I tempi di viaggio mostrati derivano dall'impostazione del magazzino regionale/centrale della rispettiva città nel foglio di inserimento. Inoltre, è possibile visualizzare solo i convogli di un determinato magazzino regionale. La scelta si effettua nella cella AD2.

I magazzini regionali/centrali sono evidenziati in rosso.

In questa schermata non si tiene conto delle impostazioni relative ai magazzini intermedi.

Nella parte inferiore di questa pagina è integrato un piccolo calcolatore dei tempi di viaggio.

## 2.9 All\_in\_One

Qui sono raccolti tutti i dati di inserimento specifici per ogni città in un unico posto.

Ciò significa che l'inserimento di abitanti, imprese, convogli o dati di importazione è rapidamente accessibile.

Inoltre, qui si trovano le "specialità" della nuova versione. Ad esempio, il calcolo dei convogli di bilanciamento tra i magazzini centrali o l'allestimento esatto dei convogli di bilanciamento delle quantità (Mengenausgleichkonvois), ecc.

L'inserimento dei dati per tutte le città è normalmente più efficiente nel foglio di inserimento (Beiblatt).

Tutti i campi di inserimento su questa pagina hanno una sottile cornice (ombra). Si dovrebbe inserire testo solo in questi campi. Come primo passo occorre caricare una città. Successivamente si possono scegliere le aree di inserimento da visualizzare. Se i valori caricati vengono modificati, le aree corrispondenti e il pulsante "Inserisci" (Eintragen) vengono evidenziati a colori. Non bisogna quindi dimenticarsi di premere il pulsante "Inserisci" prima di caricare la città successiva.

## 2.9.1 Generale (Allgemein)

Qui si indica la struttura della popolazione. L'indicazione se questa città è una città anseatica, una succursale/fondazione o simile viene utilizzata per calcolare correttamente i costruttori (Bautrupps) e la produzione cittadina (le succursali hanno un costruttore in più ma non hanno una produzione cittadina "integrata").

Un'altra informazione importante qui è da dove viene rifornita la città.

Se come magazzino centrale viene indicata la città stessa, ad esempio "Lubecca utilizza Lubecca come magazzino regionale/centrale", la città stessa diventa un magazzino regionale/centrale.

## 2.9.2 Produzione (Produktion)

Qui è possibile modificare il numero di imprese e il loro tipo (efficace, inefficace, non possibile). Como informazioni aggiuntive vengono mostrati il consumo, la produzione e l'eccedenza/carenza. Cliccando su "Vorhaltemenge-KV" (Quantità di riserva dell'ufficio commerciale) vengono mostrate le quantità di riserva delle singole merci nell'ufficio commerciale per questa città. Qui possono essere impostate anche le modalità di calcolo del gestore del commercio dell'ufficio commerciale.

## 2.9.3 Convogli (Konvois)

### 2.9.3.1 Convoglio semplice (Einfacher Konvoi)
Attivando la casella di controllo "Convoglio semplice" (Einfacher Konvoi) è possibile utilizzare la vista della tabella "8\_K\_Manager". Qui si può specificare il tipo di nave più lenta e il numero di tappe per rotta. Dopo l'inserimento, i tempi di viaggio e di conseguenza le quantità di carico del convoglio verranno ricalcolati.

### 2.9.3.2 Convoglio per evitare eccedenze (Überschussvermeidungskonvoi)

Un problema comune con le rotte automatiche è che alcune merci si accumulano in certe città mentre mancano altrove. Ciò accade perché i convogli di rifornimento trasportano troppe merci in quella città. È difficile evitarlo, soprattutto quando la città è in fase di crescita. Una soluzione a questo problema è il bilanciamento delle quantità (Mengenausgleich).

A questo proposito si veda la raccolta di suggerimenti (Tippsammlung) 8\_11 del 2004 a pagina 54.

Ecco una breve citazione:

> Per le fasi avanzate di gioco, la seguente variante di rotta automatica è molto utile ed efficace:
> 
> 1. Magazzino centrale: scaricare tutto al massimo
> 2. Magazzino centrale: caricare il fabbisogno di merci per la città di destinazione
> 3. Città di destinazione: caricare tutto (escluse le merci prodotte nella città stessa)
> 4. Città di destinazione: scaricare il fabbisogno di merci per la città di destinazione. Caricare al massimo le merci prodotte nella città stessa
> 
> [... + versioni ulteriormente perfezionate ...]
> 
> In questo modo si ottiene che le eccedenze delle merci consegnate tornino automaticamente al magazzino centrale e le merci vengano distribuite meglio.

Lo svantaggio principale: servono molte più navi per poter accogliere a bordo tutte le merci dal magazzino nella città di destinazione. Quando il convoglio è in viaggio, diverse navi saranno vuote. Inoltre, ogni tappa intermedia ritarda il tempo di percorrenza della rotta di 6 ore.

Il calcolatore avanzato dei convogli calcola una strategia di carico e scarico salvaspazio per la città da rifornire, in modo che un tale convoglio sia fattibile già con dimensioni di convoglio "normali". Per calcolare il convoglio di bilanciamento delle quantità, la casella di controllo "Convoglio semplice" deve essere deselezionata.

Oltre ai dati del convoglio già menzionati, occorre definire anche la dimensione del convoglio (in barili/Fass) e la quantità da tenere come riserva nell'ufficio commerciale. Questo valore è definito come multiplo (X) del consumo settimanale della città, il che significa che vengono stoccate merci sufficienti affinché la città possa essere rifornita dall'ufficio commerciale per X settimane (senza nuovi arrivi). Per le città i cui porti possono ghiacciare o che hanno un lungo tragitto per raggiungere il magazzino, si dovrebbe inserire qui un valore più alto. Ecco un esempio:

![](images/32303f0cde6746ca625401bc2bbf31737f5b9bafe1a7136d76724b06cbddce58.jpg)  
Le prime due tappe sono nel magazzino centrale, dove inizialmente tutte le merci vengono scaricate nell'ufficio commerciale. Nella seconda tappa viene caricato il fabbisogno della città.  
Nell'immagine è calcolata una strategia a 6 tappe che consente a Malmö di mantenere una riserva per 3 settimane con un convoglio da 1900 barili. Il numero di tappe necessarie dipende dalla dimensione del convoglio, dalla quantità prodotta e dal fabbisogno settimanale da conservare.  
La seconda tabella va letta semplicemente dall'alto verso il basso: "max" (blu) significa "caricare la merce al massimo dall'ufficio commerciale", "Raus" (rosso) significa "scaricare la merce al massimo nell'ufficio commerciale". I numeri su sfondo rosso indicano che questa quantità (a seconda della merce in barili/Fass o Last) deve essere portata nell'ufficio commerciale. Nell'ultima tappa vengono sempre caricate tutte le merci prodotte.

### Magazzini intermedi (Zwischenlager)

Qui si può selezionare se una città utilizza un magazzino intermedio.

Cosa si intende per magazzino intermedio?

Il caso più semplice di magazzino intermedio sono le città fluviali. Esempio: Novgorod viene rifornita da Ladoga; di conseguenza, tutte le merci per Novgorod vengono spedite dal magazzino centrale a Ladoga, e tra Novgorod e Ladoga è necessario solo un piccolo convoglio di creier (Kraier). In questo caso ha senso che Ladoga conservi una riserva settimanale maggiore. Il concetto di magazzino intermedio è molto utile quando le produzioni delle città si completano a vicenda. Per i magazzini intermedi, nel calcolo del bilanciamento delle quantità, dopo aver caricato al massimo la produzione viene scaricata nuovamente una piccola parte di questa produzione. Ciò evita che i convogli che utilizzano il magazzino intermedio come città di rifornimento trovino gli uffici commerciali vuoti. Tecnicamente, il concetto di magazzino intermedio non è limitato a un numero specifico di città. È persino possibile sostituire un sistema con più magazzini regionali con un sistema a singolo magazzino centrale che utilizza diversi grandi magazzini intermedi (in questo modo le eccedenze si accumulano solo nel magazzino centrale e non in ogni singolo magazzino regionale). I magazzini intermedi possono essere configurati in cascata uno dopo l'altro. Ad esempio, Londra e Colonia utilizzano Bruges come magazzino intermedio, Bruges utilizza Ribe (Ripen) come magazzino intermedio e Ribe viene rifornita dal magazzino centrale di Stettino (Stettin).

### Opzioni extra (Extraoptionen)

Cliccando sul pulsante "Opzioni extra", appare una riga di inserimento che consente di affinare ulteriormente il calcolo dei convogli. Se determinate materie prime vengono spedite a breve distanza da una città produttrice di materie prime a una vicina città di produzione senza fare un (potenzialmente) lungo giro per il magazzino centrale, questo può essere annotato in questa riga. Qui si possono inserire numeri ma anche formule. Un esempio: Lubecca preleva tutto il minerale di ferro e il legno prodotti ad Aalborg tramite un convoglio per il trasporto di materie prime (per produrre utensili/beni in ferro). Per "insegnare" ai convogli di rifornimento che non deve essere prelevato minerale di ferro/legno da Aalborg ma solo i "resti" da Lubecca, nella colonna del minerale di ferro di Lubecca deve esserci una formula che rimanda all'eccedenza di minerale di ferro di Aalborg: `=6_Verbrauch.H5`, e ad Aalborg il valore opposto: `=-1*6_Verbrauch.H5`. Questo meccanismo sembra un po' complicato ma è molto facile da usare con minime conoscenze di Excel. In questo modo si fa in modo che i carichi dei convogli siano copiabili in modo puramente meccanico.

### 2.9.3.3 Convogli di bilanciamento (Ausgleichkonvois)

Se è stato selezionato un magazzino centrale/regionale, cliccando su "Convoglio" apparirà un calcolo diverso.

Se esiste più di un magazzino, qui verranno calcolati i convogli di bilanciamento. Questi trasportano le merci da una regione all'altra, ad esempio scambiando il vino del Mare del Nord con le pelli del Mar Baltico.

Il calcolo di questi convogli avviene cliccando su "A-Konvoi-Calc". Il calcolatore integra 2 possibili sistemi di rotte e 2 possibili tecniche di bilanciamento delle merci.

#### Sistemi di rotte (Routensysteme)

In caso di più magazzini regionali, si può definire un magazzino centrale (magazzino principale, Hauptlager) verso cui convergono tutti gli altri magazzini regionali => in pratica un sistema a magazzino centrale per magazzini regionali :-)

Questo è utile ad esempio se si ha un magazzino regionale ad Aalborg, uno a Londra e uno a Visby – impostando Aalborg come magazzino principale, occorrerà creare e allestire solo 2 convogli di bilanciamento (Londra-Aalborg, Visby-Aalborg).

L'altro metodo di rotta è il sistema di rete (Netzwerksystem). In questo caso parte un convoglio da ciascun magazzino regionale verso ogni altro magazzino regionale; in questo modo il numero di convogli necessari cresce molto rapidamente (5 ZL => 10 convogli di bilanciamento, 7 ZL => 21 convogli di bilanciamento, ecc.). Pertanto questo sistema è utilizzabile probabilmente solo per sistemi di magazzini regionali con al massimo 3-4 magazzini regionali. Il vantaggio è che le consegne di merci arrivano direttamente. Esempio: il vino di Londra arriva direttamente a Visby senza dover magari "giacere" per 1-3 settimane nel magazzino di Aalborg.

La seconda impostazione riguarda il metodo di distribuzione delle merci, ovvero quante e quali merci vengono spedite.
Il metodo "Distribuzione delle eccedenze" (Überschussverteilung) spedisce solo le merci da un magazzino regionale che l'intera regione di quel magazzino (cioè le città collegate ad esso) produce complessivamente in eccedenza. Ad esempio, le pelli per Visby. Se una merce è appena sufficiente per la regione del magazzino regionale stesso, questa merce non verrà prelevata da quel magazzino. Esempio: se a Londra c'è vino a sufficienza solo per le città rifornite da Londra, allora con la "Distribuzione delle eccedenze" il convoglio di bilanciamento non porterà alcun barile di vino nel Mar Baltico.
Il metodo "Bilanciamento" (Ausgleichmethode) funziona in modo simile, con la differenza che vengono distribuite anche le merci carenti (ad esempio, in questo caso, il vino). In questo modo tutti i magazzini regionali avranno una carenza simile di merci (quindi anche a Londra ci sarà meno vino per tutte le città). Quale metodo sia più utile dipende molto dall'andamento attuale del gioco e dallo stile di gioco personale.

## 2.9.4 Importazioni (Importe)

L'indicazione delle importazioni è opzionale.

Esistono 2 tipi di importazioni – per tutti i tipi vale la regola che le quantità devono essere indicate su base settimanale. Inoltre possono essere modificate anche le impostazioni delle colonne BP-BV del foglio di inserimento (vedi anche 2.1.4).

### 2.9.4.1 Importazioni (Hinterland/Mediterraneo)
Questo tipo di importazione aumenta la produzione di una merce (è l'unico modo in cui possono essere "prodotte" le spezie). Questo tipo di "importazione" si basa ovviamente sul fatto che questa merce venga effettivamente acquistata e non lasciata nel mercato. Se esistono formule per il calcolo di questi valori, esse possono essere inserite al posto di valori fissi. Convertendo le importazioni in "produzione", i convogli preleveranno le quantità corrispondenti nelle città in cui ci sono importazioni.

### 2.9.4.2 Consumo (Verbrauch)
Questo tipo di importazione è il contrario del precedente, ovvero indica un consumo aggiuntivo. Cosa potrebbe costituire un consumo aggiuntivo oltre agli abitanti e alle materie prime delle imprese?
Ad esempio, materiali da costruzione e materiali per i cantieri navali.
Esempio semplice: 4 cantieri navali costruiscono costantemente cocche (Holk) da 700 (1 al mese); invece di distribuire ogni volta la pece tramite convogli manuali, si può semplicemente impostare che ogni città con un cantiere navale ha un consumo di pece pari a 50 (pece)/4 (settimane) e i normali convogli di rifornimento trasporteranno le quantità corrispondenti. In questo caso, tuttavia, occorre prestare attenzione a regolare le riserve dell'ufficio commerciale (Kontorvorhaltemengen) affinché il convoglio, durante il bilanciamento delle quantità, non si riprenda la pece appena consegnata.

## 2.10 Tempi di viaggio (Fahrtzeiten)

Questa tabella è nascosta per impostazione predefinita.

Qui i valori dello strumento di Brasilero sono stati convertiti da "secondi misurati in tempo reale" a giorni di gioco (viaggio di sola andata di un creier completamente carico). -> Un ringraziamento speciale a Brasilero per questi dati.

## 2.11 Materiali da costruzione (Baustoffe)

Questo foglio di calcolo calcola per le città il fabbisogno di materiali da costruzione, denaro e tempo di costruzione per i progetti edilizi, e determina il numero previsto di nuovi abitanti. Inoltre aiuta le persone smemorate come me a ricordare "perché ho inviato quel convoglio con 1500 mattoni a Ladoga" \*rifletto\* :-)

## 2.12 Raccolta di tabelle (Tabellensammlung)

In questa sezione sono state copiate alcune tabelle provenienti dal forum e dalla raccolta di suggerimenti.

## 2.13 Stampa (Ausdruck)

Come già descritto per il foglio di inserimento, qui si trova una versione vuota e stampabile dello stesso. Utile nel caso in cui non si disponga di un secondo computer o non si abbia voglia di passare continuamente da un programma all'altro durante l'inserimento dei dati.

## 2.14 Scadenze/Appuntamenti (Termine)

Questa tabella funge da piccolo gestore di appuntamenti. Posso impostare la data corrente nella cella A1 e visualizzare tutte le scadenze imminenti. Con il cursore di scorrimento posso impostare le scadenze da considerare per un determinato periodo. Cliccando su "Mostra tutti" (Alle anzeigen) tutte le scadenze diventano visibili ed è possibile aggiungerne di proprie. Per farlo, basta inserire una data nella colonna A e un breve testo descrittivo nella colonna D (ad esempio, "ritorno del convoglio del Mediterraneo", "strada terrestre completata", ecc.).

(Poiché né Excel né OpenOffice gestiscono anni precedenti al 1900 o al 1530, inserire semplicemente gli anni a due cifre). Se l'evento si ripete annualmente, inserire una "J" (o "S" per Sì/Ja) nella colonna C. Le date delle elezioni del sindaco si trovano a partire dalla riga 500.

## 2.15 Altro (Weiteres)

Al momento ci sono ancora alcune idee che vorrei integrare e utilizzare nello strumento. Ad esempio, il caricamento/salvataggio degli inserimenti (cronologia/History), ma la sua implementazione potrebbe richiedere ancora un po' di tempo.

## 3 FAQ (Domande frequenti)

➢ **Come posso configurare una nuova succursale/fondazione?**
Basta mostrare la riga corrispondente nel foglio di inserimento (Beiblatt) e adattare le possibilità di produzione.

➢ **Come posso adattare le possibilità di produzione di una città?**
Ci sono 2 modi per farlo:
1. Nel foglio di inserimento, impostare il colore di sfondo delle celle in modo che corrisponda al rispettivo colore di sfondo delle celle A44-A46.
2. Definire le possibilità di produzione nello strumento All\_in\_One sotto la voce "Produzione" (Produktion). Basta mostrare le righe 17-36 e adattare la colonna "Tipo" (Typ). Non dimenticare di cliccare su "Inserisci" (Eintragen).

➢ **Non riesco a trovare alcune delle tabelle descritte.**
Alcune tabelle sono nascoste per impostazione predefinita. È possibile mostrare o nascondere le tabelle dal menu *Formato -> Tabella -> Mostra* (o *Nascondi*).

➢ **Dove posso scaricare OpenOffice?**
http://de.openoffice.org/downloads/quick.html

➢ **Perché nella tabella delle imprese (Betriebe) vedo l'informazione che ho un'eccedenza di determinate imprese anche se non le ho costruite o non ne ho costruite così tante?**
Questo accade perché viene calcolata anche la produzione della città preesistente.

➢ **Perché nella tabella dei consumi a volte compare un consumo negativo?**
Questo succede quando la produzione della città è maggiore del consumo di quella determinata merce nella città stessa.

➢ **Cosa faccio se la mia domanda non compare (ancora) nelle FAQ?**
Invia semplicemente un messaggio privato (PN) a me (Falko) sul forum.

Se chi utilizza questo strumento dovesse riscontrare malfunzionamenti o avesse idee e suggerimenti su funzioni indispensabili da aggiungere, non esiti a contattarmi e a farmelo sapere.

In questo senso, buon divertimento con questo strumento, buon divertimento con PII e ovviamente sul forum!

Hopsing & Falko
