export interface Version {
    id: string;
    name: string;
    released: boolean;
    releaseDate?: string;  // Optional since some versions don't have a release date
}

export default Version;