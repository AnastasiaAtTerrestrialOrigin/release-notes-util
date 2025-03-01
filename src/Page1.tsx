import { useCallback, useRef, useState, useEffect, useContext } from 'react';
import Page2 from './Page2';
import { useNavigate } from 'react-router-dom';
import JiraClient from './jiraint/JiraClient';
import { JiraAuth } from './jiraint/JiraAuth';
import { Project } from './jiraint/Project';
import Version from './jiraint/Version';
import { Issue } from './jiraint/Issue';
import fillTemplate, { extractMergeFields } from './TemplateFiller';
import { Preview } from './Preview';
import { KeyValueStorageContext } from 'cross-platform-util';
import { useKeyValueStorage } from 'cross-platform-util';

const PAGE_NAME = 'Release Notes (JIRA Edition)';
const PAGE_PATH = '/page1';

import './theme.css';

export function Page1() {
    const storageType = useContext(KeyValueStorageContext);
    
    const [tickets, setTickets] = useState<Issue[]>([]);
    const [fixVersion, setFixVersion] = useState<string>('');
    const [projectKey, setProjectKey] = useState<string>('');
    const [jiraProjects, setJiraProjects] = useState<Project[]>([]);
    const [jiraVersionsAll, setJiraVersionsAll] = useState<Version[]>([]);
    const [jiraVersionsFiltered, setJiraVersionsFiltered] = useState<Version[]>([]);
    const [unreleasedOnly, setUnreleasedOnly] = useState<boolean>(true);
    const [showTicketNumber, setShowTicketNumber] = useState<boolean>(false);
    const [authSectionExpanded, setAuthSectionExpanded] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [jiraAuth, setJiraAuth] = useKeyValueStorage<JiraAuth>(storageType, 'jiraAuth', {
        jiraBaseUrl: '',
        username: '',
        apiToken: ''
    });
    const [ templatePreview, setTemplatePreview ] = useState<string>("");
    const [ mergeFields, setMergeFields ] = useState<Map<string, string>>(new Map());
    const [ autoFilledMergeFields, setAutoFilledMergeFields ] = useState<string[]>([]);

    useEffect(() => {
        console.log(`jiraAuth: ${JSON.stringify(jiraAuth)}`);
        jiraClientRef.current = new JiraClient(jiraAuth);
        if(jiraAuth) {
            const jiraClient = new JiraClient(jiraAuth);
            console.log('Fetching projects...');
            jiraClient.getProjects().then((projects) => {
                console.log('Got projects response:', projects);
                setJiraProjects(projects);
            }).catch(err => {
                console.error('Error fetching projects:', err);
                setError('Failed to fetch projects');
            });
        }
    }, [jiraAuth]);

    useEffect(() => {
        console.log('jiraProjects changed:', {
            value: jiraProjects,
            type: typeof jiraProjects,
            isArray: Array.isArray(jiraProjects),
            length: jiraProjects?.length
        });
        if(jiraProjects && projectKey) {
            const jiraClient = new JiraClient(jiraAuth);
            jiraClient.getVersions(projectKey).then((versions) => {   
                setJiraVersionsAll(versions);
            });
        }
    }, [jiraProjects, projectKey]);
    
    useEffect(() => {
        if(mergeFields && projectKey) {
            const templateText: string | null = storageType.storageGet('templateText' + projectKey);            
            setTemplatePreview(fillTemplate(templateText || '', mergeFields));
        }
    }, [mergeFields, projectKey])

    useEffect(() => {
        if(projectKey && fixVersion && tickets) {
            const templateText: string | null = storageType.storageGet('templateText' + projectKey);
            if(templateText) {
                const mergeFields = extractMergeFields(templateText);
                const newAutoFilledMergeFields: string[] = [];
                if(tickets?.length > 0) {
                    newAutoFilledMergeFields.push("tickets");
                    mergeFields.set("tickets", "\n* " + tickets.map((ticket) => renderTicketContent(ticket)).join('\n* '));
                }
                const version = jiraVersionsFiltered.find((version) => version.id === fixVersion);
                if(version) {
                    newAutoFilledMergeFields.push("fixVersion");
                    mergeFields.set("fixVersion", version?.name || '');
                    if(version?.releaseDate) {
                        newAutoFilledMergeFields.push("releaseDate");
                        mergeFields.set("releaseDate", version?.releaseDate ? new Date(version.releaseDate).toLocaleDateString() : '');
                    }
                    if(version?.plannedReleaseDate) {
                        newAutoFilledMergeFields.push("plannedReleaseDate");
                        mergeFields.set("plannedReleaseDate", version?.plannedReleaseDate ? new Date(version.plannedReleaseDate).toLocaleDateString() : '');
                    }
                }
                setMergeFields(mergeFields);
                setAutoFilledMergeFields(newAutoFilledMergeFields);
            }
        }
    }, [projectKey, fixVersion, tickets])

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
        navigate(Page2.path.replace(':projectKey', projectKey));
    }, [navigate, projectKey]);

    const renderTicketContent = (ticket: Issue) => {
        const ticketNumber = showTicketNumber ? `${ticket.key} - ` : '';
        const summary = ticket.fields.summary;
        const type = ticket.fields.issuetype.name.toLowerCase() === "bug" ? "Bug" : "Enhancement";
        return `${ticketNumber}${summary} (${type})`;
    };

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
            <span>* Note: API Token expires often, if you get errors, try going to JIRA and getting a new one.</span>
        </section>
        <div className="form-group">
            <label htmlFor="projectKey">Project: </label>
            <select id="projectKey" value={projectKey} onChange={(e) => setProjectKey(e.target.value)}>
                <option value="">Select Project</option>
                {(Array.isArray(jiraProjects) && jiraProjects.length > 0) ? 
                    jiraProjects.map((project) => (
                        <option key={project.key} value={project.key}>{project.name}</option>
                    ))
                    : <option value="" disabled>No projects available</option>
                }
            </select>
        </div>
        <div className="form-group">
            <label htmlFor="fixVersion">Unreleased Versions: </label>
            <select id="fixVersion" value={fixVersion} onChange={(e) => setVersion(e.target.value)}>
                <option value="">Select Version</option>
                {jiraVersionsFiltered?.map((version) => (
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
                    <li key={ticket.key}>{renderTicketContent(ticket)}</li>
                ))}
            </ul>
        </div>  
        {error && (
            <div>
                <label>Error: </label>
                <span>{error}</span>
            </div>
        )}
        <div>
            <label>Merge Fields: </label>
            {Array.from(mergeFields.entries()).map(([key, value]) => (
                autoFilledMergeFields.includes(key) ? null : (
                    <div className="form-group">
                        <label htmlFor={key}>{key}: </label>
                        <input type="text" id={key} value={value} onChange={(e) => {
                            mergeFields.set(key, e.target.value);
                            setMergeFields(new Map(mergeFields));
                        }} />
                    </div>
                )
            ))}
        </div>
        {templatePreview &&
            <Preview label="Preview">{templatePreview}</Preview>
        }
        {projectKey &&
            <button onClick={handleClick}>Edit templates for project {projectKey}</button>
        }
    </div>
    );
}
Page1.displayName = PAGE_NAME;
Page1.path = PAGE_PATH;

export default Page1;