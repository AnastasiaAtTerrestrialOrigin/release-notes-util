import Page1 from './Page1';
import { useNavigate } from 'react-router-dom';

const PAGE_NAME = 'Page2';
const PAGE_PATH = '/page2';

export function Page2() {
    const navigate = useNavigate();

    return (
    <div>
        <h1>{PAGE_NAME}</h1>
        <button onClick={() => navigate(Page1.path)}>Go to Page1</button>
    </div>
    );
}
Page2.displayName = PAGE_NAME;
Page2.path = PAGE_PATH;

export default Page2;