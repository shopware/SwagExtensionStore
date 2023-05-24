# 1.0.0
- Erster Release im Store

# 1.1.0
- Es wurde ein falsches Verhalten gefixt, wenn der Benutzer keine Bezahlmethode hinterlegt hat
- Es wird nun eine Warnung angezeigt, falls der Benutzer keine Bezahlmethode hinterlegt hat

# 1.2.0
- Wenn die Installation einer Erweiterung fehlgeschlagen ist, wird auf der Detailseite der Erweiterung ein Fehlermodal angezeigt
- Es wird nun auch eine Checkbox für die AVV angezeigt, wenn keine Berechtigungen benötigt werden
- Es wurde ein Fehler in der RouteMiddleware behoben. Dieser führte dazu, dass manche Plugins keine Routen mehr erweitern konnten

# 1.3.0
- Fehler in Route behoben, der die Kompatibilität bricht
- Der Suchbegriff bleibt erhalten während man durch den Extension Store navigiert
- Fehler bei der Anzeige der Detailseite von Enterprise Erweiterungen behoben 

# 1.4.0
- Korrigiert die Nachkommastellen in der Preisdarstellung im Erweiterungskaufmodal
- Verbessert und refaktoriert die Preisdarstellung auf der Kaufen-Detailseite und dem Kaufen-Modal
- Platzhalter zur Suchleiste hinzugefügt und den `initialSearchType` umbenannt
- Verbessert Fehlermeldungen
- Fehler behoben, der beim Wechseln der Tabs die Seite nicht zurücksetzte
- Verbessert Darstellung im Kaufen-Modal, wenn Probemonat bereits genutzt wurde
- Verbessert Fehlerbehandlung im Bestellprozess im Kaufen-Modal

# 1.4.1
- Fehler behoben, der beim Wechseln der Variante das Kaufen-Modal im Ladezustand lässt

# 1.5.0
- Fehler behoben, der den Kaufprozess im Fehlerfall nicht unterbrochen hat
- Verbessert den Aufruf der Methode `getCart` in der Komponente `sw-extension-buy-modal`, um sicherzustellen, dass keine zweite Anfrage unnötig gesendet wird
- Erhöht die Version des `@shopware-ag/jest-preset-sw6-admin` Package
- Filter für die Kategorien besitzt nun mehr Ebenen, für mehr Filteroptionen

# 1.6.0
- Ladeanimation im Listing optimiert

# 2.0.0
- Kompatibilität mit Shopware 6.5 sichergestellt

# 2.1.0
- Verschiedenste visuelle Anpassungen am Listing und der Detailseite
- Kurzbeschreibung aus dem Header der Detailsseite entfernt
- Aussehen der Bewertungssterne im Listing und auf der Detailseite geändert
- Neuladen der Administration nach dem Installieren eines Plugins
- Fehler im CSS des Loginmodals auf der Detailseite behoben
