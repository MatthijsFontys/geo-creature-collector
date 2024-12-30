import { isArrayOfNodes, isNodeLike } from "xpath";
import { TransactionResponse } from "./xml.models";
import { UnparsedXML } from "./base.parser";

export class UnparsedTransactionResponse extends UnparsedXML<TransactionResponse> {
  parse(): TransactionResponse {
    const [select, select1] = this.setNamespaces({
      wfs: "http://www.opengis.net/wfs/2.0",
      fes: "http://www.opengis.net/fes/2.0",
    });

    const transactionCounts = new Map<string, number>([
      ["totalInserted", -1],
      ["totalReplaced", -1],
      ["totalUpdated", -1],
      ["totalDeleted", -1],
    ]);

    const summaryPath = "//wfs:TransactionSummary";

    transactionCounts.forEach((_, q) => {
      const selected = select1(`${summaryPath}/wfs:${q}`);
      if (!isNodeLike(selected)) {
        throw Error(
          `${q} | should be of type Node, but isn't. value: ${selected}`
        );
      }
      if (!selected.textContent) {
        throw new Error(`${q} | is empty`);
      }
      transactionCounts.set(q, parseInt(selected.textContent));
    });

    const insertedIdNodes = select("//wfs:Feature/fes:ResourceId/@rid");
    const insertedIdValues: string[] = [];
    if (isArrayOfNodes(insertedIdNodes)) {
      insertedIdNodes
        .filter((x) => x.nodeValue)
        .forEach((x) => insertedIdValues.push(x.nodeValue!));
    }

    return {
      totalInserted: transactionCounts.get("totalInserted")!,
      totalReplaced: transactionCounts.get("totalReplaced")!,
      totalUpdated: transactionCounts.get("totalUpdated")!,
      totalDeleted: transactionCounts.get("totalDeleted")!,
      insertedIds: insertedIdValues,
    };
  }
}
