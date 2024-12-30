import { SelectReturnType, SelectSingleReturnType, useNamespaces } from "xpath";
import { DOMParserImpl } from "xmldom-ts";

export abstract class UnparsedXML<Tparsed> {
  protected _doc: Document;

  constructor(protected _xml: string) {
    const dom = new DOMParserImpl();
    this._doc = dom.parseFromString(this.xml, "text/xml");
  }

  abstract parse(): Tparsed;

  get xml() {
    return this._xml;
  }

  setNamespaces(
    namespaceMap: Record<string, string>
  ): [(q: string) => SelectReturnType, (q: string) => SelectSingleReturnType] {
    const selectFn = useNamespaces(namespaceMap);
    return [
      /* Select many */
      (q: string) => selectFn(q, this._doc, false),
      /* Select one */
      (q: string) => selectFn(q, this._doc, true),
    ];
  }
}
