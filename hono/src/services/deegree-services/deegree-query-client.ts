import axios from "axios";
import "dotenv/config";
import { Position, Point, FeatureCollection, Polygon } from "geojson";
import { getMime } from "../../utils/mime-types";
import { CreatureGeoProps, SpawnerGeoProps } from "./deegree.models";

export class DeegreeQueryClient {
  private readonly BASE_SERVICE_URL = process.env.GEO_SERVICES_URL ?? "";
  private readonly AUTH = {
    username: process.env.GEO_USERNAME ?? "",
    password: process.env.GEO_PASSWORD ?? "",
  } as const;

  private readonly WFS_PARAMS = {
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    outputFormat: getMime("json"),
  } as const;

  async getCreaturesForPlayer(coordinates: Position, _playerId: string) {
    const settings = {
      auth: this.AUTH,
      params: {
        ...this.WFS_PARAMS,
        typeNames: "app:creatures__spawned",
        storedquery_id: "getCreaturesForPlayer",
        playerLocation: coordinates.join(","),
      },
    };

    // TODO: deal with models better, and remove the redundant ones
    return await axios.get<FeatureCollection<Point, CreatureGeoProps>>(
      `${this.BASE_SERVICE_URL}/CreatureWfs`,
      settings
    );
  }

  async getSpawnersForPlayer(coordinates: Position, _playerId: string) {
    const settings = {
      auth: this.AUTH,
      params: {
        ...this.WFS_PARAMS,
        typeNames: "app:Spawners",
        storedquery_id: "getSpawnersForPlayer",
        playerLocation: coordinates.join(","),
      },
    };

    // TODO: deal with models better, and remove the redundant ones
    return await axios.get<FeatureCollection<Polygon, SpawnerGeoProps>>(
      `${this.BASE_SERVICE_URL}/SpawnerWfs`,
      settings
    );
  }
}

// Get pokemon near player
// Get spawners near player
