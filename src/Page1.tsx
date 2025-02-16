import { useCallback, useRef, useState, useEffect } from 'react';
import Page2 from './Page2';
import { useNavigate } from 'react-router-dom';
import JiraClient from './jiraint/JiraClient';
import { JiraAuth } from './jiraint/JiraAuth';
import { useStorage, LOCAL_STORAGE, ELECTRON_KEY_VALUE_STORAGE } from './util/Storage';
import { environmentCheck } from './util/EnvironmentHelper';
import { Project } from './jiraint/Project';
import Version from './jiraint/Version';
import { Issue } from './jiraint/Issue';

const PAGE_NAME = 'Jira Ticket Search';
const PAGE_PATH = '/page1';

import './theme.css';

export function Page1() {
    const [tickets, setTickets] = useState<Issue[]>([]);
    const [fixVersion, setFixVersion] = useState<string>('');
    const [projectKey, setProjectKey] = useState<string>('');
    const [jiraProjects, setJiraProjects] = useState<Project[]>([]);
    const [jiraVersionsAll, setJiraVersionsAll] = useState<Version[]>([]);
    const [jiraVersionsFiltered, setJiraVersionsFiltered] = useState<Version[]>([]);
    const [unreleasedOnly, setUnreleasedOnly] = useState<boolean>(true);
    const [showTicketNumber, setShowTicketNumber] = useState<boolean>(true);
    const [authSectionExpanded, setAuthSectionExpanded] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [jiraAuth, setJiraAuth] = useStorage<JiraAuth>(environmentCheck.isElectron ? ELECTRON_KEY_VALUE_STORAGE : LOCAL_STORAGE, 'jiraAuth', {
        jiraBaseUrl: '',
        username: '',
        apiToken: ''
    });

    useEffect(() => {
        console.log(`jiraAuth: ${JSON.stringify(jiraAuth)}`);
        jiraClientRef.current = new JiraClient(jiraAuth);
        if(jiraAuth) {
            const jiraClient = new JiraClient(jiraAuth);
            jiraClient.getProjects().then((projects) => {
                setJiraProjects(projects);
            });
        }
    }, [jiraAuth]);

    useEffect(() => {
        if(jiraProjects && projectKey) {
            const jiraClient = new JiraClient(jiraAuth);
            jiraClient.getVersions(projectKey).then((versions) => {   
                setJiraVersionsAll(versions);
            });
        }
    }, [jiraProjects, projectKey]);

    useEffect(() => {
        if(jiraVersionsAll) {
            if(unreleasedOnly) {
                setJiraVersionsFiltered(jiraVersionsAll.filter((version) => !version.released));
            } else {
                setJiraVersionsFiltered(jiraVersionsAll);
            }
        }
    }, [jiraVersionsAll, unreleasedOnly]);

    useEffect(() => {
        if(fixVersion) {
            jiraClientRef.current.getTickets(fixVersion).then((tickets) => {
                const ticketsFiltered = tickets.filter((ticket) => {
                    const type = ticket.fields.issuetype.name.toLowerCase();
                    return type !== 'task' && !ticket.fields.issuetype.subtask;
                });
                if (ticketsFiltered) setTickets(ticketsFiltered);
                else setError('Error getting tickets');
            });
        }
    }, [fixVersion]);

    const navigate = useNavigate();
    const jiraClientRef = useRef<JiraClient>(new JiraClient(jiraAuth));

    const setVersion = useCallback(async (version: string) => {
        setFixVersion(version);
    }, []);
    

    const handleClick = useCallback(() => {
        navigate(Page2.path);
    }, [navigate]);

    return (
    <div className="container">
        <h1>{PAGE_NAME}</h1>        
        <section id="jiraAuth">
            <div className="section-content" style={{display: authSectionExpanded ? 'block' : 'none'}}>
                <div className="form-group">
                    <label htmlFor="jiraBaseUrl">Jira URL: </label>
                    <input type="text" id="jiraBaseUrl" value={jiraAuth.jiraBaseUrl} onChange={(e) => setJiraAuth({...jiraAuth, jiraBaseUrl: e.target.value})} />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username: </label>
                    <input type="text" id="username" value={jiraAuth.username} onChange={(e) => setJiraAuth({...jiraAuth, username: e.target.value})} />
                </div>
                <div className="form-group">
                    <label htmlFor="apiToken">API Token: </label>
                    <input type="text" id="apiToken" value={jiraAuth.apiToken} onChange={(e) => setJiraAuth({...jiraAuth, apiToken: e.target.value})} />
                </div>
            </div>
            <div className="section-heading" onClick={() => setAuthSectionExpanded(!authSectionExpanded)}>{authSectionExpanded ? 'Hide' : 'Show'} Jira Authentication *</div>
            <span>* Note: API Token expires often, so you may need to refresh the page to get a new one.</span>
        </section>
        <div className="form-group">
            <label htmlFor="projectKey">Project: </label>
            <select id="projectKey" value={projectKey} onChange={(e) => setProjectKey(e.target.value)}>
                <option value="">Select Project</option>
                {jiraProjects.map((project) => (
                    <option key={project.key} value={project.key}>{project.name}</option>
                ))}
            </select>
        </div>
        <div className="form-group">
            <label htmlFor="fixVersion">Unreleased Versions: </label>
            <select id="fixVersion" value={fixVersion} onChange={(e) => setVersion(e.target.value)}>
                <option value="">Select Version</option>
                {jiraVersionsFiltered.map((version) => (
                    <option key={version.id} value={version.id}>{version.name}</option>
                ))}
            </select>
        </div>
        <div className="form-group">
            <input type="checkbox" id="unreleasedOnly" checked={unreleasedOnly} onChange={(e) => setUnreleasedOnly(e.target.checked)} />
            <label htmlFor="unreleasedOnly">Unreleased Only</label>
        </div>
        <div className="form-group">
            <input type="checkbox" id="showTicketNumber" checked={showTicketNumber} onChange={(e) => setShowTicketNumber(e.target.checked)} />
            <label htmlFor="showTicketNumber">Show Ticket Number</label>
        </div>
        <div>
            <label>Tickets: </label>
            <ul>
                {tickets.map((ticket) => (
                    <li key={ticket.key}>{showTicketNumber ? `${ticket.key} - ` : ''}{ticket.fields.summary} ({ticket.fields.issuetype.name.toLowerCase() === "bug" ? "Bug" : "Enhancement"})</li>
                ))}
            </ul>
        </div>  
        {error && (
            <div>
                <label>Error: </label>
                <span>{error}</span>
            </div>
        )}
        <button onClick={handleClick}>Go to Page2</button>
    </div>
    );
}
Page1.displayName = PAGE_NAME;
Page1.path = PAGE_PATH;

export default Page1;