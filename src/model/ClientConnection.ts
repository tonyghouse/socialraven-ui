export type ClientConnectPlatform =
  | "x"
  | "linkedin"
  | "youtube"
  | "instagram"
  | "facebook";

export type ClientConnectionEventType = "CONNECTED" | "RECONNECTED";

export interface ClientConnectionActivity {
  platform: ClientConnectPlatform;
  providerUserId: string;
  eventType: ClientConnectionEventType;
  actorDisplayName: string;
  actorEmail: string;
  createdAt: string;
}

export interface ClientConnectionSession {
  id: string;
  token: string;
  createdByUserId: string;
  createdByDisplayName: string;
  recipientName: string | null;
  recipientEmail: string;
  clientLabel: string | null;
  agencyLabel: string | null;
  message: string | null;
  allowedPlatforms: ClientConnectPlatform[];
  expiresAt: string;
  revokedAt: string | null;
  lastAccessedAt: string | null;
  lastConnectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  connectionCount: number;
  recentActivity: ClientConnectionActivity[];
}

export interface CreateClientConnectionSessionRequest {
  recipientName?: string;
  recipientEmail: string;
  clientLabel?: string;
  agencyLabel?: string;
  message?: string;
  allowedPlatforms?: ClientConnectPlatform[];
  expiresAt?: string;
}

export interface PublicClientConnectionSession {
  clientLabel: string;
  agencyLabel: string;
  workspaceName: string;
  companyName: string;
  logoUrl: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  message: string;
  allowedPlatforms: ClientConnectPlatform[];
  linkExpiresAt: string;
  linkRevoked: boolean;
  linkExpired: boolean;
  canConnect: boolean;
  recentActivity: ClientConnectionActivity[];
}
