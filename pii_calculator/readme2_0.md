## PII-Kalkulator

## Version 2.0

Von Lutz Gollhardt (Hopsing) & Falko (Falko)

## Inhaltsverzeichnis

1 Einleitung....1
1.1 Übersicht zur Erweiterung....2
2 Erläuterungen zu den Tabellenblättern....2
2.1 Beiblatt....2
2.2 Bevölkerung....3
2.3 Betriebe....3
2.4 Häuser....3
2.5 Produktionszahlen....4
2.6 Verbrauch....4
2.7 Kontorhandels-Manager....4
2.8 Konvoi-Manager....5
2.9 All\_in\_One....5
2.10 Fahrtzeiten....8
2.11 Baustoffe....8
2.12 Tabellensammlung....8
2.13 Ausdruck....8
2.14 Termine....8
2.15 Weiteres....9
3 FAQ....9

## 1 Einleitung

Für Patrizier II sind schon einige Tools im Umlauf, die von vielen Spielern benutzt werden und es diesen ermöglichen, die Spielstrategie in der einen oder anderen Weise optimierend zu unterstützen.

Da jedoch meine Vorstellungen entsprechend, keines dabei war, das alles konnte was ich wollte machte ich mich daran den PII-Kalkulator von Hopsing nach meinen Wünschen umzugestalten. Bei der Entwicklung des PII-Kalkulators wurden die Tools von Brasileiro, Armbruster, Gesil und Ugh! als Grundlage genutzt. Den Genannten sei hier noch einmal ausdrücklich gedankt.

Grundanliegen der Entwicklung war es, ein Tool zu schaffen, welches für Anfänger und Fortgeschrittene gleichermaßen geeignet ist, das Spiel unterstützend zu begleiten. Ich hoffe, dass mir dies mit dem vorliegenden PII-Kalkulator gelungen ist und würde mich natürlich über ein Feedback der Nutzer, über Kritiken und Verbesserungsvorschläge sehr freuen.

Der Kalkulator lässt sich meiner Meinung nach ähnlich wie Version 1.1 bedienen. Die gravierenste Änderung ist das Dateiformat. Der Kalkulator liegt jetzt als Openoffice-Datei vor. Diese Datei arbeitet jetzt mit Makros. Dies ist nötig um etwas Komfort zu gewinnen sowie einige Berechnungen so erst zu ermöglichen.

## 1.1 Übersicht zur Erweiterung

Eine kurze Übersicht über die Möglichkeiten des Tools.

• Berechnung der Produktions- und Verbrauchsmengen der einzelnen Waren für jede Stadt

• Anzahl der überschüssigen sowie fehlenden Betriebe

• Anzahl der Wohnhäuser um eine bestimmte Anzahl an neuen Einwohnern unterzubringen

• Berechnung der Mengen die der Kontorverwalter für die Produktion mind. vorhalten soll

• Einstellung von bis zu 1-15 Zentral/Regionallagern (Ja, ich weiß das 15 zuviel ist :-) )

• Die Beladungsmengen der Versorgungskonvois

• Die Berechnung einer platzsparenden Strategie für den Mengenausgleich

• Die Bestückung von Ausgleich-Konvois zwischen Regionallagern

• Ein simpler Terminverwalter

• Eine Übersicht der Bauvorhaben sowie deren Kosten und resultierender Einwohnerzuwachs

• und ein (hoffentlich) einfaches Eingabetool für alle stadtspezifischen Informationen

Niemand wird alle Tools benutzen. Man kann sich je nach Geschmack seine Auswahl an Tabellenblättern einblenden. Dies ist im Menü „Format-> Tabellen-> Ein/Ausblenden“ möglich. Es sind standardmäßig nicht alle Tabellenblätter angezeigt.

Die Beispiele in den folgenden Erläuterungen beziehen sich auf die Standardkarte,

## 2 Erläuterungen zu den Tabellenblättern

Grundlage für das ordnungsgemäße Funktionieren des Tools ist die Eingabe von vier relevanten Werten. Es handelt sich hierbei grundsätzlich um die in der Stadtansicht abzulesenden Zahlen sowie einigen Infos über die Versorgungskonvois.

Dies sind:

1. Bevölkerungszahlen - ermittelt für Arme, Wohlhabende und Reiche in der Stadtansicht. (Kopfleiste oben links)

2. produzierende Betriebe - ermittelt durch Anklicken der jeweiligen Betriebsart in der Stadt. Es erscheinen im Interface Angaben zur jeweiligen Betriebsart.

3. fertige Wohnhäuser - ermittelt für Fachwerk-, Giebel- und Kaufmannshäuser durch Anklicken eines stadteigenen Hauses. Es erscheinen im Interface Angaben zu sämtlichen Wohnhäusern in der Stadt.

