export interface IssueType {
    self: string;
    id: string;
    description: string;
    iconUrl: string;
    name: string;
    subtask: boolean;
    avatarId: number;
    entityId: string;
    hierarchyLevel: number;
}

export interface IssueFields {
    summary: string;
    issuetype: IssueType;
}

export interface Issue {
    expand: string;
    id: string;
    self: string;
    key: string;
    fields: IssueFields;
}

export default Issue;