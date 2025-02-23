import { Http } from '@capacitor-community/http';
import { JiraAuth } from './JiraAuth';
import { Project } from './Project';
import { Version } from './Version';
import { Issue } from './Issue';
// Use the proxy '/jira' during development (Vite sets import.meta.env.DEV)
// and the real URL in production (or a native environment)
// const isDev = import.meta.env.DEV;
// const jiraBaseUrl = isDev ? '/jira' : 'https://terrestrialorigin.atlassian.net';
const isDev = import.meta.env.DEV;
const projectKey = 'RWCA';

export class JiraClient {
    private jiraAuth: JiraAuth;

    constructor(jiraAuth: JiraAuth) {
        this.jiraAuth = jiraAuth;
    }

    private getBaseUrl(): string {
        // In development, use the proxy
        if (isDev) {
            return '/jira';
        }
        // In production or Electron, use the actual URL
        return this.jiraAuth.jiraBaseUrl;
    }

    async getProjects(): Promise<Project[]> {
        const url = `${this.getBaseUrl()}/rest/api/2/project`;
        try {
            const response = await Http.get({
                url,
                headers: {
                    Authorization: 'Basic ' + btoa(`${this.jiraAuth.username}:${this.jiraAuth.apiToken}`)
                }
            });
            
            return response.data as Project[];
        } catch (error) {
            console.error("Error getting projects:", error);
            return [];
        }
    }

    async getVersions(projectKey: string): Promise<Version[]> {
        const url = `${this.getBaseUrl()}/rest/api/2/project/${projectKey}/versions`;
        try {
            const response = await Http.get({
                url,
                headers: {
                    Authorization: 'Basic ' + btoa(`${this.jiraAuth.username}:${this.jiraAuth.apiToken}`)
                }
            });

            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            console.log(`Versions: `, response.data);
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            return response.data
                .filter((version: any) => !version.archived)
                .map((version: any): Version => ({
                    id: version.id,
                    name: version.name,
                    released: version.released,
                    releaseDate: version.releaseDate,
                    plannedReleaseDate: version.userReleaseDate,
                    startDate: version.startDate,
                    jiraLink: version.self,
                    description: version.description,
                    archived: version.archived
                }))
                .sort((a: Version, b: Version) => {
                    // Sort by release date descending (newest first)
                    if (!a.releaseDate) return -1;
                    if (!b.releaseDate) return 1;
                    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                });
        } catch (error) {
            console.error("Error getting versions:", error);
            return [];
        }
    }

    async getTickets(fixVersion: string): Promise<Issue[]> {
        const jql = `project = ${projectKey} AND status = Done AND fixVersion = "${fixVersion}"`;
        console.log(`JQL: ${jql}`);
        const url = `${this.getBaseUrl()}/rest/api/2/search`;
        console.log(`URL: ${url}`);
        try {
            const response = await Http.get({
                url,
                params: {
                    jql,
                    fields: 'summary,issuetype'
                },
                headers: {
                    Authorization: 'Basic ' + btoa(`${this.jiraAuth.username}:${this.jiraAuth.apiToken}`)
                }
            });
            console.log(`Response: ${JSON.stringify(response)}`);
            const issues: Issue[] = response.data.issues;
            return issues.filter(issue => issue.fields.issuetype.name.toLowerCase() !== 'task');
        } catch (error) {
            console.error("Error getting tickets:", error);
            return [];
        }
    }
}

export default JiraClient;