4. Konvoizahlen -

von jedem Versorgungskonvoi sollte der langsamste Schiffstyp und die Anzahl der Stopps in der Autoroute bekannt sein. Für den erweiterten Konvoirechner ist auch die Größe des Konvois nötig.

## 2.1 Beiblatt

Das Beiblatt ist die zentrale Eingabemaske für alle Daten im Kalkulator.

Er besteht aus 3 Teilen und einem optionalen Eingabeteil.

## 2.1.1 Bevölkerung

Die Daten für die Eingabe der Bevölkerung erhält der Spieler aus der ‚Bevölkerung’-Übersicht (Oben links im Spielbildschirm den Kopf anklicken) getrennt für Reiche, Wohlhabende und Arme.

## 2.1.2 Betriebe

Die Angabe ob eine Stadt eine Produktionsmöglichkeit hat und ob diese auch effektiv ist geschieht über die Hintergrundfarbe der entsprechenden Zelle. In die Zelle wird auch direkt die Anzahl der vorhandenen Betriebe eingegeben.

Die Bedeutung der Farben:

grün – keine Produktion

weiß – effektive Produktion

gelb – ineffektive Produktion

Natürlich muss das Beiblatt je nach Karte angepasst werden.

Das „Generieren“-Makro erfasst die in A44-A46 angezeigten 3 Farben und formatiert anhand dieser Farben alle relevanten Tabellen. Das Generieren-Makro muss nur gestartet werden wenn sich etwas an den Produktionsmöglichkeiten geändert hat. Also im Normalfall nach der Grundeinstellung zur Karte bei neuen Niederlassungen. Falls sich die Anzahl der Betriebe ändert ist das „Generieren“-Makro nicht nötig.

## 2.1.3 Häuser

Hier kann die Gesamtanzahl der Häusertypen pro Stadt angegeben werden. Für die reine Verbrauchs- und Konvoiberechnung ist diese angabe nciht nötig.

## 2.1.4 Zusatzinfos

Der Button Zusatzinfos zeigt zusätzliche Engabemöglchkeiten an.

Links neben der Häusereingabe stehen dann zusätzliche Informationen zum Versorgungskonvoi.

Unterhalb der Bevölkerungseingabe können Importe und Exporte/Verbrauch festgelegt werden. Es sind bis zu 200 Ex/Import-Einträge möglich. Da diese Eingabemöglichkeit nicht sehr effizient ist wenn man für alle Städte einen bestimmten Warenverbrauch festlegen möchte gibt es auch einer zusätzliche Möglichkeit Ex-/Importe anzugeben. Kurzes Beispiel: man möchte dem Kalkulator mitteilen den Lederverbrauch des Waffenschmieds mitzurechnen – Das Eingeben jeder einzelen Stadt ist aber zu mühsam, dann kann man in den Spalten BP-BV Ex-/Import-Waren angeben und diese sehr schnell für jede Stadt festlegen.

In der Version 1.1 war das Beiblatt als Ausdruckseite gedacht. DA hier nun Alle Daten eingetragen werden existiert die Tabelle 13\_Ausdruck in der eine einfache leere Kopie des Beiblatts ausdruckbar ist.

Die Städteliste in Spalte A kann durch aus- bzw. einblenden an die jeweilige Karte angepasst werden. Die Ausblendung der einzelnen Zeilen wird beim „Generieren“-Makro auf alle anderen Tabellenblätter übertragen.

## 2.2 Bevölkerung

In der Tabelle „2\_Bevölkerung“ wird die Gesamtbevölkerung der jeweiligen Stadt ausgegeben. Da die Bettler für die Stadt keine versorgungstechnische Bedeutung haben, wurden diese nicht berücksichtigt.

In der Zeile 44 werden die Anteile der drei Bevölkerungsgruppen in Prozent ausgegeben. Diese Zahlen sind für die Verbrauchsberechnung der Waren für die Versorgung der Bevölkerung von Bedeutung, da ja die Bevölkerungsgruppen unterschiedliche Mengen der einzelnen Warengruppen verbrauchen.

Zeile 46 gibt die Gesamtbevölkerung in der Hanse zum Update-Zeitpunkt aus.

## 2.3 Betriebe

Im Tabellenblatt ‚Betriebe’ sieht der Spieler die ermittelten Betriebe. Die Produktionskategorien ineffektiv und effektiv sind für die jeweilige Stadt entsprechend der gespielten Karte vordefiniert. (Grün= effektiv, Gelb= ineffektiv)

