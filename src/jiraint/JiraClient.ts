import { Http } from '@capacitor-community/http';
import { JiraAuth } from './JiraAuth';

// Use the proxy '/jira' during development (Vite sets import.meta.env.DEV)
// and the real URL in production (or a native environment)
// const isDev = import.meta.env.DEV;
// const jiraBaseUrl = isDev ? '/jira' : 'https://terrestrialorigin.atlassian.net';
const projectKey = 'RWCA';

export class JiraClient {
    private jiraAuth: JiraAuth;

    constructor(jiraAuth: JiraAuth) {
        this.jiraAuth = jiraAuth;
    }

    async getTickets(fixVersion: string) {
        const jql = `project = ${projectKey} AND status = Done AND fixVersion = "${fixVersion}"`;
        console.log(`JQL: ${jql}`);
        const url = `${this.jiraAuth.jiraBaseUrl}/rest/api/2/search`;
        console.log(`URL: ${url}`);
        const tickets: any[] = [];
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
            response.data.issues.forEach((issue: any) => {
                const type = issue.fields.issuetype.name.toLowerCase();
                if (type === 'task') return;
                let label = ''; 
                if (type === 'bug') label = ' (bug fix)';
                else if (type === 'story') label = ' (enhancement)';
                tickets.push({ key: issue.key, summary: issue.fields.summary + label });
            });
            return tickets;
        } catch (error) {
            console.error("Error getting tickets:", error);
        }
    }// end getTickets
}// end JiraClient

export default JiraClient;