import { create } from "xmlbuilder2";
import { XMLBuilderImpl } from "xmlbuilder2/lib/builder";
import { Position } from "geojson";

export class TransactionXMLBuilder extends XMLBuilderImpl {
  constructor() {
    const node = create({ version: "1.0" }).node;
    super(node);

    this.ele("wfs:Transaction", {
      service: "WFS",
      version: "2.0.0",
      "xmlns:wfs": "http://www.opengis.net/wfs/2.0",
      "xmlns:gml": "http://www.opengis.net/gml/3.2",
      "xmlns:app": "http://www.deegree.org/app",
    });
  }

  // TODO: pass an object instead, but only once ive figures out the different models for creature
  insertCreature(position: Position, species: string, isShiny: boolean) {
    this.root()
      .ele("wfs:Insert")
      .ele("app:creatures__spawned")
      .ele("app:geometry")
      .ele("gml:Point", { srsName: "EPSG:28992" })
      .ele("gml:pos")
      .txt(this.positionToTxt(position))
      .up(/* Close gml:pos */)
      .up(/* Close gml:Point */)
      .up(/* Close app:geometry */)
      .ele("app:species")
      .txt(species)
      .up(/* Close app:species */)
      .ele("app:is_shiny")
      .txt(this.boolToTxt(isShiny));
    /* Library is smart enough to close all leftover tags */
  }

  boolToTxt(value: boolean) {
    return `${value}`;
  }

  positionToTxt(position: Position) {
    return position.join(" ");
  }

  build() {
    return this.doc().end({ prettyPrint: true });
  }
}