Als optischen Hinweis für den Spieler, dessen Ziel es immer sein sollte, möglichst den höchsten Produktionsbonus zu bekommen (ab 9 Betriebe einer Art), wurden die Betriebsarten in den jeweiligen Städten, wo dieser Bonus noch nicht erreicht ist, ocker unterlegt. Beim erreichen des höchsten Bonus wechselt ocker entsprechend der Produktionskategorie zu grün oder gelb.

Ausgegeben wird in Spalte 45 die Anzahl effektiver Betriebe, in Spalte 46 die Anzahl ineffektiver Betriebe. In Spalte 47 wurden die ineffektiven Betrieb auf effektive Betreibe umgerechnet. Zeile 48 gibt die Summe de effektiven und hochgerechneten ineffektiven Betriebe zurück.

Die Betriebe- Überschuss/Mangel-Berechnung in Zeile 50 (Sommer) und 51 (Winter) beruht also nur noch auf effektiven Betrieben (Weiß bedeutet Überschuss, Rot bedeutet Betriebemangel). Außerdem ist zu beachten, dass die Zahlen auf Basis des höchsten Produktionsbonus ausgegeben werden. In Zeile 52 wird aus den Sommer und Winterbetriebsmangel/Überschuss eine Mittelwert gebildet.

## 2.4 Häuser

In dieses Tabellenblatt sieht der Spieler die Wohnhäuser getrennt nach Fachwerk, Giebel- und Kaufmannshäusern. In den Spalten ‚Total’ wird entweder ein Mangel oder ein Überschuss ausgegeben. (Grün = Überschuss, Rot = Mangel)

Beim Anklicken des Feldes B-C 47 erscheint rechts davon ein Listenfeld. Hier kann der Spieler die gewünschte Stadt auswählen und erhält noch einmal die Stadtdaten bezüglich Einwohnerstruktur und Wohngebäudebestand.

Ein zusätzliches Feature gibt es für die Spieler, die den Vollausbau anstreben. Nach Auswahl der gewünschten Stadt, wie oben beschrieben, kann der Spieler durch eingeben der zu erwartenden Einwohnerzahl in das Feld BC59 ermitteln, wie viele Häuser der jeweiligen Art er noch bauen muss, um alle Einwohner zu beherbergen.

## 2.5 Produktionszahlen

Diese Tabelle ist standardmäßig ausgeblendet.

In dieser Tabelle wurden die Produktionszahlen der einzelnen Betriebsarten, getrennt nach effektiv und ineffektiv, Sommer und Winter, sowie entsprechend der einzelnen Produktionsboni ermittelt. Außerdem sind die Produktionsverbräuche der veredelnden Betriebe getrennt nach den Produktionsboni enthalten. In den Kommentaren (rotes Dreieck) ist angegeben um welchen Rohstoff es sich handelt.

Die Werte wurden im Contest 2005 ermittelt. Für die einzelnen Produktionsboni wurden die real vorhandenen Betriebszahlen benutzt. D.h. es sind die Werte, die vom Spiel beim Vorhandensein von bis zu 2, 3-5, 6-8 und 9 und mehr Betrieben ausgegeben wurden. Dazu wurde die entsprechende Betriebszahl durch Abriss sicher gestellt. Es erfolgte keine Hochrechnung.

## 2.6 Verbrauch

Diese Tabelle gliedert sich in 3 Teile:

## 2.6.1 Produktions und Verbrauchsmengen der einzelnen Städte

Hier finden sich die Werte für die Produktion der einzelnen Betriebsgruppen in den Städten, sowie der Verbrauch der Bevölkerung und der veredelnden Betriebe auf Wochenbasis wieder. Sie sind Grundlage fü die Konvoibeladung, ebenso für die Ermittlung des Betriebemangels/-überschusses in Tabelle 3.

## 2.6.2 Stadtbetriebe

Der Kalkulator kann die Produktion der Stadtbetriebe sowie den Rohstoffverbrauch der Stadtbetriebe einrechnen. Dazu gibt es unterhalb der Verbrauchsmengenberechnung eine Zeile in der die Einberechnung der Produktion und des Verbrauchs der Stadtbetriebe einzeln an/abgeschaltet werden kann.

## 2.6.3 Zentrallagerübersicht

Die letzten 15 Zeilen zeigen den Überschuss/Mangel je nach Zentrallager. Hier sind sehr gut Warenungleichgewichte erkennbar. z.B. zuviel Wein(produktion) in den Städten des Regionallagers das die Nordsee versorgt und zuviele Felle in den Ostseestädten. Auch weniger offensichtliche Warenverteilungen sind ersichtlich. Sehr hilfreich wenn man den Ausgleichkonvoi zwischen den Regionallagern per Hand ermitteln möchte.

