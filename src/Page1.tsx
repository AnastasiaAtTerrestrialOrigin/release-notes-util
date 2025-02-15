import { useCallback, useRef, useState, useEffect } from 'react';
import Page2 from './Page2';
import { useNavigate } from 'react-router-dom';
import JiraClient from './jiraint/JiraClient';
import { JiraAuth } from './jiraint/JiraAuth';
import { useStorage, LOCAL_STORAGE } from './util/Storage';
const PAGE_NAME = 'Page1';
const PAGE_PATH = '/page1';

export function Page1() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [fixVersion, setFixVersion] = useState<string>('');
    const [projectKey, setProjectKey] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [jiraAuth, setJiraAuth] = useStorage<JiraAuth>(LOCAL_STORAGE, 'jiraAuth', {
        jiraBaseUrl: '',
        username: '',
        apiToken: ''
    });

    const navigate = useNavigate();
    const jiraClientRef = useRef<JiraClient>(new JiraClient(jiraAuth));

    useEffect(() => {
        jiraClientRef.current = new JiraClient(jiraAuth);
    }, [jiraAuth]);

    const setVersion = useCallback(async (version: string) => {
        setFixVersion(version);
        if(version) {
            const tickets = await jiraClientRef.current.getTickets(version);
            if (tickets) setTickets(tickets);
            else setError('Error getting tickets');
        }
    }, []);
    

    const handleClick = useCallback(() => {
        navigate(Page2.path);
    }, [navigate]);

    const versionsInfo = (window as any).versions;

    return (
    <div>
        <h1>{PAGE_NAME}</h1>
        <div>
            <label>Node: </label>
            <span>{versionsInfo?.node() || 'N/A'}</span>
        </div>
        <div>
            <label>Jira URL: </label>
            <input type="text" value={jiraAuth.jiraBaseUrl} onChange={(e) => setJiraAuth({...jiraAuth, jiraBaseUrl: e.target.value})} />
        </div>
        <div>
            <label>Username: </label>
            <input type="text" value={jiraAuth.username} onChange={(e) => setJiraAuth({...jiraAuth, username: e.target.value})} />
        </div>
        <div>
            <label>API Token: </label>
            <input type="text" value={jiraAuth.apiToken} onChange={(e) => setJiraAuth({...jiraAuth, apiToken: e.target.value})} />
        </div>
        <div>
            <label>Project Key: </label>
            <input type="text" value={projectKey} onChange={(e) => setProjectKey(e.target.value)} />
        </div>
        <div>
            <label>Fix Version: </label>
            <input type="text" value={fixVersion} onChange={(e) => setVersion(e.target.value)} />
        </div>
        <div>
            <label>Tickets: </label>
            <ul>
                {tickets.map((ticket) => (
                    <li key={ticket.key}>{ticket.key} - {ticket.summary}</li>
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