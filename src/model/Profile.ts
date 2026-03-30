export interface ProfileEmail {
  id: string;
  emailAddress: string;
  primary: boolean;
  verified: boolean;
}

export interface ProfileResponse {
  userId: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  emailAddresses: ProfileEmail[];
}