## 2.7 Kontorhandels-Manager

Dieses Feature ist ein Ableger des im nächsten Punkt beschriebenen Konvoi-Managers. Es soll vor allem dem ungeübten Spieler ermöglichen, über den Kontorsverwalter die notwendigen Einstellungen zu tätigen, die es ermöglichen, eine maximale Versorgung seiner rohstoffverbrauchenden Betriebe zu gewährleisten und mittels Mengenausgleich durch die Versorgungskonvois einen ordnungsgemäßen Warenrückfluss aus der Zielstadt in das Zentrallager zu gewährleisten.

Die Regional/Zentrallager sind rot hinterlegt.

Die in dieser Tabelle ausgegebenen Werte müssen mindestens im ‚Kontorhandel’ für den Verwalter und die Konvois (rotes Häkchen) gesperrt werden, um eine maximale Versorgung der veredelnden Betriebe zu erreichen. Wer mit einem Sicherheitspuffer arbeitet, um z.B. Reparaturzeiten, Vereisungen oder lange Konvoiupdatezeiten auszugleichen, kann diesen Puffer im Feld A2 eingeben. Es ist darauf zu achten, dass die Eingabe in Prozent (z.B.10%) erfolgt.

Für den Mengenausgleich bedeutet dies, das dieser bei den Rohstoffen für die veredelnden Betriebe in der Autoroute immer auf ‚Maximal’ gestellt werden kann. Über die Grundeinstellungen für einen optimalen Mengenausgleich informiert euch bitte im Patrizierforum oder der Tippsamlung. Ein Berechnungstool zur Erstellung von Routen für Mengenausgleich-Konvois findet sich in Tabelle 9.

Die Menge die vorgehalten wird richtet sich nach dem Zeitraum für den genügend Rohstoffe vorhanden sein sollen (ohne Nachschub).

Zur Berechnung des Zeitraums sind 3 unterschiedliche Modi möglich:

• Fahrtzeit: Der Zeitraum einer Autokonvoi-Runde

• X-Wochen: Für alle Städte gilt der gleiche Vorhaltezeitraum von z.B. 1,5 Wochen

• vordefiniert: Hier gilt die für die Mengenausgleichkonvois eingestellte Wochenvorratsdauer

## 2.8 Konvoi-Manager

In diesem Tabellenblatt finden fast alle vom Spieler vorgenommenen Eingaben und die unterschiedlichsten Berechnungen auf anderen Tabellenblattern ihren Niederschlag.

Ausgegeben wird die Beladung der Autokonvois um eine Vollversorgung der einzelnen Städte zu garantieren. Ebenso können die Einstellungen für den Abtransport der in den Städten produzierten Waren ausgelesen werden. (Rot = Ware im ZL einladen, Grün = Ware für ZL einladen)

In den Spalten W und X werden die Warenmengen in Fass ausgegeben, die entweder vom ZL oder ins ZL transportiert werden müssen. Um bei ausreichendem Warenbestand eine Vollversorgung zu gewährleisten ist eine ausreichende Konvoigröße zu beachten. Als optischer Hinweis wurden die Konvois, die mehr Waren vom ZL in die Zielstadt transportieren rot unterlegt, da bei diesen Konvois auf die optimale Größe, wegen der Vollversorgung, besonders zu achten ist. Bei Veränderung der Transportmengen (mehr Ware vom ZL zur Zielstadt) wird der optische Hinweis angepasst.

Wie beim Kontorhandels-Manager kann im Feld A2 ein Sicherheitspuffer programmiert und die Städteliste an die jeweilige Karte angepasst werden. Dieser Warenmange die aus dem Regional/Zentrallager zur Sadt gebracht wird.

Unterhalb der Konvoianzeige kann eine „Reserve“ eingegeben werden. Diese erhöht die Konvoigrösse in Spalte Y falls mehr Waren produziert als verbraucht werden.

Die dargestellten Fahrtzeiten ergeben sich aus der Enstellung des Regional/Zentrallagers der entsprechenden Stadt im Beiblatt. Zusätzlich ist es möglich sich nur die Konvois eines bestimmten Regionallagers anzusehen. Die Auswahl trifft man in Zelle AD2

Die Regional/Zentrallager sind rot hinterlegt.

In dieser Ansicht werden die Einstellungen zu den Zwischenlagern nicht beachtet.

Im unteren bereich dieser Seite ist ein kleiner Fahrtzeiten-Rechner eingebaut.

## 2.9 All\_in\_One

Hier sind alle stadtspezifischen Eingaben auf einem Fleck versammelt.

