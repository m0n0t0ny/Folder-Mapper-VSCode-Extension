### Prima di committare

1. Aggiorna CHANGELOG.md

2. Aggiorna README.md (specialmente la sezione Release Notes)

3. Impacchetta l'estensione con il comando:
   vsce package

4. Pubblica l'estensione con il comando:
   vsce publish

### Auto-increment the extension version

When publishing an extension, you can auto-increment its version number by specifying the SemVer-compatible number or version (major, minor, or patch) to increment.
For example, to update an extension's version from 1.0.0 to 1.1.0, you would specify:

vsce publish minor

or

vsce publish 1.1.0

### Prossime Features

- Implementazione pipeline automatica di building e deploy:
  https://code.visualstudio.com/api/working-with-extensions/continuous-integration

- Opzioni di output flessibili:
  Aggiungere la possibilità di generare output in formato Markdown.
  Implementare un'opzione nell'interfaccia utente per scegliere tra testo semplice e Markdown.

- Personalizzazione dell'output:
  Integrare la possibilità di escludere determinate cartelle o tipi di file.
  Aggiungere un'opzione per limitare la profondità della mappatura.

- Visualizzazione della struttura delle cartelle in VS Code:
  Implementare una vista ad albero interattiva all'interno di VS Code per visualizzare la struttura delle cartelle mappate.

- Gestione di progetti di grandi dimensioni:
  Implementare la mappatura asincrona per evitare il blocco dell'interfaccia utente durante la mappatura di progetti molto grandi.
  Aggiungere opzioni per limitare la profondità della mappatura o escludere cartelle specifiche per gestire meglio i progetti di grandi dimensioni.

- Integrazione con altre funzionalità di VS Code:
  Considerare l'integrazione con il sistema di controllo versione per escludere automaticamente le cartelle ignorate (es. .gitignore).
  Aggiungere un'opzione per aprire direttamente i file o le cartelle dalla vista della struttura delle cartelle.
