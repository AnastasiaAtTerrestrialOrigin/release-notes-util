import Page2 from './Page2';
import { useNavigate } from 'react-router-dom';

const PAGE_NAME = 'Page1';
const PAGE_PATH = '/page1';

export function Page1() {
    const navigate = useNavigate();

    return (
    <div>
        <h1>{PAGE_NAME}</h1>
        <button onClick={() => navigate(Page2.path)}>Go to Page2</button>
    </div>
    );
}
Page1.displayName = PAGE_NAME;
Page1.path = PAGE_PATH;

export default Page1;