Das heisst die Eingabe von Einwohner, Betrieben, Konvoi oder Importzahlen ist hier schnell erreichbar.

Zusätzlich sind hier die „Spezialitäten“ der neuen Version zu finden. z.B. Die Berechnung der

Ausgleichkonvois zwischen den Zentrallagern oder die exakte Bestückung von „Mengenausgleichkonvois“,...

Die Eingabe der Daten für alle Städte ist normalerweise im Beiblatt effizienter.

Alle Eingabefelder auf dieser Seite haben einen kleinen Rahmen (Schatten). Nur in diesen Feldern sollte etwas eingegeben werden. Im ersten Schritt muss eine Stadt geladen werden. Danach kann eine Auswahl der anzuzeigenden Eingabebereiche erfolgen. Bei Änderung der geladenen Werte werden die entsprechenden Bereiche sowie der Eintragen-Knopf farblich hinterlegt. Man sollte also nicht vergessen den Einrtragen-Button zu drücken bevor man sich die nächste Stadt lädt.

## 2.9.1 Allgemein

Hier wird die Bevölkerungsstruktur angegeben. Die Angabe ob diese Stadt eine Hansestadt, Niederlassung o.ä. Ist, wird genutzt um die Bautrupps sowie Stadtproduktion korrekt zu ermitteln (Niederlassungen haben einen Bautrupp mehr aber keine „eingebaute“ Stadtproduktion).

Eine weitere wichtige Angabe hier ist von wo aus die Stadt versorgt wird.

Falls als Zentrallager die gleiche Stadt angegeben wird als z.B. „Lübeck nutzt Lübeck als

Regional/Zentrallager“ wird die Stadt damit selbst zu einem Regional/Zentrallager.

## 2.9.2 Produktion

Hier kann die Anzahl der Betriebe sowie auch ihr Typ(effektiv,inneffektiv,nicht möglich) geändert werden. Als Zusatzinformation sind Verbrauch, Produktion, Überschuss/Mangel angegeben. Bei Klick auf „Vorhaltemenge-KV“ werden die Kontorvorhaltemengen der einzelnen Waren für diese Stadt ausgegeben. Die Berechnungsmodi aus dem Kontorhandelsmanager können hier auch eingestellt werden.

## 2.9.3 Konvois

## 2.9.3.1 Einfacher Konvoi

Durch die aktivierte Checkbox „Einfacher Konvoi“ kann man die Ansicht aus der 8\_K\_Manager-Tabelle nutzen. Hier kann der langsamste Schiffstyp sowie die Anzahl der Stopps pro Route angegeben werden. Nach dem Eintragen werden die Fahrtzeiten und damit die Konvoizuladungmengen neuberechnet.

## 2.9.3.2 Überschussvermeidungskonvoi

Ein häufiges Problem bei Autorouten ist das sich einige Waren in manchen Städten häufen während sie woanders fehlen. Dies liegt daran das die Versorgungskonvois zuviel der Waren zu dieser Stadt fahren. Es ist schwierig dies zu vermeiden gerade wenn die Stadt in einer Wachstumsphase ist. Eine Lösung für dieses Problem ist der Mengenausgleich.

Dazu siehe Tippsmmlung 8\_11 aus 2004 Seite 54

Hier ein kurzes Zitat:

Für den späteren Verlauf ist folgende Autorouten-Variante sehr nützlich und effektiv:

1. Zentrallager: alles max. ausladen

2. Zentrallager: Warenbedarf für Zielstadt einladen

3. Zielstadt: alles einladen (ohne Waren, die in der Zielstadt produziert werden)

4. Zielstadt: Warenbedarf für Zielstadt ausladen. Die Waren maximal einladen, die in

der Zielstadt produziert werden

[... + Weiter verfeinerte Versionen ...]

Somit erreicht man, dass Überschüsse an den gelieferten Waren automatisch wieder im

Zentrallager landen und die Waren besser verteilt werden.

Der größte Nachteil: Man benötigt viel mehr Schiffe, um alle Waren in der Zielstadt aus

dem Lager an Bord aufnehmen zu können. Wenn der Konvoi dann unterwegs ist, sind mehrere Schiffe leer. Außerdem, jeder Zwischenstopp verzögert die Laufzeit der Route um jeweils 6 Stunden.

Der Erweiterte Konvoirechner errechnet eine platzsparende Ein- und Ausladestrategie für die zu versorgende Stadt so das ein derartiger Konvoi bereits mit „normalen“ Konvoigrößen machbar sind. Um den Mengenausgleichkonvoi zu errechnen muß die „Einfacher Konvoi“-Checkbox ausgestellt sein.

