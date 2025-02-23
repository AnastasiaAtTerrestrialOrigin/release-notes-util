import { useCallback } from 'react';
import Page1 from './Page1';
import { useNavigate, useParams } from 'react-router-dom';
import { Preview } from './Preview';
import { environmentCheck } from 'terrestrial-util';
import { ELECTRON_KEY_VALUE_STORAGE } from 'terrestrial-util-electron';
import { LOCAL_STORAGE } from 'terrestrial-util';
import { useStorage } from 'terrestrial-util';

const PAGE_NAME = 'Templates';
const PAGE_PATH = '/page2/:projectKey';

export function Page2() {
    const storageType = environmentCheck.isElectron ? ELECTRON_KEY_VALUE_STORAGE : LOCAL_STORAGE;

    const navigate = useNavigate();
    const { projectKey } = useParams(); 

    const [templateText, setTemplateText] = useStorage<string>(storageType, 'templateText' + projectKey, '');
    
    const handleClick = useCallback(() => {
        navigate(Page1.path);
    }, [navigate]);

    return (
    <div className="container">
        <h1>{PAGE_NAME}</h1>
        <section>
            <label>For project: {projectKey}</label>

            <div className="form-group">
                <textarea rows={10} value={templateText} onChange={(e) => setTemplateText(e.target.value)}></textarea>
            </div>
            <Preview label="Preview">{templateText}</Preview>
        </section>

        <button onClick={handleClick}>Go to {Page1.displayName}</button>
    </div>
    );
}
Page2.displayName = PAGE_NAME;
Page2.path = PAGE_PATH;

export default Page2;