import "dotenv/config";
import { Position } from "geojson";
import { TransactionXMLBuilder } from "./transaction-xml-builder";
import axios, { AxiosRequestConfig } from "axios";
import { getMime } from "../../utils/mime-types";
import { TransactionResponse } from "./xml-parsers/xml.models";
import { UnparsedTransactionResponse } from "./xml-parsers/transaction-response.parser";

export class DeegreeCommandClient {
  private readonly BASE_SERVICE_URL = process.env.GEO_SERVICES_URL ?? "";
  private readonly AUTH = {
    username: process.env.GEO_USERNAME ?? "",
    password: process.env.GEO_PASSWORD ?? "",
  } as const;

  private readonly WFS_PARAMS = {
    service: "WFS",
    version: "2.0.0",
    request: "Transaction",
  } as const;

  private readonly TRANSACTION_CONFIG: AxiosRequestConfig = {
    headers: { "Content-Type": getMime("xml") },
    auth: this.AUTH,
    params: this.WFS_PARAMS,
  };

  constructor() {}

  async spawnCreature(
    location: Position,
    species: string,
    isShiny: boolean
  ): Promise<TransactionResponse> {
    const builder = new TransactionXMLBuilder();
    builder.insertCreature(location, species, isShiny);
    const transactionXml = builder.build();

    const response = await axios.post<string>(
      `${this.BASE_SERVICE_URL}/CreatureWfs`,
      transactionXml,
      this.TRANSACTION_CONFIG
    );

    const unparsed = new UnparsedTransactionResponse(response.data);
    return unparsed.parse();
  }

  async despawnCreature(creatureId: string): Promise<TransactionResponse> {
    const builder = new TransactionXMLBuilder();
    builder.deleteCreature(creatureId);
    const transactionalXml = builder.build();

    const response = await axios.post<string>(
      `${this.BASE_SERVICE_URL}/CreatureWfs`,
      transactionalXml,
      this.TRANSACTION_CONFIG
    );
    const unparsed = new UnparsedTransactionResponse(response.data);
    return unparsed.parse();
  }
}