Neben den bereits erwähnten Konvoiangaben ist zusätzlich noch die Konvoigrösse (in Fass) sowie die Menge die Im Kontor vorgehalten werden soll festzulegen. Dieser Wert wird als Vielfaches (X) des Wochenverbrauchs der Stadt definiert d.h. Es werden soviele Waren eingelagert das die Stadt X Wochen aus dem Kontor versorgt werden kann (ohne Nachschub). Für Städte, deren Häfen zufrieren können oder die einen langen Anfahrtsweg zum Lager haben, sollte hier ein höherer Wert eingetragen werden. Hier ein Beispiel:

![](images/32303f0cde6746ca625401bc2bbf31737f5b9bafe1a7136d76724b06cbddce58.jpg)  
Die ersten beiden Stopps sind im Zentrallager dort werden erst alle Waren ins Kontor ausgeladen. Im 2. Stopp wird die Bedarfsmenge der Stadt eingeladen.  
Im Bild ist eine 6 Stopp-Strategie errechnet worden die dafür sorgt das Malmö mit einem 1900 Fass Konvoi einen 3-Wochenvorrat vorhalten kann. Die Anzahl der nötigen Stopps richtet sich nach Konvoigröße, Produktionsmenge und vorzuhaltendem Wochenbedarf.  
Die 2.Tabelle ist einfach von oben nach unten zu lesen max (blau) bedeutet „Ware maximal aus Kontor einladen“ Raus (rot) bedeutet „Ware maximal in Kontor einladen“ die Zahlen auf rotem Hintergrund bedeuten das diese Menge (je nach Ware in Fass/Last) in das Kontor gebracht werden muss. Im letzten Schritt werden dann immer alle produzierten Waren aufgeladen.

## Zwischenlager:

Man kann hier auswählen ob eine Stadt ein Zwischenlager nutzt.

Was ist mit Zwischenlager gemeint?

Der einfachste Fall für ein Zwischenlager sind die Flußstädte. Beispiel: Nowgorod wird von Ladoga aus versorgt dadurch werden vom Zentrallager nach Ladoga alle Waren für Nowgorod mitgeliefert und nur ein kleiner Kraierkonvoi zwischen Nowgorod und Ladoga ist nötig. Ladoga sollte dann sinnvollerweise eine größere Wochenvorratsmenge vorhalten. Das Zwischenlagerkonzept ist sehr sinnvoll wenn sich die Produktionen der Städte gut ergänzen. Für Zwischenlager wird bei der Berechnung des Mengenausgleichs nach dem maximalen Einladen der Produktion noch ein wenig dieser Produktion wieder ausgeladen. Dies vermeidet das die Konvois die das Zwischenlager als Versorgungsstadt nutzen auf leere Kontore treffen. Technisch ist das Konzept des Zwischenlagers nicht auf eine bestimmte Anzahl an Städten beschränkt. Es ist sogar möglich ein System mit mehreren Regionallager Durch ein Ein-Zentrallager-System zu ersetzen das mehrere grosse Zwischenlager nutzt. (Dadurch fallen Überschuesse nur im Zentrallager an und nicht in jedem einzelnen Regionallager.) Zeischenlager können beliebig hintereinander eingestellt werden. z.B. London und Köln nutzen Brügge als Zwischenlager, Brügge nutzt Ripen als Zwischenlager und Ripen wird vom Zentrallager Stettin versorgt.

## Extraoptionen:

Bei Klick auf den Extraoptionen-Button erscheint eine Eingabezeile die es ermöglicht die Konvoiberechnung weiter „feinzutunen“. Falls bestimmte Rohstoffe auf kurze Entfernung von einer Rohstoffstadt zur nahen Produktions-Stadt verschifft werden ohne einen (möglicherweise) großen Umweg über das Zentrallager kann dies in dieser Zeile vermerkt werden. Hier können Zahlen aber auch Formeln eingegeben werden. Ein Beispiel: Lübeck holt sich alles Eisenerz und Holz das in Aalborg produziert wird per

Rohstofftransportkonvoi (um Eisenwaren zu produzieren). Um den Versorgungskonvois nun „beizubringen“ das kein Eisenerz/Holz aus Aalborg geholt werden muss sondern nur die „Reste“ aus Lübeck muss bei Lübeck in der Eisenerzspalte eine Formel stehen die auf den Eisenerz-Überschuss-von Aalborg verweist „=6\_Verbrauch.H5“ und in Aalborg der negierte Wert „=-1\*6\_Verbrauch.H5“. Dieser Mechanismus klingt ein wenig kompliziert ist aber mit minimalen Excel-kenntnissen sehr einfach nutzbar. Dadurch ist man in der Lage das die Konvoizuladungen wirklich stur abtippbar sind.

