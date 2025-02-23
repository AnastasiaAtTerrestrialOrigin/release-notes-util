export interface Version {
    id: string;
    name: string;
    released: boolean;
    releaseDate?: string;
    plannedReleaseDate?: string;
    startDate?: string;
    jiraLink?: string;
    description?: string;
    archived?: boolean;
}

export default Version;