import { useCallback, useContext } from 'react';
import Page1 from './Page1';
import { useNavigate, useParams } from 'react-router-dom';
import { Preview } from './Preview';
import { KeyValueStorageContext } from 'cross-platform-util';
import { useKeyValueStorage } from 'cross-platform-util';

const PAGE_NAME = 'Templates';
const PAGE_PATH = '/page2/:projectKey';

export function Page2() {
    const storageType = useContext(KeyValueStorageContext);

    const navigate = useNavigate();
    const { projectKey } = useParams(); 

    const [templateText, setTemplateText] = useKeyValueStorage<string>(storageType, 'templateText' + projectKey, '');
    
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