## 2.9.3.3 Ausgleichkonvois

Sollte ein Zentral/Regionallager ausgewahlt worden sein erscheint bei Klick auf „Konvoi“ ein andere Berechnung.

Sollte mehr als ein Lager existieren werden hier Ausgleichkonvois berechnet. Diese verschiffen die Waren aus einer Region in eine andere z.B. Norsee-Wein wird gegen Ostsee-Fell getauscht.

Die Berechnung dieser Konvois geschieht mit dem Klick auf „A-Konvoi-Calc“. Der Rechner hat 2 mögliche Routensysteme sowie 2 mögliche Warenausgleichtechniken integriert.

## Routensysteme:

bei mehreren Regionallagern kann man ein zentrales Lager (Hauptlager) bestimmen welche alle anderen Regionallager anfahren => also ein Zentrallagersystem für Regionallager :-)

Das ist z.B. sinvoll wenn man in Aalborg, London und Visby ein Regionallager hat – mit dem Hauptlager Aalborg müssen nur 2 Ausgleichskonvois (London-Aalborg,Visby-Aaalborg) erstellt und bestückt werden.

Die andere Routenmethode ist das Netzwerksystem. Hier fährt von jedem Regionallager zu jedem anderen Regionallager ein Konvoi dadurch steigt die Anzahl der nötigen Konvois sehr stark an (5 ZLs=>10 Ausgleichkonvois, 7 ZLs=>21 Ausgleichkonvois,..) Daher ist das System vermutlich nur für

Regionallagersyteme mit maximal 3-4 RLs brauchbar. Der Vorteil ist das die Warenlieferungen direkt ankommen. Beispiel: Der Wein aus London kommt auf direktem Wege nach Visby ohne evtl. 1-3 Wochen im Aalborglager „herumzuliegen“.

Die zweite Eingabe betrifft die Warenverteilmethodik also wieviele und welche Waren werden verschifft. Die „Überschussverteilung“-Methodik verschifft nur Waren aus einem RL die die gesamte RL-Region (also die Städte die an das RL angeschlossen sind) gemeinsam als Überschuss produzieren. z.B. Felle für Visby. Sollte eine Ware gerade so für die RL-Region selber ausreichen wird diese Ware nicht aus dem RL entfernt. z.B. Es gibt in London nur genug Wein für die Städte die von London aus versorgt werden dann wird mit der „Überschußverteilung“ der Ausgleichkonvoi kein Fass Wein in die Ostsee schippern. Die Ausgleichmethode funktioniert ähnlich ausser das Mangelwaren (z.B. hier Wein) auch verteilt werden. Dadurch haben alle RL einen ähnlichen Mangel an Waren (also auch London zuwenig Wein für alle Städte). Welche Methode brauchbarer ist hängt stark vom aktuellen Spielgeschehen und der eigenen Spielweise ab.

## 2.9.4 Importe

Die Angabe von Importen ist optional.

Es gibt 2 Typen von Importen – Für alle Typen gilt das die Mengen jeweils für eine Woche angegeben werden müssen. Zusätzlich können auch die Angaben zu den Spalten BP-BV des Beiblatts geändert werden. (siehe auch 2.1.4)

## 2.9.4.1 Importe (Hinterland/Mittelmeer)

Dieser Import-typ erhöht die Produktion einer Ware (die einzige Möglichkeit das Gewürze „produziert“ werden können) – Dieser „Import“-Typ basiert natürlich darauf das diese Ware auch eingekauft wird und nicht in der Markthalle rumliegt . Falls Formeln zur Errechnung dieser Werte existieren können diese auch anstatt fester Werte angegeben werden. Durch die Umwandlung der Importe in „Produktion“ holen die Konvois in den Städten wo es Importe gibt entsprechende Mengen ab.

## 2.9.4.2 Verbrauch

Dieser Import-Typ ist das Gegenteil des Imports also – zusätzlicher Verbrauch – Was könnte ausser Einwohnern und Betriebsrohstoffe noch an zusätzlichem Verbrauch anfallen ?

z.B. Baustoffe und Werftmaterial.

Einfaches Beispiel: 4 Werften bauen durchgehend 700er Holke (1/Monat) anstatt zwischendurch immer per manuellem Konvoi Pech zu verteilen kann einfach gesagt werden jede Werft-Stadt hat einen Pech-Verbrauch von 50(Pech)/4(Wochen) und die normalen Versorgungskonvois nehmen entsprechende Mengen mit). Hier ist jedoch auf angepasste Kontorvorhaltemengen zu achten damit der Konvoi beim Mengenausgleich nicht das gerade gelieferte Pech wieder mitnimmt.

