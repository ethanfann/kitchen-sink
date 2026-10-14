# Third-party notices

Kitchen Sink's MIT license does not replace the terms of third-party material or referenced projects.

## CRXJS starter icon

`public/logo.png` is the unmodified icon from [create-crxjs's vanilla template](https://github.com/crxjs/create-crxjs/blob/0f56335cc04d3b6ac3577c93c48849addc425605/templates/vanilla/public/logo.png). Its Git blob ID is `c968ca534bedc091efdd088e887d3565dbc2bb73`.

The [upstream license](https://github.com/crxjs/create-crxjs/blob/0f56335cc04d3b6ac3577c93c48849addc425605/LICENSE) includes an MIT grant and a CC0 template exception. We preserve the MIT notice here rather than relying on the scope of that exception.

```text
MIT License

Copyright (c) 2025 crxjs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Google detection references

The independently implemented Google content script uses identifiers from Google's page markup. Its detection was informed by:

- **[Fanboy's Anti-AI Suggestion List](https://github.com/easylist/easylist/blob/master/fanboy-addon/fanboy_ai_suggestions.txt)**, by [The EasyList authors](https://easylist.to/). The file declares [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/) and credits [Jonathan Sampson's Block AI Search Elements list](https://jonathansampson.github.io/filter/ai.txt). The `#Odp5De` and `#main > [data-ved]` candidates were adapted from filter syntax to JavaScript matching, with additional checks to avoid ordinary results. Kitchen Sink blurs matching content instead of hiding it. The filter list is not bundled.
- **[AI Overview Hider for Google](https://github.com/insin/ai-overview-hider-for-google/blob/master/style.css)**, by Jonny Buchanan (`insin`). This was a reference for the `.ULSxyf` and `.MjjYud` result-section boundaries and the Google SVG path prefix used to identify inline AI Overviews. Its [Firefox listing](https://addons.mozilla.org/en-US/firefox/addon/ai-overview-hider-for-google/) declares All Rights Reserved. No upstream stylesheet is bundled or relicensed by Kitchen Sink; the path fragment is used as a DOM fingerprint, not displayed as artwork in the extension UI.