## 2.10 Fahrtzeiten

Diese Tabelle ist standardmäßig ausgeblendet.

Hier sind die Werte aus dem Brasilero-Tool von „sekunden in normalzeit gemessen“ auf Spieltage umgerechnet (einfache Fahrt eines vollbeladenen Kraiers). -> hier nochmal vielen Dank an Brasilero für die Daten.

## 2.11 Baustoffe

Dieses Tabellenblatt berechnet für die Städte den Bedarf an Baustoffen, Geld und Bauzeit für die Bauvorhaben und ermittelt die zu erwartende Anzahl an neuen Einwohnern. Ausserdem hilft er einem vergesslichen Menschen wie mir, sich zu erinnern „wozu ich diesen Konvoi mit 1500 Ziegeln nach Ladoga geschickt habe“ \*grübel\* :-)

## 2.12 Tabellensammlung

In diesem Teil wurden einige Tabellen aus Forum und Tippsammlung hineinkopiert.

## 2.13 Ausdruck

Wie bereits beim Beiblatt beschreiben findet ich hier eine ausdruckbare leere Version des Beiblatts. Sinnvoll fall sman keinen 2. Rechner bzw. keine Lust auf dauernden Wechsel der Programme während der Eingabe hat.

## 2.14 Termine

Diese Tabelle dient als kleine Terminverwaltung. Ich kann das aktuelle Datum in A1 einstellen und erhalte alle Termine die in nächster Zeit anstehen. Mit dem Schieberegler kann ich den zu betrachtenden Zeitraum einstellen. Bei Klick auf „Alle anzeigen“ werden alle Termine sichtbar und man kann eigene hinzufügen. Dazu muss einfach in Spalte A ein Datum eingefügt werden sowie in Spalte D ein kleiner Text was an dem Termin passiert. z.B. Mittelmeerkonvoi wieder da, Landweg fertiggebaut,...

(da weder Excel noch Openoffice Jahreszahl vor 1900/1530 beherschen einfach 2stellige jahreszahlen eingeben) Falls sich das Ereignis jährich wiederholt sollte ein „J“ in die Spalte C eingeben werden. Die Bürgermeisterwahltermine finden sich diese ab der Zeile 500.

## 2.15 Weiteres

Derzeit sind noch einige Ideen vorhanden die ich noch in das Tool einbauen und nutzen möchte. z.B. Laden/Speichern der Eingaben (History) die Implementation dafür kann sich aber noch etwas hinziehen.

## 3 FAQ

➢ Wie richte ich eine neue Niederlassung ein ? Einfach im Beiblatt die entsprechende Zeile einblenden und die Produktionsmöglichkeiten anpassen.

➢ Wie passe ich die Produktionsmöglichkeiten einer Stadt an ? Hier gibt es 2 Möglichkeiten:

1. Im Beiblatt die Hintergrundfarbe der Tabellenzellen so setzen das sie mit der entsprechenden Hintergrundfarbe aus den Zellen A44-A46 übereinstimmt 2. Die Produktionsmöglichkeiten im All\_in\_One Tool unter Produktion festlegen. Einfach die Zeilen 17-36 einblenden und die „Typ“-Spalte entsprechend anpassen. Das Eintragen nicht vergessen.

➢ Ich finde einige der beschrieben Tabellen nicht.

Einige Tabellen sind standardmäßig ausgeblendet man kann Tabellen im Menu unter Format->Tabellen-> ein bzw. ausblenden.

➢ Wo kriege ich Openoffice her ?

http://de.openoffice.org/downloads/quick.html

➢ Wieso ist in der Betriebe-Tabelle die Info das ich einen Überschuss an bestimmten Betrieben hab obwohl ich garkeine / nicht soviele Betriebe gebaut habe? Das liegt daran das hier auch die Stadtproduktion miteingerechnet wird.

➢ Warum steht in der Verbrauchstabelle manchmal ein negativer Verbrauch? Dies liegt daran das die Stadtproduktion größer ist als der Verbrauch dieser Ware in der Stadt.

➢ Was tue ich wenn meine Frage (noch) nicht in den FAQs auftaucht ? Einfach im Forum eine PN an mich (Falko) schicken

Wenn jemand, der dieses Tool nutzt, etwas finden sollte, was nicht richtig funktioniert oder Ideen und Vorschläge hat was man noch unbedingt braucht sollte er/sie dies natürlich nicht für sich behalten, sondern mir eine Nachricht zukommen lassen.

In diesem Sinne viel Spaß mit diesem Tool, viel Spaß mit PII und natürlich im Forum!

Hopsing & Falko